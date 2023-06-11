const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define your routes and handlers here
app.get('/', (req, res) => res.send("<h1>api 😾</h1>"));

// Load routes
const gogoSearchRoutes = require('./api/anime/gogo/search');
const gogoWatchRoutes = require('./api/anime/gogo/watch');

const nineSearchRoutes = require('./api/anime/9anime/search');

const gotakuSearchRoutes = require('./api/anime/gotaku/search');


// Register routes
app.use('/api/anime/gogo/search', gogoSearchRoutes);
app.use('/api/anime/gogo/watch', gogoWatchRoutes);

app.use('/api/anime/9anime/search', nineSearchRoutes);

app.use('/api/anime/gotaku/search', gotakuSearchRoutes);

// Start the server
app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
