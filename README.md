# 🚀 Real-time Product Search with Autocomplete

A lightning-fast, real-time product search system with autocomplete functionality, similar to Flipkart's search experience. Built with Node.js, Express, and Elasticsearch for enterprise-grade search capabilities.

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
- Try typing: `laptop`, `banana`, `smartphone`, `shirt`, `apple`
- Watch real-time suggestions appear as you type
- Use arrow keys to navigate, Enter to select

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
│   ├── server.js              # Express server setup
│   ├── search/
│   │   └── suggest.js         # Elasticsearch search logic
│   ├── indexing/
│   │   └── bulk_index.js      # Elasticsearch indexing
│   └── config/
│       └── es.js              # Elasticsearch configuration
├── public/
│   ├── index.html             # Main search interface
│   └── demo.html              # Advanced demo with auto-typing
├── data/
│   └── products.json          # Product database (10,000 products)
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── reindex.js                 # Data indexing script
└── README.md                  # This file
```

## 🛠️ Technical Details

### Search Algorithm
- **Elasticsearch Integration**: Professional search engine with advanced indexing
- **Prefix Matching**: Optimized for autocomplete with edge n-gram tokenization
- **Fuzzy Matching**: Built-in typo tolerance and edit distance algorithms
- **Multi-field Search**: Searches across title, category, and brand fields
- **Scoring System**: Elasticsearch's built-in relevance scoring with custom boosts
- **Synonym Support**: Configurable synonym mapping for better results

### Performance
- **Response Time**: < 50ms average (network + processing)
- **Indexing**: Efficient bulk indexing of 10,000+ products
- **Scalability**: Elasticsearch handles millions of products efficiently
- **Caching**: Built-in query result caching
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
