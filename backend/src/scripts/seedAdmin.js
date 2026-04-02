import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Explicitly load .env variables manually since we are running this script entirely independently of the server
dotenv.config();

const getRequiredEnv = (key, options = {}) => {
  const { trim = true } = options;
  const rawValue = process.env[key];
  const value = trim ? rawValue?.trim() : rawValue;

  if (!value) {
    throw new Error(`${key} is required for admin seeding.`);
  }

  return value;
};

const seedAdmin = async () => {
  try {
    const mongoUri = getRequiredEnv('MONGO_URI');
    const adminEmail = getRequiredEnv('ADMIN_EMAIL').toLowerCase();
    const adminPassword = getRequiredEnv('ADMIN_PASSWORD', { trim: false });
    const adminName = process.env.ADMIN_NAME?.trim() || 'System Administrator';

    console.log('[Seed Engine] Booting MongoDB connection...');
    await mongoose.connect(mongoUri);
    console.log('[Seed Engine] MongoDB Connected Successfully.');

    // Security Check: Attempt to locate exact matches
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log(`[Seed Engine] Administrator account securely mapped and verified for: ${adminEmail}`);
        console.log(`[Seed Engine] Operation Skipped. Exiting.`);
        return;
      } else {
        // Upgrade Edge Case: Upgrades the role in case the founder registered it normally by accident
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`[Seed Engine] Successfully upgraded standard user ${adminEmail} to Administrator role!`);
        return;
      }
    }

    // Provision the brand new superuser safely bypassing route validations
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log(`[Seed Engine] Success! Provisioned highly secure Administrator Account: ${adminEmail}`);
  } catch (error) {
    console.error('[Seed Engine Fatal Error]', error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

seedAdmin();
