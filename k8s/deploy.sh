#!/bin/bash

# ──────────────────────────────────────────────────
# Kubernetes Deployment Script
# Reads .env file and deploys all resources
# ──────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR - .env file not found at $ENV_FILE"
    echo "Please create a .env file in the project root with your configuration."
    exit 1
fi

# Source the .env file
echo "Reading configuration from .env file..."
set -a
source "$ENV_FILE"
set +a

# Step 1 - Generate ConfigMap YAML from .env values
echo "Generating 01-config.yaml..."
cat > "$SCRIPT_DIR/01-config.yaml" <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: ecommerce-config
  labels:
    app: ecommerce
data:
  DB_HOST: "${DB_HOST}"
  DB_PORT: "${DB_PORT}"
  DB_USER: "${DB_USER}"
  DB_NAME: "${DB_NAME}"
  PORT: "${PORT}"
  FRONTEND_URL: "${FRONTEND_URL}"
  NODE_ENV: "${NODE_ENV}"
  USER_SERVICE_URL: "http://user-service:5001"
  SELLER_SERVICE_URL: "http://seller-service:5002"
  PRODUCT_SERVICE_URL: "http://product-service:5003"
  CART_SERVICE_URL: "http://cart-service:5004"
  ORDER_SERVICE_URL: "http://order-service:5005"
EOF

# Step 2 - Generate Secret YAML from .env values
echo "Generating 02-secret.yaml..."
cat > "$SCRIPT_DIR/02-secret.yaml" <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: ecommerce-secret
  labels:
    app: ecommerce
type: Opaque
stringData:
  DB_PASSWORD: "${DB_PASSWORD}"
  JWT_SECRET: "${JWT_SECRET}"
EOF

# Step 3 - Apply everything
echo "Applying all Kubernetes manifests..."
kubectl apply -f "$SCRIPT_DIR/"

echo ""
echo "Deployment complete!"
echo "Run 'kubectl get pods' to check pod status."
echo ""
echo "Access the application at:"
echo "  Frontend - http://localhost:30001"
echo "  (For Minikube run: minikube service frontend --url)"
