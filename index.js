const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Add a middleware to set the CORS headers
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'https://aritools.vercel.app','https://superb-kheer-7cb5da.netlify.app'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow specific HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
  next();
});


// Define your routes and handlers here
app.get('/', (req, res) => res.send("<h1>api 😾</h1>"));

// Load routes
const gogoSearchRoutes = require('./api/anime/gogo/search');
const gogoWatchRoutes = require('./api/anime/gogo/watch');

const nineSearchRoutes = require('./api/anime/9anime/search');

const gotakuSearchRoutes = require('./api/anime/gotaku/search');

const paheSearchRoutes = require('./api/anime/pahe/search');
const paheWatchRoutes = require('./api/anime/pahe/watch');

const moviesSearchRoutes = require('./api/movie/123movies/search');

// Register routes
app.use('/api/anime/gogo/search', gogoSearchRoutes);
app.use('/api/anime/gogo/watch', gogoWatchRoutes);

app.use('/api/anime/9anime/search', nineSearchRoutes);

app.use('/api/anime/gotaku/search', gotakuSearchRoutes);

app.use('/api/anime/pahe/search', paheSearchRoutes);
app.use('/api/anime/pahe/watch', paheWatchRoutes);

app.use('/api/movie/123movies/search', moviesSearchRoutes);

// Start the server
app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
