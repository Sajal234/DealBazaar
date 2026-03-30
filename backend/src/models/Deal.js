import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    productName: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
      max: 10000000,
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
      trim: true,
      lowercase: true,
    },
    images: {
      type: [String],
      validate: [imgArrayLimit, 'A deal can have a maximum of 5 images'],
      default: [],
    },
    imagePublicIds: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'rejected'],
      default: 'pending',
    },
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date, // Set ONLY on admin approval (48-72 hrs)
    },
    lastVerifiedAt: {
      type: Date, // Updated when admin approves or store updates
    },
    cleanupAt: {
      type: Date, // Set to current time + 72 hours when status becomes expired/rejected
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
  }
);

// Helper function for the mongoose validator
function imgArrayLimit(val) {
  return val.length <= 5;
}

// Safety check to ensure arrays align perfectly for Cloudinary cleanup mapping
dealSchema.pre('save', function (next) {
  if (this.images.length !== this.imagePublicIds.length) {
    return next(new Error('Images and imagePublicIds array lengths must match'));
  }
  next();
});

// Performance optimization indexes as prescribed by your architectural plan
dealSchema.index({ productName: 'text', description: 'text' });
dealSchema.index({ city: 1 });
dealSchema.index({ storeId: 1 });
dealSchema.index({ status: 1, expiresAt: 1 });
dealSchema.index({ cleanupAt: 1 });

const Deal = mongoose.model('Deal', dealSchema);

export default Deal;
