import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Keep connection attempts bounded to avoid long serverless hangs
      serverSelectionTimeoutMS: 7000, // fail fast if cluster unreachable
      socketTimeoutMS: 20000, // drop stalled operations
      connectTimeoutMS: 7000,
      maxPoolSize: 5,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("Successfully connected to MongoDB");
        return mongooseInstance;
      })
      .catch((err) => {
        // Reset cached promise so we can retry on the next request
        cached.promise = null;

        // Log detailed error and provide user-friendly message
        console.error("MongoDB connection error:", err?.name || err?.code || err?.message || err);
        
        // Check for specific error types
        if (err.name === 'MongooseServerSelectionError') {
          console.error("MongoDB Atlas connection failed. Please check:");
          console.error("1. Your IP address is whitelisted in MongoDB Atlas");
          console.error("2. Your MongoDB URI is correct");
          console.error("3. Your network connection is stable");
        }
        
        throw new Error(`Database connection failed: ${err.message || 'Unknown error'}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // If the awaited promise rejects, clear it so next call retries
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}

export default dbConnect;