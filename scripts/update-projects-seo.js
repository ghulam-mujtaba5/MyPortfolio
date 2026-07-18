// scripts/update-projects-seo.js
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

const PROJECT_UPDATES = {
  "pulsefocus-desktop-app": {
    metaTitle: "PulseFocus – Cross-Platform Productivity & Habit Tracker App",
    metaDescription: "PulseFocus is an offline-first cross-platform desktop productivity and habit tracker app featuring automated activity tracking, custom routine planning, and dashboards.",
    tags: ["Electron", "React", "Productivity Tools", "Habit Tracker", "Activity Tracking App", "Routine Planner"]
  },
  "megicloth-e-commerce-platform": {
    metaTitle: "Megicloth – Modern E-commerce for Unstitched Fabrics",
    metaDescription: "Megicloth is a modern, high-conversion Next.js e-commerce platform for unstitched fabrics, featuring product search, digital checkout, and wholesale fabrics online.",
    tags: ["Next.js", "MongoDB", "E-commerce Platform", "Unstitched Fabrics", "Wholesale Fabrics", "Quilting Fabric Online"]
  },
  "healsmart-mobile-app": {
    metaTitle: "HealSmart – Compare Medicine Prices & Alternatives",
    metaDescription: "HealSmart is a mobile application to compare prescription medicine prices, find cheaper alternatives, check Rx prices, and locate local pharmacies that deliver medicine.",
    tags: ["React Native", "Healthcare App", "Rx Price Check", "Medicine Alternatives", "App That Delivers Medicine", "Prescription App"]
  },
  "campusaxis-university-portal": {
    metaTitle: "Campus Axis – Pakistani University Student Portal",
    metaDescription: "Campus Axis is a decision-first student portal for Pakistani universities, providing past papers, CGPA calculators, faculty reviews, and academic resources.",
    tags: ["Next.js", "MongoDB", "University Portal", "Student Platform Pakistan", "Academic Resources"]
  },
  "megilance-ai-blockchain-freelancing-platform-fyp": {
    metaTitle: "MegiLance – AI & Blockchain Freelance Marketplace",
    metaDescription: "MegiLance is an AI-powered blockchain freelancing platform and marketplace featuring smart job matching, automated pricing, and secure escrow payments.",
    tags: ["Next.js", "Node.js", "Blockchain Escrow", "Freelance Work Online", "AI Freelancing Platform"]
  },
  "aesthetics-clinic-website-management-system": {
    metaTitle: "Aesthetics Place – Clinic Management System",
    metaDescription: "Aesthetics Place is a comprehensive clinic management system featuring medical patient records, healthcare scheduling software, billing integration, and staff roles.",
    tags: ["Next.js", "Node.js", "MongoDB", "Clinic Management", "Scheduling Software Healthcare", "Practice Management Billing Software"]
  }
};

async function main() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("projects");

    console.log("Beginning project updates...");
    for (const [slug, fields] of Object.entries(PROJECT_UPDATES)) {
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

    console.log("All project SEO fields updated successfully.");
  } finally {
    await client.close();
  }
}

main().catch(console.error);
