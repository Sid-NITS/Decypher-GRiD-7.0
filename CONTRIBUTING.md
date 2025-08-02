# Contributing to Realtime Product Search

Thank you for your interest in contributing to this project! This guide will help you get started.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/realtime-product-search.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Test your changes: `npm test`
7. Commit your changes: `git commit -m "Add your feature"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Create a Pull Request

## 📝 Development Guidelines

### Code Style
- Use consistent indentation (2 spaces)
- Follow JavaScript best practices
- Add comments for complex logic
- Use meaningful variable and function names

### Testing
- Test your changes before submitting
- Run `npm test` to execute the test suite
- Add tests for new features when possible

### Commit Messages
Use clear and descriptive commit messages:
- `feat: add new search algorithm`
- `fix: resolve category matching issue`
- `docs: update README with deployment info`
- `refactor: optimize search performance`

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)
- Any error messages or logs

## 💡 Feature Requests

For feature requests, please provide:
- Clear description of the proposed feature
- Use case or problem it solves
- Any implementation ideas or suggestions

## 🔧 Development Setup

### Prerequisites
- Node.js 16+ and npm 8+
- (Optional) Elasticsearch 8+ for full functionality

### Local Development
1. Copy environment file: `cp .env.example .env`
2. Start the server: `npm run dev`
3. Open http://localhost:3000 in your browser

### Testing Search Functionality
- Use the web interface at http://localhost:3000
- Test the API directly at http://localhost:3000/api/suggest?q=your-query
- Run the test script: `npm test`

## 📦 Project Structure

```
├── src/
│   ├── server.js          # Main Express server
│   ├── config/            # Configuration files
│   ├── indexing/          # Elasticsearch indexing
│   ├── search/            # Search logic
│   └── utils/             # Utility functions
├── public/                # Frontend files
├── data/                  # Product data
└── tests/                 # Test files
```

## 🚀 Areas for Contribution

### High Priority
- Performance optimizations
- Mobile responsiveness improvements
- Advanced search filters
- Caching mechanisms

### Medium Priority
- Additional search algorithms
- Analytics and metrics
- API rate limiting
- Search result personalization

### Documentation
- API documentation improvements
- Deployment guides
- Performance benchmarks
- Use case examples

## ❓ Questions?

Feel free to open an issue for any questions about contributing or the project in general.

Thank you for contributing! 🎉
