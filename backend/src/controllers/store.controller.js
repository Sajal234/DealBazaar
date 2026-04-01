import { validationResult } from 'express-validator';
import Store from '../models/Store.js';

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
      data: store,
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
      query.city = req.query.city.toLowerCase();
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
      data: stores,
    });
  } catch (error) {
    console.error('[Get Stores Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching stores' });
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
      
      if (!isOwner) {
        // Masking the actual pending state with a 404 for security
        return res.status(404).json({ success: false, message: 'Store not found or still pending approval' }); 
      }
    }

    return res.status(200).json({ success: true, data: store});
  } catch (error) {
    // Handle specific mongoose cast error (invalid ID format gracefully)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Store not found (Invalid ID)' });
    }
    console.error('[Get Single Store Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching the store' });
  }
};
