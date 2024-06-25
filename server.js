const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Handle requests for softbuilt.ghulammujtaba.com
  server.get('*', (req, res) => {
    const hostname = req.hostname.toLowerCase(); // Normalize hostname to lowercase
    if (hostname === 'softbuilt.ghulammujtaba.com') {
      // Render the SoftBuilt page
      return app.render(req, res, '/softbuilt', req.query);
    }
    // For all other requests, use Next.js default handler
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
