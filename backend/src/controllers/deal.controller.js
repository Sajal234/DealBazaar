import { validationResult } from 'express-validator';
import cloudinary from '../config/cloudinary.js';
import Deal from '../models/Deal.js';
import Store from '../models/Store.js';
import { destroyCloudinaryAssets } from '../utils/cloudinaryAssets.js';
import { serializeDeal } from '../utils/serializers.js';

// Helper function to upload multer memory buffer directly to Cloudinary via stream
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'dealbazaar_deals' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

const findOwnedStore = async (userId) => Store.findOne({ ownerId: userId });
const allowedDealStatuses = new Set(['pending', 'active', 'expired', 'rejected']);
const CLICK_DEDUPE_WINDOW_MS = 30 * 1000;
const recentDealClickCache = new Map();

const normalizeOwnedDealUpdate = (body) => {
  const updateFields = {};

  if (body.productName !== undefined) {
    const productName = String(body.productName).trim();
    if (!productName) {
      return { error: 'Product name cannot be empty' };
    }
    updateFields.productName = productName;
  }

  if (body.description !== undefined) {
    const description = String(body.description).trim();
    if (!description) {
      return { error: 'Description cannot be empty' };
    }
    updateFields.description = description;
  }

  if (body.price !== undefined) {
    const parsedPrice = Number(body.price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return { error: 'Price must be a valid positive number' };
    }
    updateFields.price = parsedPrice;
  }

  if (body.city !== undefined) {
    const city = String(body.city).trim();
    if (!city) {
      return { error: 'City cannot be empty' };
    }
    updateFields.city = city.toLowerCase();
  }

  return { updateFields };
};

const getDealClickActor = (req) => req.user?._id?.toString() || `ip:${req.ip || 'unknown'}`;

const getDealClickCacheKey = (req) => `deal:${req.params.id}:actor:${getDealClickActor(req)}`;

const hasRecentTrackedClick = (key) => {
  const expiresAt = recentDealClickCache.get(key);

  if (!expiresAt) {
    return false;
  }

  if (expiresAt <= Date.now()) {
    recentDealClickCache.delete(key);
    return false;
  }

  return true;
};

const markTrackedClick = (key) => {
  recentDealClickCache.set(key, Date.now() + CLICK_DEDUPE_WINDOW_MS);
};

const clearTrackedClick = (key) => {
  recentDealClickCache.delete(key);
};

// @desc    Create a new deal
// @route   POST /api/deals
// @access  Private (Store Owners Only)
export const createDeal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  let imagePublicIds = [];
  try {
    // 1. Verify user actually owns an approved Store
    const store = await Store.findOne({ ownerId: req.user._id });

    if (!store) {
      return res.status(404).json({ success: false, message: 'No store found for your account. Please create one first.' });
    }

    if (store.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Your store is not approved yet. Cannot post deals.' });
    }

    const { productName, description, price, city } = req.body;
    
    // 2. Extract and Upload Images to Cloudinary (from Memory Buffer)
    const imagesUrls = [];

    // req.files is populated safely by multer upload.array('images', 5) in our routes
    if (req.files && req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 images allowed'
      });
    }

    if (req.files && req.files.length > 0) {
      
      let uploaded = [];

      try {
        const results = await Promise.all(
          req.files.map(async (file) => {
            const res = await streamUpload(file.buffer);
            uploaded.push(res.public_id);
            return res;
          })
        );

        results.forEach((r) => {
          imagesUrls.push(r.secure_url);
          imagePublicIds.push(r.public_id);
        });

      } catch (err) {
        const { failures } = await destroyCloudinaryAssets(uploaded);
        if (failures.length > 0) {
          console.error('[Deal Upload Rollback Error]', {
            failures,
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Image upload failed'
        });
      }
    }

    const parsedPrice = Number(price);

    if (isNaN(parsedPrice)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price value'
      });
    }

    // 3. Complete strictly-typed Deal insert
    const deal = await Deal.create({
      storeId: store._id,
      productName: productName.trim(),
      description: description.trim(),
      price: parsedPrice,
      city: city && city.trim() ? city.toLowerCase().trim() : store.city, // Default mapping to store city
      images: imagesUrls,
      imagePublicIds: imagePublicIds,
      status: 'pending', // Enforcing baseline admin architecture
    });

    return res.status(201).json({
      success: true,
      data: serializeDeal(deal),
      message: 'Deal securely submitted. Pending admin approval.',
    });
  } catch (error) {
    console.error('[Deal Creation Error]', error);
    if (imagePublicIds.length > 0) {
      const { failures } = await destroyCloudinaryAssets(imagePublicIds);
      if (failures.length > 0) {
        console.error('[Deal Creation Rollback Error]', {
          failures,
        });
      }
    }
    return res.status(500).json({ success: false, message: 'Server error during deal creation' });
  }
};

// @desc    Get deals belonging to the authenticated store owner
// @route   GET /api/deals/mine
// @access  Private
export const getMyDeals = async (req, res) => {
  try {
    const store = await findOwnedStore(req.user._id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'No store found for this account' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;
    const query = {
      storeId: store._id,
      isDeleted: false,
    };

    if (req.query.status) {
      if (!allowedDealStatuses.has(req.query.status)) {
        return res.status(400).json({ success: false, message: 'Invalid deal status filter' });
      }
      query.status = req.query.status;
    }

    const deals = await Deal.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Deal.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: deals.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: deals.map((deal) => serializeDeal(deal, { includeMetrics: true, includeLifecycle: true })),
    });
  } catch (error) {
    console.error('[Get My Deals Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching your deals' });
  }
};

