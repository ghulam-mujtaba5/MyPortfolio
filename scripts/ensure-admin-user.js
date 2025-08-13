// Usage: node scripts/ensure-admin-user.js "email@example.com" "StrongPassword!" "Admin Name"
// Ensures an admin user exists (creates or updates password + role).

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });
const bcrypt = require('bcryptjs');
const dbConnect = require('../lib/mongoose.js').default;
const User = require('../models/User.js').default;

async function main() {
  const [email, password, nameArg] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Error: Please provide email and password. Optionally provide a name.');
    console.error('Usage: node scripts/ensure-admin-user.js "email@example.com" "StrongPassword!" "Admin Name"');
    process.exit(1);
  }

  const name = nameArg || 'Administrator';

  try {
    await dbConnect();

    let user = await User.findOne({ email }).select('+password');
    const hashed = await bcrypt.hash(password, 10);

    if (!user) {
      user = new User({ name, email, password: hashed, role: 'admin' });
      await user.save();
      console.log(`Created new admin user: ${email}`);
    } else {
      user.password = hashed;
      user.role = 'admin';
      if (!user.name) user.name = name;
      await user.save();
      console.log(`Updated existing user to admin and reset password: ${email}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to ensure admin user:', err?.message || err);
    process.exit(2);
  }
}

main();
