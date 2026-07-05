// scratch/verify-media-loading.js
const http = require("http");

function fetchMedia(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      console.log(`URL: ${url}`);
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
      
      let rawData = [];
      res.on("data", (chunk) => {
        rawData.push(chunk);
      });
      res.on("end", () => {
        const buffer = Buffer.concat(rawData);
        console.log(`DATA LENGTH: ${buffer.length} bytes\n`);
        resolve({
          status: res.statusCode,
          length: buffer.length,
          contentType: res.headers["content-type"]
        });
      });
    }).on("error", (e) => {
      reject(e);
    });
  });
}

async function run() {
  const ids = [
    "6a43ae91a9373680da0d6805",
    "6a43c8f422068afddab330bc",
    "6a43c644b7a95a912dde7e07"
  ];
  
  for (const id of ids) {
    const url = `http://localhost:3001/api/media/file/${id}`;
    try {
      await fetchMedia(url);
    } catch (err) {
      console.error(`Error fetching ${id}:`, err.message);
    }
  }
}

run();