// @desc    Get all active deals
// @route   GET /api/deals
// @access  Public
export const getDeals = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50); // Hard CAP against DoS
    const skip = (page - 1) * limit;

    // Strict baseline query scope
    let query = { status: 'active', isDeleted: false };

    // Leverage your Compound Index: City
    if (req.query.city) {
      query.city = req.query.city.toLowerCase().trim();
    }

    // Leverage your Compound Index: storeId
    if (req.query.storeId) {
      query.storeId = req.query.storeId;
    }

    // Leverage your Text Index search wrapper
    if (req.query.search) {
      query.$text = { $search: req.query.search.trim() };
    }

    // Utilize optimized `.populate` to safely return store contact metadata without leaking ownerId mapping natively
    const deals = await Deal.find(query)
      .select('storeId productName description price city images status createdAt updatedAt')
      .populate('storeId', 'name address city phone rating totalRatings isVerified')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Deal.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: deals.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: deals.map((deal) => serializeDeal(deal)),
    });
  } catch (error) {
    console.error('[Get Deals Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching deals' });
  }
};

// @desc    Update a deal owned by the authenticated store owner
// @route   PATCH /api/deals/:id
// @access  Private
export const updateDeal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const store = await findOwnedStore(req.user._id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'No store found for this account' });
    }

    if (store.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Your store is not approved yet.' });
    }

    const deal = await Deal.findOne({
      _id: req.params.id,
      storeId: store._id,
      isDeleted: false,
    });

    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    const { updateFields, error } = normalizeOwnedDealUpdate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: 'Provide at least one field to update' });
    }

    const updatedDeal = await Deal.findOneAndUpdate(
      { _id: deal._id },
      {
        $set: {
          ...updateFields,
          status: 'pending',
        },
        $unset: {
          expiresAt: 1,
          cleanupAt: 1,
          lastVerifiedAt: 1,
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message:
        deal.status === 'pending'
          ? 'Deal updated successfully.'
          : 'Deal updated and sent back for admin review.',
      data: serializeDeal(updatedDeal, { includeMetrics: true, includeLifecycle: true }),
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Invalid Deal ID string' });
    }
    console.error('[Update Deal Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while updating the deal' });
  }
};

// @desc    Resubmit a rejected or expired deal for admin review
// @route   PATCH /api/deals/:id/resubmit
// @access  Private
export const resubmitDeal = async (req, res) => {
  try {
    const store = await findOwnedStore(req.user._id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'No store found for this account' });
    }

    if (store.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Your store is not approved yet.' });
    }

    const deal = await Deal.findOne({
      _id: req.params.id,
      storeId: store._id,
      isDeleted: false,
    });

    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    if (!['rejected', 'expired'].includes(deal.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only rejected or expired deals can be resubmitted',
      });
    }

    const updatedDeal = await Deal.findOneAndUpdate(
      { _id: deal._id },
      {
        $set: { status: 'pending' },
        $unset: { cleanupAt: 1, expiresAt: 1, lastVerifiedAt: 1 },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Deal resubmitted successfully. Pending admin approval.',
      data: serializeDeal(updatedDeal, { includeMetrics: true, includeLifecycle: true }),
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Invalid Deal ID string' });
    }
    console.error('[Resubmit Deal Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while resubmitting the deal' });
  }
};

// @desc    Track click-through intent on an active public deal
// @route   POST /api/deals/:id/click
// @access  Public
export const trackDealClick = async (req, res) => {
  try {
    const cacheKey = getDealClickCacheKey(req);

    if (hasRecentTrackedClick(cacheKey)) {
      return res.status(204).end();
    }

    // Reserve the dedupe slot before the async DB call to prevent same-process double counts.
    markTrackedClick(cacheKey);

    const result = await Deal.updateOne(
      {
        _id: req.params.id,
        status: 'active',
        isDeleted: false,
      },
      {
        $inc: { clicks: 1 },
      }
    );

    if (result.matchedCount === 0) {
      clearTrackedClick(cacheKey);
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    return res.status(204).end();
  } catch (error) {
    clearTrackedClick(getDealClickCacheKey(req));
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Invalid Deal ID string' });
    }
    console.error('[Track Deal Click Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while tracking deal click' });
  }
};

// @desc    Get single deal by ID
// @route   GET /api/deals/:id
// @access  Public
export const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id).populate(
      'storeId',
      'name address city phone rating totalRatings isVerified ownerId'
    );

    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    // Core validation: Only return active deals to normal unauthenticated users
    if (deal.status !== 'active') {
      const isOwner = req.user && req.user._id.toString() === deal.storeId.ownerId.toString();
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
         // Return 404 to explicitly hide existence of pending models from malicious probing
         return res.status(404).json({ success: false, message: 'Deal not found or inactive' });
      }
    }

    // Explicit Trust-System architecture: Track metrics completely detached from main read (non-blocking)
    if (deal.status === 'active') {
      Deal.findByIdAndUpdate(deal._id, {
        $inc: { views: 1 }
      }).catch(err => console.error('[View Update Error]', err));
    }

    return res.status(200).json({ success: true, data: serializeDeal(deal) });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Invalid Deal ID string' });
    }
    console.error('[Get Deal By ID Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching deal' });
  }
};
