import { validationResult } from 'express-validator';
import Store from '../models/Store.js';
import StoreRating from '../models/StoreRating.js';
import { serializeStore } from '../utils/serializers.js';

const syncStoreRatingAggregate = async (storeId) => {
  // Recompute from source-of-truth ratings to avoid aggregate drift under concurrent writes.
  const [summary] = await StoreRating.aggregate([
    { $match: { storeId } },
    {
      $group: {
        _id: '$storeId',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  const rating = summary ? Math.round(summary.averageRating * 10) / 10 : 0;
  const totalRatings = summary?.totalRatings || 0;

  await Store.updateOne(
    { _id: storeId },
    {
      $set: {
        rating,
        totalRatings,
      },
    }
  );

  return { rating, totalRatings };
};

// @desc    Apply for store registration
// @route   POST /api/stores
// @access  Private
export const applyForStore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Pre-flight check: Prevent users from making a second store application
    const existingStore = await Store.findOne({ ownerId: req.user._id });

    if (existingStore) {
      return res.status(400).json({ 
        success: false, 
        message: 'Store already exists for this account' 
      });
    }

    const { name, address, state, city } = req.body;
    const phone = (req.body.phone || '').replace(/\D/g, ''); 
    if (phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      });
    }

    const store = await Store.create({
      name: name.trim(),
      address: address.trim(),
      state: state.toLowerCase().trim(),
      city: city.toLowerCase().trim(),
      phone,
      ownerId: req.user._id, // Tied strictly to the authenticated token
      status: 'pending',     // Fixed security default to override malicious inputs
    });

    return res.status(201).json({
      success: true,
      message: 'Store application submitted successfully. Pending admin approval.',
      data: serializeStore(store),
    });
  } catch (error) {
    // Race-condition fallback: 11000 Unique index on ownerId
    if (error.code === 11000) {
       return res.status(400).json({ success: false, message: 'You already have a store assigned to this account.' });
    }
    console.error('[Store Application Error]', error);
    return res.status(500).json({ success: false, message: 'Server error during store registration' });
  }
};

// @desc    Get all active/approved stores (with basic pagination & filter)
// @route   GET /api/stores
// @access  Public
export const getStores = async (req, res) => {
  try {
    // Enforcing your architecture: Pagination and 'Approved' default status
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const query = { status: 'approved' }; 

    // Enable frontend to easily filter stores by city
    if (req.query.city) {
      query.city = req.query.city.toLowerCase().trim();
    }

    const stores = await Store.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Store.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: stores.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: stores.map((store) => serializeStore(store)),
    });
  } catch (error) {
    console.error('[Get Stores Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching stores' });
  }
};

// @desc    Get the authenticated user's store
// @route   GET /api/stores/me
// @access  Private
export const getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user._id });

    if (!store) {
      return res.status(404).json({ success: false, message: 'No store found for this account' });
    }

    return res.status(200).json({ success: true, data: serializeStore(store) });
  } catch (error) {
    console.error('[Get My Store Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching your store' });
  }
};

// @desc    Create or update the authenticated user's rating for a store
// @route   POST /api/stores/:id/ratings
// @access  Private
export const submitStoreRating = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const store = await Store.findOne({
      _id: req.params.id,
      status: 'approved',
    }).select('_id ownerId');

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found or not available for rating' });
    }

    if (store.ownerId.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot rate your own store' });
    }

    const ratingValue = req.body.rating;

    const result = await StoreRating.updateOne(
      {
        storeId: store._id,
        userId: req.user._id,
      },
      {
        $set: {
          rating: ratingValue,
        },
      },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    const ratingSummary = await syncStoreRatingAggregate(store._id);
    const isNewRating = result.upsertedCount > 0;

    return res.status(isNewRating ? 201 : 200).json({
      success: true,
      message: isNewRating ? 'Store rating submitted successfully' : 'Store rating updated successfully',
      data: {
        storeId: store._id,
        myRating: ratingValue,
        rating: ratingSummary.rating,
        totalRatings: ratingSummary.totalRatings,
      },
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Store not found (Invalid ID)' });
    }
    console.error('[Submit Store Rating Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while saving the store rating' });
  }
};

// @desc    Get single store by ID
// @route   GET /api/stores/:id
// @access  Public
export const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Security check: Only return 'approved' stores to the public.
    // However, if the store owner is viewing it, allow them to see their 'pending'/'rejected' stats.
    if (store.status !== 'approved') {
      const isOwner = req.user && req.user._id.toString() === store.ownerId.toString();
      const isAdmin = req.user && req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        // Masking the actual pending state with a 404 for security
        return res.status(404).json({ success: false, message: 'Store not found or still pending approval' }); 
      }
    }

    let viewerRating;
    if (req.user && store.status === 'approved') {
      const existingRating = await StoreRating.findOne({
        storeId: store._id,
        userId: req.user._id,
      }).select('rating');

      viewerRating = existingRating?.rating;
    }

    return res.status(200).json({
      success: true,
      data: serializeStore(store, { viewerRating }),
    });
  } catch (error) {
    // Handle specific mongoose cast error (invalid ID format gracefully)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Store not found (Invalid ID)' });
    }
    console.error('[Get Single Store Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching the store' });
  }
};
