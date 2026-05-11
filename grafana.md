# Grafana Monitoring — Usage Guide

> **Stack:** Prometheus + Grafana + kube-state-metrics + node-exporter  
> **Namespace:** `monitoring`  
> **Pre-built dashboard:** *SPE E-Commerce — K8s Overview*

---

## What Gets Monitored

| Component | What It Measures |
|-----------|-----------------|
| **node-exporter** | Host CPU %, memory, disk I/O, network bytes/sec |
| **kube-state-metrics** | Pod phases, deployment replicas, HPA current/desired, restart counts |
| **cAdvisor** (via kubelet) | Per-container CPU cores, memory working-set bytes |
| **Prometheus self** | Prometheus scrape health & performance |
| **Kubernetes API server** | API server availability |

---

## Accessing Grafana

### Option A — Via Minikube NodePort (if route is set up)

```bash
# Get Minikube IP
minikube ip
# Open in browser: http://<minikube-ip>:32000
```

### Option B — Via Port-Forward (works on all setups, including Docker driver)

```bash
kubectl port-forward svc/grafana 4000:3000 -n monitoring
```

Then open: **http://localhost:4000**

> [!NOTE]
> We recommend using port **4000** instead of 3000 to avoid conflicts with other local services (like your frontend dev server). If you must use 3000, ensure no other process is listening on that port.


### Login Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

> [!TIP]
> When prompted to change the password on first login, click **"Skip"** to keep using `admin123`.

---

## Accessing Prometheus

```bash
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
```

Then open: **http://localhost:9090**

Useful Prometheus pages:
- **`/targets`** — shows scrape status of all jobs (all should be `UP`)
- **`/graph`** — run ad-hoc PromQL queries
- **`/config`** — view the active scrape configuration

---

## Pre-Built Dashboard: SPE E-Commerce — K8s Overview

The dashboard loads automatically as the **home screen** after login.  
You can also find it at: **Dashboards → SPE E-Commerce → SPE E-Commerce — K8s Overview**

### Dashboard Sections

| Section | Panels | What to Look For |
|---------|--------|-----------------|
| **🏥 Pod Health** | Running pods count, Failed pods, Total restarts, Pending pods | All green stats; restarts should be low |
| **⚙️ CPU Usage per Service** | CPU cores per pod (time series), Memory per pod | Flat lines = idle; spikes = load |
| **📊 Deployment Replicas & HPA** | Ready replicas per deployment, HPA current vs desired | HPA lines diverge during load tests |
| **🔄 Pod Restarts & Stability** | Restart count table, Restart rate graph | Red rows = pods crashing |
| **🖥️ Node Resources** | Node CPU % over time, Memory used vs total, Network I/O | Sustained high CPU triggers HPA |

### Dashboard Time Controls

| Control | Location | Usage |
|---------|----------|-------|
| Time range picker | Top-right | Change to `Last 5m`, `Last 1h`, `Last 24h`, etc. |
| Refresh interval | Top-right (clock icon) | Set to `30s` for live monitoring |
| Zoom in | Click-drag on any graph | Inspect a specific spike or event |

---

## Useful PromQL Queries (run in Prometheus or Grafana Explore)

### Pod & Deployment Health

```promql
# Count running pods in the default namespace
count(kube_pod_status_phase{namespace="default", phase="Running"})

# Ready replicas per deployment
kube_deployment_status_replicas_ready{namespace="default"}

# Pod restart count (all containers)
sum by (pod) (kube_pod_container_status_restarts_total{namespace="default"})

# HPA current vs desired replicas
kube_horizontalpodautoscaler_status_current_replicas{namespace="default"}
kube_horizontalpodautoscaler_status_desired_replicas{namespace="default"}
```

### CPU & Memory

```promql
# CPU usage per pod (in cores)
sum by (pod) (
  rate(container_cpu_usage_seconds_total{namespace="default", container!="", container!="POD"}[2m])
)

# Memory working-set per pod
sum by (pod) (
  container_memory_working_set_bytes{namespace="default", container!="", container!="POD"}
)

# Node CPU usage %
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[2m])) * 100)

# Node memory usage %
100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes))
```

### Network

```promql
# Network receive bytes/sec (excluding loopback and virtual interfaces)
rate(node_network_receive_bytes_total{device!~"lo|veth.*|docker.*|br.*"}[2m])

# Network transmit bytes/sec
rate(node_network_transmit_bytes_total{device!~"lo|veth.*|docker.*|br.*"}[2m])
```

---

## Monitoring During HPA Load Tests

This is the best way to use Grafana in a demo. Open two windows side-by-side:

**Window 1 — Load generator (terminal):**
```bash
kubectl run load-generator \
  --image=busybox:1.28 \
  --restart=Never \
  --rm -it \
  -- /bin/sh -c "while true; do wget -q -O- http://api-gateway:5000/api/products; done"
```

**Window 2 — Grafana dashboard:**
- Open **http://localhost:3000** (after port-forward)
- Set time range to **Last 5 minutes**
- Set auto-refresh to **10s**
- Watch the **CPU Usage per Service** panel spike
- Watch the **HPA Current vs Desired Replicas** panel show scale-up

