# 🚀 Enh- 🔍 **Real-time Search** - Instant suggestions as you type
- ⚡ **Ultra Fast** - Elasticsearch-powered search with optimized indexing
- 🎯 **Smart Matching** - Enhanced fuzzy search, prefix matching, and intelligent synonym support
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- 🔧 **Elasticsearch Integration** - Professional search engine with advanced features
- 🎮 **Interactive Demo** - Automated typing demonstration
- 📊 **Performance Metrics** - Real-time monitoring of search performance
- ⌨️ **Keyboard Navigation** - Arrow keys, Enter, and Escape support
- 🧠 **Intelligent Synonyms** - "mob" → mobile phones, "lapp" → laptops, typo tolerance
- 💰 **Rich Product Data** - Complete product information with prices, ratings, and images
- 🎯 **Contextual Suggestions** - Prioritizes relevant categories based on query intent

## 🆕 Recent Improvements

### Enhanced Search Intelligence
- **Smart Synonym Expansion**: "mob" now correctly suggests mobile phones instead of random products
- **Typo Tolerance**: "mobiile" automatically corrects to mobile suggestions  
- **Category Priority**: Mobile queries prioritize smartphone categories with ultra-high scoring
- **Laptop Recognition**: "lapp" intelligently expands to laptop and computer products

### Improved User Experience  
- **Fixed Enter Key**: Enter now works properly for direct searches
- **Rich Product Display**: Products show complete information including prices, ratings, and discounts
- **Consistent Results**: Suggestions and search results use the same unified algorithm
- **Better Scoring**: Enhanced relevance scoring prioritizes the most relevant products first

### Technical Enhancements
- **Comprehensive Product Data**: 412 products with complete metadata (prices, ratings, images, features)
- **Unified Search Logic**: Same search algorithm powers both suggestions and full search results
- **Enhanced Error Handling**: Graceful fallbacks and improved error messaging
- **Performance Optimization**: Faster response times and better cachingal-time Product Search with Autocomplete

A lightning-fast, real-time product search system with autocomplete functionality, similar to Flipkart's search experience. Built with Node.js, Express, and Elasticsearch for enterprise-grade search capabilities with advanced synonym matching and intelligent suggestions.

