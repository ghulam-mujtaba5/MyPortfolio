/**
 * audit-media.mjs
 * Connects to MongoDB, audits:
 *   1. All MediaAsset docs with /api/media/file/<id> URLs
 *   2. All GridFS files in media.files collection
 *   3. All Project docs with /api/media/file/<id> image URLs
 *
 * Reports:
 *   - MediaAsset docs whose GridFS file is MISSING (orphaned records)
 *   - GridFS files with NO matching MediaAsset doc (orphaned blobs)
 *   - Project docs referencing /api/media/file/<id> with missing GridFS file
 *
 * Usage: node scripts/audit-media.mjs
 */

import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  // Parse manually to handle quoted values
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not found in .env.local");
  process.exit(1);
}

// Extract the database name from the URI
function getDbName(uri) {
  const match = uri.match(/\/([^/?]+)(\?|$)/);
  return match ? match[1] : "myportfolio";
}

const DB_NAME = getDbName(MONGODB_URI);

async function main() {
  console.log(`\n🔌 Connecting to MongoDB (db: ${DB_NAME})...\n`);
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log("✅ Connected\n");

    // ── 1. Fetch all GridFS file IDs in media.files ──────────────────────────
    const gridfsFiles = await db.collection("media.files").find({}, { projection: { _id: 1, filename: 1, contentType: 1, length: 1, uploadDate: 1 } }).toArray();
    const gridfsFileIds = new Set(gridfsFiles.map((f) => f._id.toString()));
    console.log(`📦 GridFS media.files count: ${gridfsFiles.length}`);
    if (gridfsFiles.length > 0) {
      console.log("   Sample IDs:", gridfsFiles.slice(0, 5).map(f => `${f._id} (${f.filename})`).join(", "));
    }
    console.log();

    // ── 2. Fetch all MediaAsset docs ──────────────────────────────────────────
    const mediaAssets = await db.collection("mediaassets").find({}).toArray();
    console.log(`🗂️  MediaAsset docs count: ${mediaAssets.length}`);

    // Filter those that reference /api/media/file/<id>
    const gridfsMediaAssets = mediaAssets.filter(a => a.url && a.url.includes("/api/media/file/"));
    const externalMediaAssets = mediaAssets.filter(a => a.url && !a.url.includes("/api/media/file/"));
    console.log(`   → Referencing GridFS (/api/media/file/): ${gridfsMediaAssets.length}`);
    console.log(`   → External URLs (Cloudinary etc.):        ${externalMediaAssets.length}`);
    console.log();

    // ── 3. Check MediaAsset → GridFS integrity ────────────────────────────────
    const orphanedAssets = []; // MediaAsset with no matching GridFS file
    const healthyAssets = [];

    for (const asset of gridfsMediaAssets) {
      const parts = asset.url.split("/");
      const fileIdStr = parts[parts.length - 1];
      if (gridfsFileIds.has(fileIdStr)) {
        healthyAssets.push({ _id: asset._id, url: asset.url, filename: asset.filename });
      } else {
        orphanedAssets.push({ _id: asset._id, url: asset.url, filename: asset.filename, createdAt: asset.createdAt });
      }
    }

    console.log(`✅ Healthy MediaAsset → GridFS links: ${healthyAssets.length}`);
    console.log(`❌ Orphaned MediaAsset records (GridFS file missing): ${orphanedAssets.length}`);
    if (orphanedAssets.length > 0) {
      console.log("   Details:");
      for (const a of orphanedAssets) {
        console.log(`     Asset _id: ${a._id} | filename: ${a.filename} | url: ${a.url} | created: ${a.createdAt}`);
      }
    }
    console.log();

    // ── 4. Check GridFS → MediaAsset integrity (orphaned blobs) ──────────────
    const assetUrlFileIds = new Set(
      gridfsMediaAssets.map(a => a.url.split("/").pop())
    );
    const orphanedBlobs = gridfsFiles.filter(f => !assetUrlFileIds.has(f._id.toString()));
    console.log(`🧹 Orphaned GridFS blobs (no MediaAsset record): ${orphanedBlobs.length}`);
    if (orphanedBlobs.length > 0) {
      console.log("   Details:");
      for (const b of orphanedBlobs) {
        console.log(`     GridFS _id: ${b._id} | filename: ${b.filename} | size: ${b.length} bytes | uploaded: ${b.uploadDate}`);
      }
    }
    console.log();

    // ── 5. Check Projects referencing /api/media/file/<id> ───────────────────
    const projects = await db.collection("projects").find({}).toArray();
    console.log(`📁 Total Project docs: ${projects.length}`);

    const projectIssues = [];
    const projectHealthy = [];

    for (const p of projects) {
      const imagesToCheck = [];
      if (p.image && p.image.includes("/api/media/file/")) {
        imagesToCheck.push({ field: "image", url: p.image });
      }
      if (p.gallery && Array.isArray(p.gallery)) {
        for (const g of p.gallery) {
          if (g.url && g.url.includes("/api/media/file/")) {
            imagesToCheck.push({ field: `gallery[${g.order}]`, url: g.url });
          }
        }
      }
      if (p.ogImage && p.ogImage.includes("/api/media/file/")) {
        imagesToCheck.push({ field: "ogImage", url: p.ogImage });
      }

      for (const img of imagesToCheck) {
        const fileIdStr = img.url.split("/").pop();
        const inGridFS = gridfsFileIds.has(fileIdStr);
        const inMediaAssets = assetUrlFileIds.has(fileIdStr);
        if (!inGridFS) {
          projectIssues.push({
            projectId: p._id,
            title: p.title || p.slug,
            field: img.field,
            url: img.url,
            fileIdStr,
            inMediaAssets,
          });
        } else {
          projectHealthy.push({ projectId: p._id, title: p.title, field: img.field, url: img.url });
        }
      }
    }

    console.log(`✅ Projects with healthy GridFS image links: ${projectHealthy.length}`);
    console.log(`❌ Projects with BROKEN /api/media/file/ links: ${projectIssues.length}`);
    if (projectIssues.length > 0) {
      console.log("   Details:");
      for (const pi of projectIssues) {
        console.log(`     Project: "${pi.title}" (${pi.projectId})`);
        console.log(`       Field: ${pi.field}`);
        console.log(`       URL: ${pi.url}`);
        console.log(`       GridFS file ID: ${pi.fileIdStr}`);
        console.log(`       MediaAsset record exists: ${pi.inMediaAssets}`);
      }
    }
    console.log();

    // ── 6. Summary ────────────────────────────────────────────────────────────
    console.log("═══════════════════════════════════════════════════════════");
    console.log("SUMMARY");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`GridFS files:                    ${gridfsFiles.length}`);
    console.log(`MediaAsset docs (total):          ${mediaAssets.length}`);
    console.log(`  → GridFS-backed:                ${gridfsMediaAssets.length}`);
    console.log(`  → External (Cloudinary etc.):   ${externalMediaAssets.length}`);
    console.log(`Orphaned MediaAsset records:       ${orphanedAssets.length}  (DB record with no GridFS file)`);
    console.log(`Orphaned GridFS blobs:             ${orphanedBlobs.length}  (GridFS file with no DB record)`);
    console.log(`Projects with broken image links:  ${projectIssues.length}`);
    console.log("═══════════════════════════════════════════════════════════");

    // Save JSON report
    const report = {
      timestamp: new Date().toISOString(),
      db: DB_NAME,
      gridfsFileCount: gridfsFiles.length,
      mediaAssetCount: mediaAssets.length,
      gridfsBackedCount: gridfsMediaAssets.length,
      externalCount: externalMediaAssets.length,
      orphanedAssets,
      orphanedBlobs: orphanedBlobs.map(b => ({ _id: b._id.toString(), filename: b.filename, length: b.length, uploadDate: b.uploadDate })),
      projectIssues: projectIssues.map(pi => ({...pi, projectId: pi.projectId.toString()})),
      projectHealthy: projectHealthy.map(ph => ({...ph, projectId: ph.projectId.toString()})),
    };

    const reportPath = path.join(__dirname, "..", "scripts", "media-audit-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved to: scripts/media-audit-report.json\n`);

  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
