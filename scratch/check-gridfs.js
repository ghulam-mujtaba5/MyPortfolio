// scratch/check-gridfs.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");
    const conn = mongoose.connection;
    const db = conn.db;

    const fileIds = [
      "6a43ae91a9373680da0d6805",
      "6a43c8f422068afddab330bc",
      "6a43c644b7a95a912dde7e07"
    ];

    for (const id of fileIds) {
      const oid = new mongoose.Types.ObjectId(id);
      const files = await db.collection("media.files").find({ _id: oid }).toArray();
      console.log(`\nChecking ID: ${id}`);
      if (files.length === 0) {
        console.log("-> File document NOT found in media.files!");
      } else {
        const file = files[0];
        console.log(`-> File document found: filename=${file.filename}, length=${file.length}, contentType=${file.contentType}`);
        // Let's check chunks
        const chunks = await db.collection("media.chunks").find({ files_id: oid }).toArray();
        console.log(`-> Chunks found: ${chunks.length}`);
        const totalChunkLength = chunks.reduce((acc, c) => acc + c.data.length, 0);
        console.log(`-> Total chunk length in DB: ${totalChunkLength}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

main();
