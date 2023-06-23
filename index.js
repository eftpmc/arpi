const express = require('express');
const cors = require('cors');
const axios = require('axios');
const stream = require('stream');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Use CORS
app.use(cors());

// Custom CORS headers
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'https://aritools.vercel.app', 'https://superb-kheer-7cb5da.netlify.app'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow specific HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
  next();
});

// Proxy route for handling video URLs
app.get('/video-proxy', async (req, res) => {
  const videoUrl = req.query.url;

  console.log('Received request with video URL:', videoUrl);

  if (!videoUrl) {
    console.log('Error: Missing url parameter');
    res.status(400).send('The url parameter is required');
    return;
  }

  try {
    const axiosStream = await axios.get(videoUrl, {
      responseType: 'stream',
      timeout: 5000
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
              const modifiedUrl = `https://arpi-api.herokuapp.com/video-proxy?url=${encodeURIComponent(baseUrl + path)}`;
              console.log('Modified URL:', modifiedUrl);
              return modifiedUrl;
            }
            return line;
          });
          const modifiedChunk = modifiedLines.join('\n');
          callback(null, modifiedChunk);
        }
      });

      axiosStream.data.pipe(transformer).pipe(res);
    } else {
      axiosStream.data.pipe(res);
    }
  } catch (error) {
    console.error('Caught error during request:', error);
    if (error.response) {
      console.error('Error response from the server:', error.response.data);
      res.status(500).send('Error occurred while fetching the video from the server');
    } else if (error.request) {
      console.error('No response received:', error.request);
      res.status(500).send('No response received from the video server');
    } else {
      console.error('Error', error.message);
      res.status(500).send('An unknown error occurred');
    }
  }
});

// Define your routes and handlers here
app.get('/', (req, res) => res.send("<h1>api 😾</h1>"));

// Load routes
const paheSearchRoutes = require('./api/anime/pahe/search');
const zoroSearchRoutes = require('./api/anime/zoro/search');
const zoroWatchRoutes = require('./api/anime/zoro/watch');
const flixSearchRoutes = require('./api/movie/flixhq/search');
const flixWatchRoutes = require('./api/movie/flixhq/watch');

// Register routes
app.use('/api/anime/pahe/search', paheSearchRoutes);
app.use('/api/anime/zoro/search', zoroSearchRoutes);
app.use('/api/anime/zoro/watch', zoroWatchRoutes);
app.use('/api/movie/flixhq/search', flixSearchRoutes);
app.use('/api/movie/flixhq/watch', flixWatchRoutes);

// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}`));
