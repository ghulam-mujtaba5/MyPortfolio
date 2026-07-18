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

const URLS_TO_TEST = [
  "https://aestheticsplace.pk",
  "https://megilance.site",
  "https://campusaxis.site",
  "https://topmate.io/ghulam_mujtaba",
  "https://campusaxis.pk",
  "https://www.megicode.com",
];

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "manual" });
    console.log(`URL: ${url} -> Status: ${res.status}`);
    if (res.status >= 300 && res.status < 400) {
      console.log(`  Redirect Location: ${res.headers.get("location")}`);
    }
  } catch (err) {
    console.log(`URL: ${url} -> ERROR: ${err.message}`);
  }
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    const projects = await db.collection("projects").find({}).toArray();
    console.log("--- PROJECTS ---");
    for (const p of projects) {
      console.log(`Title: ${p.title}`);
      console.log(`  Live: ${p.links?.live}`);
      console.log(`  Github: ${p.links?.github}`);
      if (p.links?.live && p.links.live !== "#") {
        URLS_TO_TEST.push(p.links.live);
      }
      if (p.links?.github && p.links.github !== "#") {
        URLS_TO_TEST.push(p.links.github);
      }
    }
    
    console.log("\n--- TESTING URLS ---");
    const uniqueUrls = [...new Set(URLS_TO_TEST)];
    for (const url of uniqueUrls) {
      await checkUrl(url);
    }
    
  } finally {
    await client.close();
  }
}

main().catch(console.error);
