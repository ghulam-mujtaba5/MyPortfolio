import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not found");
  process.exit(1);
}

async function main() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    console.log("Updating CampusAxis live URL...");
    const result = await db.collection("projects").updateOne(
      { slug: "campusaxis-university-portal" },
      { $set: { "links.live": "https://campusaxis.pk/" } }
    );
    
    console.log(`Matched count: ${result.matchedCount}`);
    console.log(`Modified count: ${result.modifiedCount}`);
    console.log("Database update completed successfully.");
  } finally {
    await client.close();
  }
}

main().catch(console.error);
