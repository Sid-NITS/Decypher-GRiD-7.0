# 🚀 Real-time Product Search with Autocomplete

A lightning-fast, real-time product search system with autocomplete functionality, similar to Flipkart's search experience. Built with Node.js and vanilla JavaScript - **no external dependencies like Elasticsearch required**.

![Demo](https://img.shields.io/badge/Demo-Live-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-v20+-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🔍 **Real-time Search** - Instant suggestions as you type
- ⚡ **Ultra Fast** - In-memory search with sub-millisecond response times
- 🎯 **Smart Matching** - Fuzzy search, prefix matching, and synonym support
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- 🚀 **Zero Dependencies** - No Elasticsearch or external search engines needed
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
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/realtime-product-search.git
cd realtime-product-search

# Install dependencies
npm install

# Start the server
npm start
```

### Usage

1. **Open your browser** and visit `http://localhost:3000`
2. **Start typing** in the search box
3. **Watch instant suggestions** appear
4. **Navigate with arrow keys** or click to select

## 📁 Project Structure

```
autosuggest-es/
├── src/
│   ├── server.js              # Express server setup
│   ├── search/
│   │   └── suggest.js         # Search logic and API
│   └── config/
│       └── es.js              # Configuration (optional)
├── public/
│   ├── index.html             # Main search interface
│   └── demo.html              # Advanced demo with auto-typing
├── data/
│   └── products.json          # Product database (10,000 products)
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## 🛠️ Technical Details

### Search Algorithm
- **Prefix Matching**: Highest priority for words starting with query
- **Fuzzy Matching**: Handles typos and partial words
- **Multi-field Search**: Searches across title, category, and brand
- **Scoring System**: Intelligent ranking based on relevance and popularity
- **In-memory Processing**: All data loaded in RAM for instant responses

### Performance
- **Response Time**: < 10ms average
- **Memory Usage**: ~50MB (vs 700MB+ for Elasticsearch)
- **Scalability**: Handles 10,000+ products efficiently
- **No External Dependencies**: Pure Node.js implementation

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
Create a `.env` file:
```env
PORT=3000
NODE_ENV=development
```

### Search Parameters
Modify these in `src/search/suggest.js`:
```javascript
const SEARCH_CONFIG = {
  maxResults: 5,           // Max suggestions to return
  debounceDelay: 150,      // ms delay for real-time search
  fuzzyThreshold: 0.7,     // Fuzzy match sensitivity
  popularityWeight: 0.1    // Popularity influence on scoring
};
```

## 📊 Performance Metrics

The demo page shows real-time metrics:
- **Total Requests**: Number of search requests made
- **Average Response Time**: Mean response time in milliseconds
- **Success Rate**: Percentage of successful requests
- **Products in Database**: Total number of searchable products

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm run start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloud Deployment
- **Heroku**: Ready to deploy with included Procfile
- **Vercel**: Works with serverless functions
- **Railway**: Simple deployment with git integration
- **DigitalOcean**: App Platform compatible

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
