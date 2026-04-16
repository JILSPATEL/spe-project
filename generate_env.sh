#!/bin/bash

echo "🔧 Generating .env file..."

# ─────────────────────────────────────────
# Docker Hub
# ─────────────────────────────────────────
read -p "Enter Docker Hub username: " DOCKERHUB_USERNAME

IMAGE_BACKEND="$DOCKERHUB_USERNAME/backend"
IMAGE_FRONTEND="$DOCKERHUB_USERNAME/frontend"

# ─────────────────────────────────────────
# Database
# ─────────────────────────────────────────
read -p "Enter DB host [default: host.docker.internal]: " DB_HOST
DB_HOST=${DB_HOST:-host.docker.internal}

read -p "Enter DB port [default: 3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "Enter DB user [default: root]: " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Enter DB password: " DB_PASSWORD
echo ""

read -p "Enter DB name [default: ecommerce_solution]: " DB_NAME
DB_NAME=${DB_NAME:-ecommerce_solution}

# ─────────────────────────────────────────
# Backend
# ─────────────────────────────────────────
PORT=5000
FRONTEND_URL="http://localhost:3000"

read -s -p "Enter JWT Secret: " JWT_SECRET
echo ""

NODE_ENV="development"

# ─────────────────────────────────────────
# Frontend
# ─────────────────────────────────────────
VITE_API_URL="/api"

# ─────────────────────────────────────────
# Jenkins
# ─────────────────────────────────────────
JENKINS_CREDENTIALS_ID="dockerhub-cred"

# ─────────────────────────────────────────
# Write to .env
# ─────────────────────────────────────────

cat <<EOF > .env
# Docker Hub
DOCKERHUB_USERNAME=$DOCKERHUB_USERNAME
IMAGE_BACKEND=$IMAGE_BACKEND
IMAGE_FRONTEND=$IMAGE_FRONTEND

# Database
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# Backend App
PORT=$PORT
FRONTEND_URL=$FRONTEND_URL
JWT_SECRET=$JWT_SECRET
NODE_ENV=$NODE_ENV

# Frontend
VITE_API_URL=$VITE_API_URL

# Jenkins
JENKINS_CREDENTIALS_ID=$JENKINS_CREDENTIALS_ID
EOF

echo "✅ .env file generated successfully!"