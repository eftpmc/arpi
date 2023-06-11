const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define your routes and handlers here
app.get('/', (req, res) => res.send("<h1>api 😾</h1>"));

// Load routes
const searchRoutes = require('./api/gogo/search');

// Register routes
app.use('/api/gogo/search', searchRoutes);

// Start the server
app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
