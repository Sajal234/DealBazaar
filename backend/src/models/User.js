import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      maxlength: 100,
      select: false, 
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'store', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true, 
  }
);

// Pre-save middleware to securely hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to verify passwords during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (!this.passwordChangedAt || !jwtIssuedAt) {
    return false;
  }

  const passwordChangedAtSeconds = Math.floor(this.passwordChangedAt.getTime() / 1000);

  return passwordChangedAtSeconds > jwtIssuedAt;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
