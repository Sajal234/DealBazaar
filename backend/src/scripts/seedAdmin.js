import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Explicitly load .env variables manually since we are running this script entirely independently of the server
dotenv.config();

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is strictly required but not defined in your environment variables.');
    }

    console.log('[Seed Engine] Booting MongoDB connection...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed Engine] MongoDB Connected Successfully.');

    // Enforce environment overrides to dynamically inject Production superusers via CLI later
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dealbazaar.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SuperSecretAdmin123!';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    // Security Check: Attempt to locate exact matches
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log(`[Seed Engine] Administrator account securely mapped and verified for: ${adminEmail}`);
        console.log(`[Seed Engine] Operation Skipped. Exiting.`);
        process.exit(0);
      } else {
        // Upgrade Edge Case: Upgrades the role in case the founder registered it normally by accident
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`[Seed Engine] Successfully upgraded standard user ${adminEmail} to Administrator role!`);
        process.exit(0);
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
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Engine Fatal Error]', error);
    process.exit(1);
  }
};

seedAdmin();
