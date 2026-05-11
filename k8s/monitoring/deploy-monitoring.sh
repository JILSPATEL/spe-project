#!/bin/bash

# ──────────────────────────────────────────────────────────────
# Monitoring Stack Deployment Script
# Deploys Prometheus + Grafana + kube-state-metrics + node-exporter
# into the 'monitoring' namespace on Minikube.
# Safe to re-run anytime — all resources are idempotent.
# ──────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║     SPE E-Commerce — Monitoring Stack Deployer       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Namespace ──────────────────────────────────────────
echo "  [1/6] Creating monitoring namespace..."
kubectl apply -f "$SCRIPT_DIR/01-namespace.yaml"

# ── Step 2: Prometheus RBAC ───────────────────────────────────
echo "  [2/6] Applying Prometheus RBAC..."
kubectl apply -f "$SCRIPT_DIR/02-prometheus-rbac.yaml"

# ── Step 3: Prometheus ConfigMap + Deployment ─────────────────
echo "  [3/6] Deploying Prometheus..."
kubectl apply -f "$SCRIPT_DIR/03-prometheus-configmap.yaml"
kubectl apply -f "$SCRIPT_DIR/04-prometheus-deploy.yaml"

# ── Step 4: kube-state-metrics ────────────────────────────────
echo "  [4/6] Deploying kube-state-metrics..."
kubectl apply -f "$SCRIPT_DIR/05-kube-state-metrics.yaml"

# ── Step 5: node-exporter ─────────────────────────────────────
echo "  [5/6] Deploying node-exporter..."
kubectl apply -f "$SCRIPT_DIR/06-node-exporter.yaml"

# ── Step 6: Grafana ───────────────────────────────────────────
echo "  [6/6] Deploying Grafana (datasource + dashboards + app)..."

# Dynamically update the Prometheus URL in the datasource CM to the current Minikube IP
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "127.0.0.1")
sed "s/REPLACE_WITH_MINIKUBE_IP/$MINIKUBE_IP/g" "$SCRIPT_DIR/07-grafana-datasource.yaml" > "$SCRIPT_DIR/07-grafana-datasource.tmp.yaml"

kubectl apply -f "$SCRIPT_DIR/07-grafana-datasource.tmp.yaml"
rm "$SCRIPT_DIR/07-grafana-datasource.tmp.yaml"

kubectl apply -f "$SCRIPT_DIR/08-grafana-dashboard-provider.yaml"
kubectl apply -f "$SCRIPT_DIR/09-grafana-dashboard-cm.yaml"
kubectl apply -f "$SCRIPT_DIR/10-grafana-deploy.yaml"

echo ""
echo "⏳ Waiting for Grafana to become ready..."
kubectl rollout status deployment/grafana -n monitoring --timeout=120s

echo ""
echo "✅ Monitoring stack deployed successfully!"
echo ""

# ── Print access URLs ──────────────────────────────────────────
if kubectl config current-context 2>/dev/null | grep -q "minikube" && command -v minikube >/dev/null 2>&1; then
    MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "localhost")
    echo "  📊 Grafana   → http://${MINIKUBE_IP}:32000"
    echo "  🔥 Prometheus → http://${MINIKUBE_IP}:32090"
    echo ""
    echo "  Grafana login: admin / admin123"
    echo ""
    echo "  💡 If those URLs don't open, run in a new terminal:"
    echo "     kubectl port-forward svc/grafana 4000:3000 -n monitoring"
    echo "     Then open: http://localhost:4000"
else
    echo "  📊 Grafana        url: http://$(minikube ip 2>/dev/null || echo "localhost"):32090"
    echo "  🔥 Prometheus → http://localhost:32090"
    echo ""
    echo "  Grafana login: admin / admin123"
fi
echo ""
echo "  Check pod status:"
echo "    kubectl get pods -n monitoring"
echo ""
