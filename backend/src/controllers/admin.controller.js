import Store from '../models/Store.js';
import Deal from '../models/Deal.js';
import { serializeDeal, serializeStore } from '../utils/serializers.js';

// @desc    List pending store applications
// @route   GET /api/admin/stores/pending
// @access  Private (Admin Only)
export const listPendingStores = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;
    const query = { status: 'pending' };

    const stores = await Store.find(query)
      .select('name address state city phone status isVerified rating totalRatings ownerId createdAt updatedAt')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 });

    const total = await Store.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: stores.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: stores.map((store) => serializeStore(store, { includeOwnerId: true })),
    });
  } catch (error) {
    console.error('[List Pending Stores Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching pending stores' });
  }
};

// @desc    List pending deals awaiting moderation
// @route   GET /api/admin/deals/pending
// @access  Private (Admin Only)
export const listPendingDeals = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;
    const query = { status: 'pending', isDeleted: false };

    const deals = await Deal.find(query)
      .select(
        'storeId productName description price city images imagePublicIds status views clicks expiresAt lastVerifiedAt cleanupAt isDeleted createdAt updatedAt'
      )
      .populate('storeId', 'name address city phone rating totalRatings isVerified')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 });

    const total = await Deal.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: deals.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: deals.map((deal) =>
        serializeDeal(deal, {
          includeMetrics: true,
          includeLifecycle: true,
          includeImagePublicIds: true,
        })
      ),
    });
  } catch (error) {
    console.error('[List Pending Deals Error]', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching pending deals' });
  }
};

// @desc    Approve or Reject a Store Application
// @route   PATCH /api/admin/stores/:id/status
// @access  Private (Admin Only)
export const updateStoreStatus = async (req, res) => {
  const { status } = req.body; 
  
  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ success: false, message: "Status must strictly be 'approved' or 'rejected'" });
  }

  try {
    
    let updatePayload = { status };

    if (status === 'approved') {
      updatePayload.isVerified = true;
    } else {
      updatePayload.isVerified = false;
    }

    const store = await Store.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!store) {
      return res.status(400).json({
        success: false,
        message: 'Store already processed by another admin or does not exist'
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Store successfully marked as ${status}` 
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Invalid Store ID string' });
    }
    console.error('[Admin Store Update Error]', error);
    return res.status(500).json({ success: false, message: 'Server error updating store status' });
  }
};

// @desc    Approve or Reject a Deal (triggers Trust mapping & Cleanup Scheduling)
// @route   PATCH /api/admin/deals/:id/status
// @access  Private (Admin Only)
export const updateDealStatus = async (req, res) => {
  const { status, hoursValid } = req.body;

  if (status !== 'active' && status !== 'rejected') {
    return res.status(400).json({ success: false, message: "Deal status must strictly be 'active' or 'rejected'" });
  }

  try {
    let updatePayload;

    if (status === 'active') {

      if (hoursValid !== undefined) {
        const parsed = parseInt(hoursValid, 10);

        if (isNaN(parsed)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid hoursValid value'
          });
        }
      }
      const parsed = parseInt(hoursValid, 10);
      const validHours = Math.min(Math.max(parsed || 48, 1), 72);
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + validHours);

      updatePayload = {
        status,
        expiresAt: expiry,
        lastVerifiedAt: new Date(),
        $unset: { cleanupAt: 1 }
      };
    } else {
      const cleanup = new Date();
      cleanup.setHours(cleanup.getHours() + 72);

      updatePayload = {
        status,
        cleanupAt: cleanup,
        $unset: { expiresAt: 1, lastVerifiedAt: 1 }
      };
    }

    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      updatePayload,
      { new: true }
    );

    if (!deal) {
      return res.status(400).json({
        success: false,
        message: 'Deal already processed by another admin or does not exist'
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Deal securely marked as ${status}` 
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Invalid Deal ID string' });
    }
    console.error('[Admin Deal Update Error]', error);
    return res.status(500).json({ success: false, message: 'Server error updating deal status' });
  }
};
