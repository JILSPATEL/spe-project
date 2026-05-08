#!/bin/bash

# ──────────────────────────────────────────────────
# Kubernetes Deployment Script
# Reads .env file, generates config/secret in their
# respective subdirectories, then deploys everything.
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

# Auto-detect Minikube and use the correct DB host
# In Minikube, host.docker.internal does not resolve - use host.minikube.internal instead
K8S_DB_HOST="${DB_HOST}"
if kubectl config current-context 2>/dev/null | grep -q "minikube"; then
    echo "Minikube detected - using reachable host bridge for DB_HOST"
    K8S_DB_HOST="${MINIKUBE_DB_HOST:-172.18.0.1}"
fi

# Step 1 - Generate ConfigMap YAML from .env values
echo "Generating configmap/01-config.yaml..."
cat > "$SCRIPT_DIR/configmap/01-config.yaml" <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: ecommerce-config
  labels:
    app: ecommerce
data:
  DB_HOST: "${K8S_DB_HOST}"
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
echo "Generating secret/02-secret.yaml..."
cat > "$SCRIPT_DIR/secret/02-secret.yaml" <<EOF
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

# Step 3 - Apply everything in dependency order
echo ""
echo "Applying Kubernetes manifests..."

echo "  [1/5] Applying ConfigMap..."
kubectl apply -f "$SCRIPT_DIR/configmap/"

echo "  [2/5] Applying Secrets..."
kubectl apply -f "$SCRIPT_DIR/secret/"

echo "  [3/5] Applying Services..."
kubectl apply -f "$SCRIPT_DIR/service/"

echo "  [4/5] Applying Deployments..."
kubectl apply -f "$SCRIPT_DIR/deployment/"

echo "  [5/5] Applying HPAs..."
kubectl apply -f "$SCRIPT_DIR/hpa/"

echo ""
echo "Waiting for frontend rollout..."
kubectl rollout status deployment/frontend --timeout=120s

echo ""
echo "✅ Deployment complete!"
echo "Run 'kubectl get pods' to check pod status."
echo ""
echo "Access the application at:"
if kubectl config current-context 2>/dev/null | grep -q "minikube" && command -v minikube >/dev/null 2>&1; then
    "$SCRIPT_DIR/setup-minikube-route.sh" || echo "  Frontend  - http://localhost:30001"
else
    echo "  Frontend  - http://localhost:30001"
fi
echo ""
echo "Check HPA status with:"
echo "  kubectl get hpa"
