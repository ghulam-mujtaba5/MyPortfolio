// scripts/create-admin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/User").default;

dotenv.config({ path: ".env.local" });

const createAdmin = async () => {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: node scripts/create-admin.js <email> <password>");
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected...");

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.role = "admin"; // Ensure role is admin
      await existingUser.save();
      console.log(`Admin user with email ${email} was updated successfully.`);
    } else {
      const newUser = new User({
        name: "Admin",
        email: email,
        password: hashedPassword,
        role: "admin",
      });
      await newUser.save();
      console.log(`Admin user created successfully with email: ${email}`);
    }
  } catch (err) {
    console.error("Admin creation failed:", err.message);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

createAdmin();
