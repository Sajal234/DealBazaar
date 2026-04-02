import { validationResult } from 'express-validator';
import cloudinary from '../config/cloudinary.js';
import Deal from '../models/Deal.js';
import Store from '../models/Store.js';

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

// @desc    Create a new deal
// @route   POST /api/deals
// @access  Private (Store Owners Only)
export const createDeal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

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
    const imagePublicIds = [];

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
        await Promise.all(
          uploaded.map(id => cloudinary.uploader.destroy(id))
        );

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
      data: deal,
      message: 'Deal securely submitted. Pending admin approval.',
    });
  } catch (error) {
    console.error('[Deal Creation Error]', error);
    if (imagePublicIds.length > 0) {
      await Promise.allSettled(
        imagePublicIds.map(id => cloudinary.uploader.destroy(id))
      );
    }
    return res.status(500).json({ success: false, message: 'Server error during deal creation' });
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
      .select('-imagePublicIds -cleanupAt -isDeleted') // DTO stripping
      .populate('storeId', 'name address phone rating isVerified')
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
      data: deals,
    });
  } catch (error) {
    console.error('[Get Deals Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching deals' });
  }
};

// @desc    Get single deal by ID
// @route   GET /api/deals/:id
// @access  Public
export const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id).populate('storeId', 'name address phone rating isVerified ownerId');

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

    const dealDTO = deal.toObject();
    delete dealDTO.imagePublicIds;
    delete dealDTO.cleanupAt;
    delete dealDTO.isDeleted;
    // Ensure storeId.ownerId is detached from the DTO payload
    if (dealDTO.storeId) {
      delete dealDTO.storeId.ownerId;
    }

    return res.status(200).json({ success: true, data: dealDTO });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Invalid Deal ID string' });
    }
    console.error('[Get Deal By ID Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching deal' });
  }
};
