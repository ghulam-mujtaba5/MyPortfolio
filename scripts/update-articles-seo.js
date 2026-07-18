// scripts/update-articles-seo.js
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env.local
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

const ARTICLE_UPDATES = {
  "building-campusaxis-comsats-pakistani-university-platform": {
    metaTitle: "Building CampusAxis: From COMSATS to Pakistani Universities",
    metaDescription: "How CampusAxis grew from a COMSATS Lahore student problem into a university portal for past papers, GPA tools, and student collaboration across Pakistan.",
    tags: ["SaaS", "Next.js", "MongoDB", "CampusAxis", "University Portal", "COMSATS University"]
  },
  "megilance-ai-blockchain-freelance-marketplace-payments": {
    metaTitle: "MegiLance: AI & Blockchain Freelance Marketplace",
    metaDescription: "How MegiLance uses artificial intelligence and blockchain technology to resolve trust, escrow payments, and matching in the freelance work online market.",
    tags: ["Next.js", "Blockchain", "Freelance Marketplace", "Escrow Payments", "AI Matching"]
  },
  "clinic-website-complete-digital-workflows": {
    metaTitle: "A Clinic Website Is Not Enough: Complete Digital Workflows",
    metaDescription: "Lessons from Aesthetics Place: why clinical and service businesses need WhatsApp automation, booking calendars, staff roles, and complete practice management workflows.",
    tags: ["Clinic Management", "Digital Workflow", "Scheduling Software Healthcare", "Patient Records"]
  }
};

async function main() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("articles");

    console.log("Beginning article updates...");
    for (const [slug, fields] of Object.entries(ARTICLE_UPDATES)) {
      const result = await collection.updateOne(
        { slug: slug },
        { 
          $set: { 
            metaTitle: fields.metaTitle,
            metaDescription: fields.metaDescription,
            tags: fields.tags
          } 
        }
      );
      console.log(`Slug: ${slug} -> Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    }

    console.log("All article SEO fields updated successfully.");
  } finally {
    await client.close();
  }
}

main().catch(console.error);
