const express = require('express');
const cors = require('cors');
const axios = require('axios');
const stream = require('stream');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Custom CORS headers
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'https://aritools.vercel.app', 'https://superb-kheer-7cb5da.netlify.app'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Proxy route for handling video URLs
app.get('/video-proxy', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).send('The url parameter is required');
  }

  try {
    const axiosStream = await axios.get(videoUrl, {
      responseType: 'stream',
      timeout: 5000,
    });

    const contentType = axiosStream.headers['content-type'];
    if (contentType === 'application/vnd.apple.mpegurl' || contentType === 'application/x-mpegURL') {
      res.set('Content-Type', contentType);

      const transformer = new stream.Transform({
        transform(chunk, encoding, callback) {
          const baseUrl = videoUrl.slice(0, videoUrl.lastIndexOf('/') + 1);
          const lines = chunk.toString().split('\n');
          const modifiedLines = lines.map(line => {
            line = line.trim();
            if (line.endsWith('.ts') || line.endsWith('.m3u8')) {
              const path = line;
              const modifiedUrl = `http://localhost:3000/video-proxy?url=${encodeURIComponent(baseUrl + path)}`;
              console.log('Modified URL:', modifiedUrl);
              return modifiedUrl;
            }
            return line;
          });
          const modifiedChunk = modifiedLines.join('\n');
          callback(null, modifiedChunk);
        },
      });

      axiosStream.data.pipe(transformer).pipe(res);
    } else {
      axiosStream.data.pipe(res);
    }
  } catch (error) {
    console.error('Caught error during request:', error);
    res.status(500).send('Error occurred while fetching the video from the server');
  }
});

// Home route
app.get('/', (req, res) => res.send("<h1>apri api baby😾</h1>"));

// Additional routes
const routes = [
  { path: '/v1/anime/pahe/search', file: './v1/anime/pahe/search' },
  { path: '/v1/anime/zoro/search', file: './v1/anime/zoro/search' },
  { path: '/v1/anime/zoro/watch', file: './v1/anime/zoro/watch' },
  { path: '/v1/movie/flixhq/search', file: './v1/movie/flixhq/search' },
  { path: '/v1/movie/flixhq/watch', file: './v1/movie/flixhq/watch' },
  { path: '/v1/tv/flixhq/search', file: './v1/tv/flixhq/search' },
  { path: '/v1/manga/mangadex/search', file: './v1/manga/mangadex/search' },
  { path: '/v1/lightnovel/webnovel/search', file: './v1/lightnovel/webnovel/search' },
];

for (const route of routes) {
  app.use(route.path, require(route.file));
}

// Start server
app.listen(port, () => console.log(`Server is running on port ${port}`));
