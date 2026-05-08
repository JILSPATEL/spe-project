# Stage 1: Build the Vite application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the Nginx configuration template to a staging location
COPY nginx.conf.template /etc/nginx/nginx.conf.template

EXPOSE 5173

# Override CMD: run envsubst only on our placeholders so nginx variables
# like $uri, $host, $remote_addr are NOT touched, then start nginx.
CMD ["/bin/sh", "-c", "export API_GATEWAY_URL=${VITE_PROXY_TARGET:-http://${API_GATEWAY_SERVICE_HOST:-api-gateway}:${API_GATEWAY_SERVICE_PORT:-5000}} && envsubst '${API_GATEWAY_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