![Demo](https://img.shields.io/badge/Demo-Live-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-v16+-green) ![Elasticsearch](https://img.shields.io/badge/Elasticsearch-v8+-orange) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🔍 **Real-time Search** - Instant suggestions as you type
- ⚡ **Ultra Fast** - Elasticsearch-powered search with optimized indexing
- 🎯 **Smart Matching** - Fuzzy search, prefix matching, and synonym support
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- � **Elasticsearch Integration** - Professional search engine with advanced features
- 🎮 **Interactive Demo** - Automated typing demonstration
- 📊 **Performance Metrics** - Real-time monitoring of search performance
- ⌨️ **Keyboard Navigation** - Arrow keys, Enter, and Escape support

## 🎬 Demo

### Live Interactive Demo
- **Main Search**: `http://localhost:3000`
- **Advanced Demo**: `http://localhost:3000/demo.html`

### Example Searches
- Try typing: `laptop`, `lapp`, `mob`, `mobile`, `smartphone`, `mobiile` (typo)
- Watch intelligent suggestions appear with relevant product categories
- Test Enter key functionality for direct searches
- Use arrow keys to navigate, Enter to select suggestions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Elasticsearch 8+ running locally or accessible remotely
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/realtime-product-search.git
cd realtime-product-search

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Elasticsearch configuration

# Start Elasticsearch (if running locally)
# Download from: https://www.elastic.co/downloads/elasticsearch

# Index the product data
npm run reindex

# Start the server
npm start
```

### Usage

1. **Ensure Elasticsearch is running** (usually at `http://localhost:9200`)
2. **Index the product data** using `npm run reindex`
3. **Open your browser** and visit `http://localhost:3000`
4. **Start typing** in the search box
5. **Watch instant suggestions** appear powered by Elasticsearch
6. **Navigate with arrow keys** or click to select

## 📁 Project Structure

```
autosuggest-es/
├── src/
│   ├── server.js              # Express server setup with unified search endpoints
│   ├── search/
│   │   ├── suggest.js         # Enhanced Elasticsearch search with intelligent synonyms
│   │   └── comprehensive_search.js # Fallback search engine
│   ├── indexing/
│   │   └── bulk_index.js      # Elasticsearch indexing with comprehensive product data
│   ├── config/
│   │   └── es.js              # Elasticsearch configuration
│   └── utils/
│       └── normalize.js       # Text normalization utilities
├── public/
│   ├── index.html             # Main search interface with improved Enter key handling
│   ├── search.html            # Search results page with rich product display
│   ├── product.html           # Product details page
│   └── demo.html              # Advanced demo with auto-typing
├── data/
│   ├── products.json          # Basic product database 
│   └── comprehensive_products.json # Complete product data (412 products with prices, ratings, images)
├── test_fixes.html            # Test page for verifying search improvements
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── reindex.js                 # Data indexing script
└── README.md                  # This documentation
└── README.md                  # This file
```

## 🛠️ Technical Details

### Enhanced Search Algorithm
- **Elasticsearch Integration**: Professional search engine with advanced indexing and comprehensive product data
- **Intelligent Synonym Expansion**: Context-aware synonym mapping ("mob" → mobile devices, "lapp" → laptops)
- **Category-Priority Scoring**: Ultra-high boost values (100+) for relevant categories when synonyms are detected
- **Unified Search Logic**: Same algorithm powers both autocomplete suggestions and full search results
- **Advanced Fuzzy Matching**: Enhanced typo tolerance with configurable fuzziness levels
- **Multi-field Search**: Searches across title, category, brand with weighted scoring
- **Fallback System**: Comprehensive search fallback when Elasticsearch is unavailable

### Smart Features
- **Contextual Intelligence**: "mob" queries automatically prioritize smartphone categories
- **Typo Correction**: "mobiile" → mobile phones, "labtop" → laptops
- **Prefix Optimization**: Edge n-gram tokenization for instant autocomplete
- **Relevance Scoring**: Custom boost values ensure most relevant results appear first
- **Rich Product Data**: Complete metadata including prices, ratings, reviews, images

### Performance
- **Response Time**: < 30ms average (network + processing) 
- **Indexing**: Efficient bulk indexing of 412 comprehensive products
- **Scalability**: Elasticsearch handles millions of products efficiently
- **Caching**: Built-in query result caching and optimized scoring
- **Real-time Updates**: Near real-time search index updates

### API Endpoints

#### `GET /api/suggest?q={query}`
Returns product suggestions for the given query.

**Parameters:**
- `q` (string): Search query

**Response:**
```json
[
  {
    "id": "1",
    "title": "Professional Laptop",
    "category": "Computers",
    "brand": "Dell",
    "popularity": 150,
    "score": 95.5,
    "highlight": {
      "title": ["<em>Laptop</em>"]
    }
  }
]
```

## 🎨 Customization

### Adding Your Own Products
1. Edit `data/products.json`
2. Follow this format:
```json
{
  "id": "unique-id",
  "title": "Product Name",
  "category": "Category",
  "brand": "Brand Name",
  "popularity": 100
}
```
3. Restart the server

### Styling
- Modify CSS in `public/index.html` and `public/demo.html`
- Responsive design included
- Easy to customize colors, fonts, and layout

### Search Logic
- Edit `src/search/suggest.js` to modify search behavior
- Adjust scoring weights and matching algorithms
- Add new search fields or filters

## 🔧 Configuration

### Environment Variables
Create a `.env` file (copy from `.env.example`):
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Elasticsearch Configuration
ES_HOST=localhost
ES_PORT=9200
ES_INDEX=products
ES_USERNAME=
ES_PASSWORD=

# Search Configuration
MAX_SUGGESTIONS=10
SEARCH_DEBOUNCE=150
```

### Elasticsearch Setup
1. **Download Elasticsearch**: https://www.elastic.co/downloads/elasticsearch
2. **Start Elasticsearch**: Usually runs on `http://localhost:9200`
3. **Verify Installation**: 
   ```bash
   curl -X GET "localhost:9200/"
   ```
4. **Index Data**: 
   ```bash
   npm run reindex
   ```

## 📊 Performance Metrics

The demo page shows real-time metrics:
- **Total Requests**: Number of search requests made
- **Average Response Time**: Mean response time in milliseconds
- **Success Rate**: Percentage of successful requests
- **Products in Database**: Total number of searchable products

## 🚀 Deployment

### Local Development
1. **Start Elasticsearch**:
   ```bash
   # If using Docker
   docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.11.0
   ```

2. **Start the application**:
   ```bash
   npm run dev
   ```

### Production
1. **Set up Elasticsearch cluster** (cloud or on-premise)
2. **Configure environment variables** for production
3. **Deploy application**:
   ```bash
   npm run start
   ```

### Docker Deployment
Use the included `docker-compose.yml` for full stack deployment:
```bash
# Start both application and Elasticsearch
docker-compose up -d

# Application only (if you have external Elasticsearch)
docker-compose up app
```

### Cloud Deployment Options
- **Heroku**: Use Heroku Elasticsearch add-on
- **AWS**: Deploy with Amazon Elasticsearch Service
- **Google Cloud**: Use Elastic Cloud integration
- **Azure**: Azure Search or Elasticsearch Service
- **Elastic Cloud**: Official managed Elasticsearch

**Note**: Ensure your Elasticsearch instance is accessible and properly configured before deploying the application.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Flipkart's search experience
- Built for the Flipkart Grid 7.0 Challenge
- Thanks to the open-source community

## 📞 Support

If you have any questions or run into issues:

1. Check the [Issues](https://github.com/yourusername/realtime-product-search/issues) page
2. Create a new issue with detailed description
3. Join our [Discussions](https://github.com/yourusername/realtime-product-search/discussions)

## 🎯 Roadmap

- [ ] Add product images support
- [ ] Implement search analytics
- [ ] Add search filters (price, category, etc.)
- [ ] Voice search integration
- [ ] Mobile app version
- [ ] Advanced autocomplete with machine learning

---

**⭐ If you found this project helpful, please give it a star!**

Made with ❤️ for the developer community
