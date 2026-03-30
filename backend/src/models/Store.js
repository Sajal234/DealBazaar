import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a store name'],
      trim: true,
      maxlength: 100,
    },
    address: {
      type: String,
      required: [true, 'Please provide a store address'],
      maxlength: 300,
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Please provide a state'],
      trim: true,
      lowercase: true
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      maxlength: 20,
      match: [/^[0-9]{10}$/, 'Please add a valid phone number']
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Specific constraint: one store per user initially
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: val => Math.round(val * 10) / 10
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for querying stores quickly
storeSchema.index({ ownerId: 1 });
storeSchema.index({ city: 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ name: "text", city: "text" });

const Store = mongoose.model('Store', storeSchema);

export default Store;
