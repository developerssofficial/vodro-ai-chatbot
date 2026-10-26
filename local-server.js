// local-server.js - Native Node.js server supporting both static files and /api/chat
const http = require('http');
const fs = require('fs');
const path = require('path');
const chatHandler = require('./api/chat');

const PORT = process.env.PORT || 8123;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // Handle /api/chat
  if (parsedUrl.pathname === '/api/chat') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (e) {
        req.body = {};
      }

      const adaptedRes = {
        setHeader: (name, val) => res.setHeader(name, val),
        status: (code) => {
          res.statusCode = code;
          return {
            json: (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            },
            end: () => res.end()
          };
        },
        json: (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        },
        end: () => res.end()
      };

      await chatHandler(req, adaptedRes);
    });
    return;
  }

  // Handle Static files from public/
  let filePath = path.join(__dirname, 'public', parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Vodro AI Server running at http://localhost:${PORT}`);
});
