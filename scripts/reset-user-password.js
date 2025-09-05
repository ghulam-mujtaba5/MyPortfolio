// Usage: node scripts/reset-user-password.js "email@example.com" "NewSecurePassword!"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });
const bcrypt = require('bcryptjs');
const dbConnect = require('../lib/mongoose.js').default;
const User = require('../models/User.js').default;

async function main() {
  const [email, newPassword] = process.argv.slice(2);
  if (!email || !newPassword) {
    console.error('Error: Please provide email and new password.');
    console.error('Usage: node scripts/reset-user-password.js "email@example.com" "NewSecurePassword!"');
    process.exit(1);
  }

  try {
    await dbConnect();

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(2);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    console.log(`Password reset successful for ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset password:', err?.message || err);
    process.exit(3);
  }
}

main();
