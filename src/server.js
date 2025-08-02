// src/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const suggest = require('./search/suggest');
const ComprehensiveSearchEngine = require('./search/comprehensive_search');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize comprehensive search engine
const searchEngine = new ComprehensiveSearchEngine();

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Parse JSON requests
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes

// Autocomplete suggestions (existing) - Add logging middleware
app.use('/api/suggest', (req, res, next) => {
    console.log('📊 Suggest endpoint called with query:', req.query.q);
    next();
});
app.use('/api', suggest);

// Enhanced search suggestions using comprehensive search - returns actual products (original working version)
app.get('/api/suggestions', (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    const suggestions = searchEngine.getSuggestions(q.trim(), parseInt(limit));
    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Full search results - now uses the same logic as suggestions via suggest router
// The suggest router has both /suggest and /search endpoints

// Get product details by ID
app.get('/api/product/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { location = 'Mumbai' } = req.query;
    
    const product = searchEngine.getProductById(id, location);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get related products
    const relatedProducts = searchEngine.getRelatedProducts(id);
    
    res.json({
      ...product,
      relatedProducts
    });
  } catch (error) {
    console.error('Product details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get related products
app.get('/api/product/:id/related', (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;
    
    const relatedProducts = searchEngine.getRelatedProducts(id, parseInt(limit));
    res.json(relatedProducts);
  } catch (error) {
    console.error('Related products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('../package.json').version || '1.0.0',
    totalProducts: searchEngine.products.length
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Serve search results page
app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'search.html'));
});

// Serve product details page
app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'product.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 API listening at http://localhost:${PORT}/api/suggest?q=...`);
  console.log(`🌐 Frontend available at http://localhost:${PORT}`);
  console.log(`🔍 Search API available at http://localhost:${PORT}/api/search?q=...`);
  console.log(`📱 Product API available at http://localhost:${PORT}/api/product/:id`);
  console.log('💡 Try the interactive search at http://localhost:${PORT}');
  console.log(`📊 Loaded ${searchEngine.products.length} products for search`);
});
