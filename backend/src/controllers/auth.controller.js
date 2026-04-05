import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

// Helper to generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const serializeAuthUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  // Check for validation errors produced by express-validator mapped in the routes
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    // Defensive: Reject any attempt to set a role during signup
    // Enforcing architectural rule: No role input from frontend
    if (req.body.role) {
      return res.status(403).json({ 
        success: false, 
        message: 'Role assignment is strictly forbidden during signup' 
      });
    }

    const normalizedEmail = email.toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'user', // Forced default
    });

    if (user) {
      return res.status(201).json({
        success: true,
        data: {
          ...serializeAuthUser(user),
          token: generateToken(user._id),
        },
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid user data received' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    console.error('[Signup Error]', error);
    return res.status(500).json({ success: false, message: 'Server error during signup' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Explicit select('+password') since we hid it by default in the User schema
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        data: {
          ...serializeAuthUser(user),
          token: generateToken(user._id),
        },
      });
    }

    // Generalized error message to prevent exposure of correct emails vs passwords
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get user profile (current user)
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: serializeAuthUser(req.user),
    });
  } catch (error) {
    console.error('[GetMe Error]', error);
    return res.status(500).json({ success: false, message: 'Server error during profile fetch' });
  }
};

// @desc    Change the authenticated user's password
// @route   PATCH /api/auth/password
// @access  Private
export const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account no longer exists' });
    }

    const isCurrentPasswordValid = await user.matchPassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const isSamePassword = await user.matchPassword(newPassword);

    if (isSamePassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from your current password' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      data: {
        ...serializeAuthUser(user),
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('[Change Password Error]', error);
    return res.status(500).json({ success: false, message: 'Server error during password update' });
  }
};
