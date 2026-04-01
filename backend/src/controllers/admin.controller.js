import Store from '../models/Store.js';
import Deal from '../models/Deal.js';

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

    const store = await Store.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
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

    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    );

    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
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
