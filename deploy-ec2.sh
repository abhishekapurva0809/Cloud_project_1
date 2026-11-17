#!/usr/bin/env bash
# ==============================================================================
# Automated EC2 Deployment Script for Project 1 - Smart Visitor Counter
# Target OS: Ubuntu 22.04 / 24.04 LTS (AWS EC2 Free Tier t2.micro or t3.micro)
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 [1/5] Enabling 2GB Swap Space (Prevents OOM Error 137)..."
echo "=========================================================="
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab || true
    echo "✓ 2GB Swap memory activated successfully (Total RAM: 3GB)"
else
    echo "✓ Swap memory already configured."
fi

echo "=========================================================="
echo "📦 [2/5] Installing System Prerequisites (Node.js 20, Nginx, PM2)..."
echo "=========================================================="
sudo apt-get update -y
sudo apt-get install -y curl git nginx

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

echo "=========================================================="
echo "🔨 [3/5] Setting up Project Dependencies..."
echo "=========================================================="
cd "$(dirname "$0")"

# 1. Check if production frontend is pre-built
if [ -d "frontend/dist" ] && [ -f "frontend/dist/index.html" ]; then
    echo "✓ Pre-built 3D production frontend detected (Skipping heavy in-cloud compile)."
else
    echo "Compiling frontend on EC2 with memory limit..."
    cd frontend
    npm install
    NODE_OPTIONS="--max-old-space-size=1536" npm run build
    cd ..
fi

# 2. Install lightweight backend dependencies
cd backend
npm install --omit=dev
cd ..

echo "=========================================================="
echo "⚙️ [4/5] Configuring Nginx Reverse Proxy on Port 80..."
echo "=========================================================="
sudo tee /etc/nginx/sites-available/visitor-counter > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # Reverse proxy all requests to the unified Node.js server on port 5001
    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disable buffering for Server-Sent Events (SSE)
        proxy_buffering off;
        proxy_read_timeout 86400s;
    }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/visitor-counter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "=========================================================="
echo "⚡ [5/5] Launching Node.js Service with PM2 Process Manager..."
echo "=========================================================="
pm2 stop visitor-counter 2>/dev/null || true
pm2 delete visitor-counter 2>/dev/null || true
pm2 start backend/server.js --name "visitor-counter"
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

# Query public metadata
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || true)
if [ -n "$TOKEN" ]; then
    PUBLIC_DNS=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-hostname 2>/dev/null || true)
else
    PUBLIC_DNS=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname 2>/dev/null || true)
fi
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com 2>/dev/null || true)

echo "=============================================================================="
echo "✅ DEPLOYMENT COMPLETE!"
if [ -n "$PUBLIC_DNS" ]; then
echo "🌐 AWS amazonaws.com URL : http://$PUBLIC_DNS"
fi
echo "🌐 Public IP URL        : http://$PUBLIC_IP"
echo "=============================================================================="
