// src/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const suggest = require('./search/suggest');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api', suggest);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 API listening at http://localhost:${PORT}/api/suggest?q=...`);
  console.log(`🌐 Frontend available at http://localhost:${PORT}`);
  console.log('💡 Try the interactive search at http://localhost:${PORT}');
});
