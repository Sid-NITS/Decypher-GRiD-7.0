# Enhanced API Documentation

## Overview

The Enhanced Product Search API provides intelligent, real-time product search with smart synonym expansion, typo tolerance, and comprehensive product data.

## Base URL
```
http://localhost:3000
```

## 🆕 Enhanced Features

### Smart Search Intelligence
- **Intelligent Synonyms**: "mob" → mobile phones, "lapp" → laptops
- **Typo Tolerance**: "mobiile" → mobile suggestions
- **Category Priority**: Ultra-high scoring for relevant categories
- **Unified Algorithm**: Same logic for suggestions and search results

### Rich Product Data
- Complete product information with prices, ratings, images
- Comprehensive metadata including features, delivery info, discounts
- Enhanced scoring for better relevance

## Endpoints

### 1. Enhanced Search Suggestions
Get intelligent, real-time product suggestions with smart synonym expansion and category prioritization.

**Endpoint:** `GET /api/suggest`

**Enhanced Features:**
- Smart synonym expansion ("mob" → mobile phones)
- Typo tolerance ("mobiile" → mobile suggestions)  
- Category-aware scoring with ultra-high boosts
- Rich highlighting of matched terms

**Parameters:**
- `q` (required): Search query string
- `limit` (optional): Maximum number of suggestions (default: 8)

**Example Requests:**
```bash
# Smart mobile device search
curl "http://localhost:3000/api/suggest?q=mob"

# Typo tolerance demonstration
curl "http://localhost:3000/api/suggest?q=mobiile"

# Laptop search with intelligent expansion
curl "http://localhost:3000/api/suggest?q=lapp"
```

**Enhanced Response Format:**
```json
[
  {
    "id": "24",
    "title": "Vivo Note 1RACUR",
    "category": "Electronics > Smartphones",
    "brand": "Vivo",
    "popularity": 100,
    "score": 349.3263,
    "highlight": {
      "category": ["Electronics > <em>Smartphones</em>"],
      "title": ["Vivo Note 1RACUR"]
    }
  },
  {
    "id": "58", 
    "title": "Apple Inspiron SUT4NX",
    "category": "Electronics > Laptops",
    "brand": "Apple",
    "popularity": 100,
    "score": 314.9323,
    "highlight": {
      "category": ["Electronics > <em>Laptops</em>"]
    }
  }
]
```

**Response Fields:**
- `success`: Boolean indicating if request was successful
- `query`: The search query that was processed
- `suggestions`: Array of matching products
- `total`: Number of suggestions returned
- `processing_time`: Time taken to process the request

**Product Object Structure:**
- `id`: Unique product identifier
- `title`: Product name/title
- `category`: Product category hierarchy
- `brand`: Product brand
- `popularity`: Popularity score (0-100)
- `score`: Relevance score for the query

### 2. Health Check
Check if the API is running and healthy.

**Endpoint:** `GET /health`

**Example Request:**
```bash
curl "http://localhost:3000/health"
```

**Example Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": "2h 15m 30s",
  "version": "1.0.0"
}
```

## Search Features

### 1. Prefix Matching
The API supports prefix-based searching, meaning it will find products that start with the search query.

**Example:**
- Query: `"lap"` → Matches: "Laptop", "Laptop Bag", "Laptop Stand"

### 2. Fuzzy Search
Built-in typo tolerance and fuzzy matching for better user experience.

**Example:**
- Query: `"loptop"` → Matches: "Laptop" (corrects typo)

### 3. Category-Aware Search
Prioritizes exact category matches over other types of matches.

**Example:**
- Query: `"acc"` → Prioritizes: "Accessories" category over products with "acc" in title

### 4. Synonym Support
Supports common synonyms and alternative terms.

**Example:**
- Query: `"mobile"` → Also matches: "smartphone", "phone"

### 5. Brand Recognition
Recognizes and prioritizes brand names in search queries.

**Example:**
- Query: `"apple"` → Prioritizes Apple brand products

## Query Parameters

### limit
Controls the maximum number of suggestions returned.

**Default:** 10  
**Range:** 1-50  
**Example:** `?q=laptop&limit=20`

### format (Future Enhancement)
Response format preference.

**Options:** `json` (default), `xml`  
**Example:** `?q=laptop&format=json`

## Error Handling

### 400 Bad Request
Missing or invalid query parameter.

```json
{
  "success": false,
  "error": "Query parameter 'q' is required",
  "code": "MISSING_QUERY"
}
```

### 500 Internal Server Error
Server error during processing.

```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Rate Limiting

**Current Limits:**
- 100 requests per minute per IP
- 1000 requests per hour per IP

**Rate Limit Headers:**
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Performance

**Expected Response Times:**
- Average: 10-50ms
- 95th percentile: 100ms
- 99th percentile: 200ms

**Optimization Features:**
- In-memory caching
- Efficient search algorithms
- Response compression
- Connection pooling

## Authentication

**Current Status:** None required (public API)

**Future Enhancement:** API key authentication for production use.

## CORS

Cross-Origin Resource Sharing is enabled for all origins in development.

**Production:** Configure specific allowed origins in environment variables.

## WebSocket Support (Future Enhancement)

Real-time search updates via WebSocket connection.

**Endpoint:** `ws://localhost:3000/ws/suggest`

## SDK/Client Libraries (Future Enhancement)

- JavaScript/TypeScript SDK
- Python client library
- React hooks for easy integration

## Examples

### JavaScript/Frontend Integration
```javascript
const searchProducts = async (query) => {
  const response = await fetch(`/api/suggest?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.suggestions;
};

// Real-time search with debouncing
let debounceTimer;
const handleSearch = (query) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchProducts(query).then(suggestions => {
      // Update UI with suggestions
      displaySuggestions(suggestions);
    });
  }, 150);
};
```

### cURL Examples
```bash
# Basic search
curl "http://localhost:3000/api/suggest?q=phone"

# Limited results
curl "http://localhost:3000/api/suggest?q=laptop&limit=3"

# Search with special characters (URL encoded)
curl "http://localhost:3000/api/suggest?q=50%25%20off"
```

### Python Integration
```python
import requests

def search_products(query, limit=10):
    url = f"http://localhost:3000/api/suggest"
    params = {"q": query, "limit": limit}
    response = requests.get(url, params=params)
    return response.json()

# Usage
results = search_products("smartphone", limit=5)
for product in results["suggestions"]:
    print(f"{product['title']} - {product['brand']}")
```
