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
app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
