#!/bin/bash

set -euo pipefail

SERVICE_NAME="${1:-frontend}"
NAMESPACE="${NAMESPACE:-default}"
LOCAL_PORT="${LOCAL_PORT:-30001}"
PID_FILE="/tmp/spe-project-${NAMESPACE}-${SERVICE_NAME}-port-forward.pid"
LOG_FILE="/tmp/spe-project-${NAMESPACE}-${SERVICE_NAME}-port-forward.log"

if ! kubectl get svc "$SERVICE_NAME" -n "$NAMESPACE" >/dev/null 2>&1; then
    echo "ERROR - service '$SERVICE_NAME' was not found in namespace '$NAMESPACE'."
    echo "Deploy first with: ./k8s/deploy.sh"
    exit 1
fi

NODE_IP="$(minikube ip)"
NODE_PORT="$(kubectl get svc "$SERVICE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.ports[0].nodePort}')"
SERVICE_PORT="$(kubectl get svc "$SERVICE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.ports[0].port}')"
DIRECT_URL="http://${NODE_IP}:${NODE_PORT}"

if command -v curl >/dev/null 2>&1 && curl -fsS --max-time 3 "$DIRECT_URL" >/dev/null 2>&1; then
    echo "Frontend link:"
    echo "  ${DIRECT_URL}"
    exit 0
fi

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" >/dev/null 2>&1; then
    LOCAL_URL="http://127.0.0.1:${LOCAL_PORT}"
    if ! command -v curl >/dev/null 2>&1 || curl -fsS --max-time 2 "$LOCAL_URL" >/dev/null 2>&1; then
        echo "Frontend link:"
        echo "  ${LOCAL_URL}"
        exit 0
    fi

    kill "$(cat "$PID_FILE")" >/dev/null 2>&1 || true
    rm -f "$PID_FILE"
fi

nohup setsid kubectl port-forward -n "$NAMESPACE" "svc/${SERVICE_NAME}" "${LOCAL_PORT}:${SERVICE_PORT}" --address 127.0.0.1 </dev/null > "$LOG_FILE" 2>&1 &
echo "$!" > "$PID_FILE"

LOCAL_URL="http://127.0.0.1:${LOCAL_PORT}"
for _ in $(seq 1 20); do
    if ! kill -0 "$(cat "$PID_FILE")" >/dev/null 2>&1; then
        echo "ERROR - failed to start local frontend link. Log:"
        cat "$LOG_FILE"
        exit 1
    fi

    if ! command -v curl >/dev/null 2>&1 || curl -fsS --max-time 1 "$LOCAL_URL" >/dev/null 2>&1; then
        echo "Frontend link:"
        echo "  ${LOCAL_URL}"
        exit 0
    fi

    sleep 1
done

echo "Frontend link:"
echo "  ${LOCAL_URL}"
echo ""
echo "Port-forward is still starting. Log: ${LOG_FILE}"
