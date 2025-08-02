# Enhanced Product Search Deployment Guide

This guide covers different deployment options for the Enhanced Realtime Product Search system with intelligent suggestions and comprehensive product data.

## 🚀 Quick Deploy Options

### 1. **Heroku (Recommended for beginners)**

**Prerequisites:**
- Heroku account  
- Heroku CLI installed
- Elasticsearch add-on or external Elasticsearch service

**Steps:**
```bash
# Login to Heroku
heroku login

# Create new app
heroku create your-enhanced-search-app

# Add Elasticsearch add-on (recommended)
heroku addons:create bonsai:sandbox-10

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=3000

# Deploy
git push heroku main

# Index the comprehensive product data
heroku run npm run reindex

# Open app
heroku open
```

**Heroku Configuration:**
- Add `package.json` with start script
- Use `process.env.PORT` for dynamic port assignment
- Set `NODE_ENV=production`

### 2. **Vercel (Serverless)**

**Prerequisites:**
- Vercel account
- Vercel CLI (optional)

**Method 1 - GitHub Integration:**
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm install`
   - Output Directory: `public`
   - Install Command: `npm install`

**Method 2 - CLI Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Vercel Configuration (vercel.json):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/src/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

### 3. **Netlify**

**Prerequisites:**
- Netlify account

**Steps:**
1. Build your project: `npm run build`
2. Drag and drop `dist` folder to Netlify
3. Configure redirects in `_redirects` file:
```
/api/* /.netlify/functions/server/:splat 200
/* /index.html 200
```

### 4. **Railway**

**Prerequisites:**
- Railway account

**Steps:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## 🐳 Docker Deployment

### Option A: Simple Docker
```bash
# Build image
docker build -t realtime-search .

# Run container
docker run -p 3000:3000 -e NODE_ENV=production realtime-search
```

### Option B: Docker Compose (with Elasticsearch)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option C: Docker Swarm (Production)
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml search-stack

# Scale services
docker service scale search-stack_app=3
```

## ☁️ Cloud Platforms

### **AWS Deployment**

#### EC2 Instance
```bash
# Launch EC2 instance (Ubuntu 22.04)
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup project
git clone https://github.com/yourusername/realtime-product-search.git
cd realtime-product-search
npm install
npm start
```

#### AWS Lambda (Serverless)
1. Use AWS SAM or Serverless Framework
2. Configure API Gateway
3. Set up CloudWatch for monitoring

#### Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

### **Google Cloud Platform**

#### App Engine
Create `app.yaml`:
```yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  PORT: 8080

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

Deploy:
```bash
gcloud app deploy
```

#### Cloud Run
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/realtime-search

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT_ID/realtime-search --platform managed
```

### **Microsoft Azure**

#### App Service
```bash
# Create resource group
az group create --name myResourceGroup --location "East US"

# Create App Service plan
az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku B1 --is-linux

# Create web app
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name myUniqueAppName --runtime "NODE|18-lts"

# Deploy code
az webapp deployment source config --name myUniqueAppName --resource-group myResourceGroup --repo-url https://github.com/yourusername/realtime-product-search --branch main --manual-integration
```

## 🔧 Environment Configuration

### Production Environment Variables
```bash
# Required
NODE_ENV=production
PORT=3000

# Optional Elasticsearch
ES_HOST=your-elasticsearch-host
ES_PORT=9200
ES_USERNAME=username
ES_PASSWORD=password

# Performance
MAX_SUGGESTIONS=10
SEARCH_DEBOUNCE=150
CACHE_TTL=300

# Security
CORS_ORIGIN=https://yourdomain.com
```

### SSL/HTTPS Setup

#### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring & Analytics

### Health Checks
```javascript
// Add to your server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});
```

### Logging (Production)
```bash
# Install Winston for structured logging
npm install winston

# PM2 for process management
npm install -g pm2
pm2 start src/server.js --name search-api
pm2 startup
pm2 save
```

### Performance Monitoring
- **New Relic**: APM monitoring
- **DataDog**: Infrastructure monitoring  
- **Grafana + Prometheus**: Custom metrics
- **AWS CloudWatch**: AWS-native monitoring

## 🔒 Security Considerations

### Environment Security
- Use environment variables for secrets
- Never commit `.env` files
- Use secure environment variable storage (AWS Secrets Manager, etc.)

### API Security
```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Security headers
const helmet = require('helmet');
app.use(helmet());
```

### Database Security
- Use connection encryption
- Implement proper authentication
- Regular security updates
- Network security groups

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 PID
```

**Memory Issues:**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 src/server.js
```

**Elasticsearch Connection:**
```bash
# Check Elasticsearch status
curl -X GET "localhost:9200/_cluster/health"

# Check indices
curl -X GET "localhost:9200/_cat/indices"
```

### Logs & Debugging
```bash
# PM2 logs
pm2 logs search-api

# Docker logs
docker logs container-name

# System logs
journalctl -u nginx -f
```

## 📈 Scaling Strategies

### Horizontal Scaling
- Load balancer (Nginx, HAProxy)
- Multiple application instances
- Database clustering
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching layers
- Code optimization

### Auto-scaling
- AWS Auto Scaling Groups
- Google Cloud Auto Scaling
- Azure Scale Sets
- Kubernetes Horizontal Pod Autoscaler

## 🎯 Performance Optimization

### Application Level
- Enable compression
- Implement caching
- Optimize database queries
- Use CDN for static assets

### Infrastructure Level
- Use SSD storage
- Optimize network configuration
- Implement proper monitoring
- Regular performance testing

Ready to deploy? Choose the option that best fits your needs and follow the respective guide! 🚀