Within ~90 seconds you will see:
1. CPU graphs spike for `api-gateway` and `product-service`
2. HPA desired replicas increase above 1
3. New pods appear in the **Running Pods** stat panel

---

## Checking Scrape Target Health

To verify all Prometheus targets are `UP`:

```bash
# Quick check via Prometheus API
kubectl port-forward svc/prometheus 9090:9090 -n monitoring &
sleep 5
curl -s http://localhost:9090/api/v1/targets | python3 -c "
import sys, json
data = json.load(sys.stdin)
for t in data['data']['activeTargets']:
    print(t['labels'].get('job','?'), '->', t['health'])
"
```

Expected output:
```
kube-state-metrics   -> up
kubernetes-apiservers -> up
kubernetes-cadvisor  -> up
node-exporter        -> up
prometheus           -> up
```

---

## Day-to-Day Operations

### Restart the monitoring stack

```bash
kubectl rollout restart deployment/grafana -n monitoring
kubectl rollout restart deployment/prometheus -n monitoring
kubectl rollout restart deployment/kube-state-metrics -n monitoring
```

### Check all monitoring pods

```bash
kubectl get pods -n monitoring
kubectl get pods -n monitoring --watch
```

### View Grafana logs

```bash
kubectl logs deployment/grafana -n monitoring --tail=50
kubectl logs deployment/grafana -n monitoring -f
```

### View Prometheus logs

```bash
kubectl logs deployment/prometheus -n monitoring --tail=50
```

### Re-deploy the monitoring stack from scratch

```bash
# Tear down
kubectl delete namespace monitoring

# Re-deploy (wait ~10 seconds for namespace to fully terminate first)
sleep 15
bash k8s/monitoring/deploy-monitoring.sh
```

### Update the Prometheus scrape config

1. Edit `k8s/monitoring/03-prometheus-configmap.yaml`
2. Apply and restart:
   ```bash
   kubectl apply -f k8s/monitoring/03-prometheus-configmap.yaml
   kubectl rollout restart deployment/prometheus -n monitoring
   ```

### Add a new Grafana dashboard

1. Create your dashboard in the Grafana UI
2. Export it as JSON (**Dashboard settings → JSON Model**)
3. Add it to `k8s/monitoring/09-grafana-dashboard-cm.yaml` under `data:`
4. Apply:
   ```bash
   kubectl apply -f k8s/monitoring/09-grafana-dashboard-cm.yaml
   kubectl rollout restart deployment/grafana -n monitoring
   ```

---

## File Structure

```
k8s/monitoring/
├── 01-namespace.yaml              # 'monitoring' namespace
├── 02-prometheus-rbac.yaml        # ServiceAccount + ClusterRole for Prometheus
├── 03-prometheus-configmap.yaml   # Prometheus scrape config (edit to add jobs)
├── 04-prometheus-deploy.yaml      # Prometheus Deployment + NodePort :32090
├── 05-kube-state-metrics.yaml     # kube-state-metrics Deployment + RBAC
├── 06-node-exporter.yaml          # node-exporter DaemonSet (host metrics)
├── 07-grafana-datasource.yaml     # Auto-provisions Prometheus datasource
├── 08-grafana-dashboard-provider.yaml  # Tells Grafana where to find dashboards
├── 09-grafana-dashboard-cm.yaml   # Pre-built SPE E-Commerce dashboard JSON
├── 10-grafana-deploy.yaml         # Grafana Deployment + NodePort :32000
└── deploy-monitoring.sh           # One-command deploy script
```

---

## Ports Reference

| Service | NodePort | Port-Forward Command |
|---------|----------|---------------------|
| Grafana | `32000` | `kubectl port-forward svc/grafana 3000:3000 -n monitoring` |
| Prometheus | `32090` | `kubectl port-forward svc/prometheus 9090:9090 -n monitoring` |

> [!NOTE]
> On Minikube with the **Docker driver** (Linux), NodePort URLs like `http://192.168.49.2:32000` are not directly reachable from the host browser. Always use the **port-forward** command and access via **localhost**.

> [!IMPORTANT]
> All monitoring manifests are committed to Git and applied automatically when running `./k8s/deploy.sh`. Both devices (Device A and Device B) get an identical monitoring stack just by running the standard deploy script — no device-specific config is needed.
> 
> **Datasource Configuration:** The Grafana datasource is configured to use the Prometheus NodePort URL (`http://192.168.49.2:32090`) instead of the internal service name. This bypasses a common CoreDNS resolution issue in Minikube Docker-driver environments, ensuring the dashboard works immediately after deployment.

---

## Verified Working State

```
NAME                                  READY   STATUS    RESTARTS
grafana-5ff79dfb96-xf9kt              1/1     Running   0
kube-state-metrics-7cbb4d49c8-9jd5t   1/1     Running   0
node-exporter-7jlf4                   1/1     Running   0
prometheus-7f7f4b9f48-brthb           1/1     Running   0
```

**Prometheus targets:** ✅ 5/5 UP  
**Grafana datasource:** ✅ Prometheus auto-configured  
**Dashboard:** ✅ *SPE E-Commerce — K8s Overview* auto-loaded  
**Grafana API health:** ✅ `{"database":"ok","version":"10.4.2"}`
