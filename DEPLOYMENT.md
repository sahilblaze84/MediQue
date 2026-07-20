# Deployment Guide for MediQueue AI

This guide covers deploying MediQueue AI to various platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Vercel/Netlify (Frontend)](#vercelnetlify-frontend)
  - [Render/Railway (Backend)](renderrailway-backend)
  - [Traditional VPS](#traditional-vps)
- [Post-Deployment Steps](#post-deployment-steps)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- OpenAI API Key
- (Optional) Gmail App Password for email notifications
- (Optional) Twilio Account for SMS notifications
- (Optional) n8n instance for workflow automation

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
DATABASE_PATH=./database/medique.db

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# CORS Configuration (if needed)
FRONTEND_URL=https://your-frontend-domain.com
```

## Deployment Options

### Docker Deployment

#### 1. Create Dockerfile for Backend

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run init-db

EXPOSE 5000

CMD ["npm", "start"]
```

#### 2. Create Dockerfile for Frontend

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Create docker-compose.yml

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DATABASE_PATH=/app/database/medique.db
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - EMAIL_HOST=${EMAIL_HOST}
      - EMAIL_PORT=${EMAIL_PORT}
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASSWORD=${EMAIL_PASSWORD}
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
    volumes:
      - ./backend/database:/app/database
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### 4. Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Full-Stack Vercel Deployment (Frontend + Serverless API + Keep-Alive)

MediQueue AI is fully configured for zero-configuration Vercel deployment with Serverless Functions and built-in Keep-Alive Crons.

#### Quick 1-Command Deployment:
1. Run Vercel CLI from your terminal:
   ```bash
   npx vercel
   ```
2. Follow the prompts (Select default options).

#### Features Included:
- **Serverless API**: `api/index.js` wraps the Express backend into Vercel Serverless Functions.
- **Frontend SPA**: Static build deployed directly to Vercel Global Edge CDN.
- **Automated Vercel Keep-Alive Cron**: Configured in `vercel.json` (`crons`) to trigger `/api/health` every 10 minutes, keeping functions warm and preventing idle server timeouts.
- **Environment Variables**: In your Vercel Dashboard, set `OPENAI_API_KEY`, `EMAIL_USER`, etc. under **Project Settings -> Environment Variables**.


#### Netlify Deployment

1. Create `frontend/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Connect your Git repository to Netlify
3. Configure build settings and environment variables

### Render/Railway (Backend)

#### Render Deployment

1. Create a new Web Service on Render
2. Connect your Git repository
3. Configure build settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables
5. Deploy

#### Railway Deployment

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

### Traditional VPS

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Deploy Backend

```bash
# Clone repository
git clone <your-repo-url>
cd MediQue/backend

# Install dependencies
npm install --production

# Initialize database
npm run init-db

# Configure environment variables
cp .env.example .env
nano .env

# Start with PM2
pm2 start server.js --name medique-backend
pm2 save
pm2 startup
```

#### 3. Deploy Frontend

```bash
cd ../frontend

# Build for production
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/medique
```

Add Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/MediQueue/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/medique /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Post-Deployment Steps

### 1. Database Initialization

Ensure the database is properly initialized:

```bash
cd backend
npm run init-db
```

### 2. Add Sample Doctors

Use the API to add doctors to the system:

```bash
curl -X POST http://your-api-url/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. John Smith",
    "email": "john.smith@hospital.com",
    "phone": "+1234567890",
    "departmentId": 1,
    "specialization": "General Medicine",
    "availableFrom": "09:00",
    "availableTo": "17:00"
  }'
```

### 3. Test API Endpoints

```bash
# Health check
curl http://your-api-url/api/health

# Test symptom analysis
curl -X POST http://your-api-url/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "headache"],
    "severity": "moderate",
    "duration": "2 days"
  }'
```

### 4. Configure n8n Workflow (Optional)

1. Deploy n8n instance
2. Import the workflow from `n8n-workflow.json`
3. Configure credentials and webhooks
4. Update frontend to send data to n8n webhook

## Monitoring and Maintenance

## Keep-Alive & 24/7 Server Availability

To ensure the backend server remains active 24/7 and does not spin down (sleep) on free cloud hosting platforms (such as Render, Railway, or Glitch), MediQueue AI includes multiple keep-alive mechanisms:

### 1. Built-in Node.js Self-Ping Service
The backend has a built-in Keep-Alive service (`backend/services/keepAlive.js`) that automatically pings `/api/health` every 10 minutes.

Configure the following environment variables in `backend/.env` or on your cloud dashboard:
```env
KEEP_ALIVE=true
PING_INTERVAL_MINUTES=10
SERVER_URL=https://your-backend-app.onrender.com
```

### 2. PM2 Daemon Process Manager (VPS / Dedicated Server)
To keep the server continuously running in the background and auto-restart on crashes or system reboots:
```bash
cd backend
npm run start:pm2
pm2 save
pm2 startup
```

### 3. External Free Uptime Monitoring (Recommended for Cloud Hosting)
For hosting providers like Render Free Tier, setting up a free external ping service ensures 100% uptime:
- **UptimeRobot**: Create a free HTTP monitor pointing to `https://your-backend.onrender.com/api/health` with a 5-minute interval.
- **Cron-Job.org**: Set a cron job to make a GET request to `https://your-backend.onrender.com/api/health` every 10 minutes.

### 4. Zero-Downtime Persistent Tunnel Manager (n8n & Webhooks)
To expose your local server or n8n webhooks to the internet without encountering "tunnel error" or disconnection drops:

#### Option A: Built-in Auto-Reconnecting Tunnel Manager
Run the built-in Tunnel Manager service:
```bash
cd backend
npm run tunnel
```
This service automatically:
- Monitors connection status with an internal watchdog every 30 seconds.
- Automatically reconnects with exponential backoff whenever network or tunnel drops occur.
- Writes the active public URL to `backend/.tunnel-url`.

To run both backend server AND tunnel manager as PM2 daemons:
```bash
cd backend
npm run start:pm2
```

#### Option B: Cloudflare Tunnel (`cloudflared`) - Recommended Permanent Tunnel
For zero downtime, fixed domain name, and zero timeouts:
1. Download Cloudflare Tunnel: `brew install cloudflared` or `choco install cloudflared`
2. Run persistent tunnel to port 5000:
   ```bash
   cloudflared tunnel --url http://localhost:5000
   ```


---

### Health Monitoring


Set up monitoring for:

- API response times
- Database performance
- Error rates
- Server uptime

### Backup Strategy

Regular backups of:

- SQLite database file
- Environment configurations
- Application logs

### Log Management

```bash
# PM2 logs
pm2 logs medique-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Backend
cd backend
npm install --production
pm2 restart medique-backend

# Frontend
cd frontend
npm run build
# No restart needed for static files
```

## Security Considerations

1. **API Security**: Implement rate limiting and authentication
2. **Data Encryption**: Use HTTPS in production
3. **Environment Variables**: Never commit `.env` files
4. **Database**: Regular backups and access controls
5. **Dependencies**: Regular security audits with `npm audit`
6. **CORS**: Configure proper CORS settings
7. **Input Validation**: All inputs are validated on the backend

## Troubleshooting

### Backend Issues

```bash
# Check PM2 status
pm2 status
pm2 logs medique-backend

# Restart backend
pm2 restart medique-backend
```

### Frontend Issues

```bash
# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database Issues

```bash
# Check database file permissions
ls -la backend/database/

# Reinitialize database if needed
cd backend
npm run init-db
```

## Scaling Considerations

For high-traffic deployments:

1. **Database**: Consider migrating from SQLite to PostgreSQL
2. **Load Balancing**: Use Nginx or cloud load balancers
3. **Caching**: Implement Redis for session management
4. **CDN**: Use Cloudflare or similar for static assets
5. **Monitoring**: Implement comprehensive monitoring with tools like Datadog or New Relic

## Support

For issues or questions:
- Check the main README.md
- Review n8n-workflow-guide.md
- Check application logs
- Verify environment variables
- Test API endpoints independently
