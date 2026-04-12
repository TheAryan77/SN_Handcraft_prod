# ============================================
# SN HandCrafts — Multi-service Dockerfile
# Integrated build & runtime for Render
# ============================================

FROM node:22-alpine AS base
RUN apk add --no-cache nginx supervisor envsubst

# ── API Builder ───────────────────────────────
FROM base AS api-build
WORKDIR /build/api
COPY api/package*.json ./
RUN npm i --legacy-peer-deps
COPY api/ .
RUN npx prisma generate
RUN npm run build

# ── Web Builder ──────────────────────────────
FROM base AS web-build
WORKDIR /build/web

# Arguments for variables needed at Build Time (Next.js public vars)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID

COPY web/package*.json ./
RUN npm i --legacy-peer-deps
COPY web/ .

# Bake public variables in for the build process (Next.js needs them now)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Admin Builder ─────────────────────────────
FROM base AS admin-build
WORKDIR /build/admin
ARG NEXT_PUBLIC_API_BASE_URL

COPY admin/package*.json ./
RUN npm i --legacy-peer-deps
COPY admin/ .

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Final Runtime Image ───────────────────────
FROM base AS runtime
ENV NODE_ENV=production

# 1. API runtime
WORKDIR /app/api
COPY --from=api-build /build/api/package*.json ./
COPY --from=api-build /build/api/node_modules ./node_modules
COPY --from=api-build /build/api/dist ./dist
COPY --from=api-build /build/api/prisma ./prisma
COPY --from=api-build /build/api/node_modules/.prisma ./node_modules/.prisma

# 2. Web runtime
WORKDIR /app/web
COPY --from=web-build /build/web/package*.json ./
COPY --from=web-build /build/web/node_modules ./node_modules
COPY --from=web-build /build/web/.next ./.next
# Copy public folder only if it exists
COPY --from=web-build /build/web/public* ./public/

# 3. Admin runtime
WORKDIR /app/admin
COPY --from=admin-build /build/admin/package*.json ./
COPY --from=admin-build /build/admin/node_modules ./node_modules
COPY --from=admin-build /build/admin/.next ./.next
# Copy public folder only if it exists (using wildcard to avoid crash if missing)
COPY --from=admin-build /build/admin/public* ./public/

# Reverse Proxy Config
COPY nginx.conf /etc/nginx/nginx.conf.template

# Supervisor Configuration
RUN mkdir -p /var/log/supervisor
COPY <<'EOF' /etc/supervisord.conf
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log

[program:api]
command=node dist/server.js
directory=/app/api
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
autorestart=true

[program:web]
command=npm start
directory=/app/web
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
autorestart=true

[program:admin]
command=npm start
directory=/app/admin
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
autorestart=true

[program:nginx]
command=nginx -g "daemon off;"
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
autorestart=true
EOF

# Startup script to bridge Render Environment to App Environment
COPY <<'SCRIPT' /app/start.sh
#!/bin/sh
# Setup Nginx Dynamic Port
export NGINX_PORT=${PORT:-80}
envsubst '${NGINX_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# --- GENERATE .env FOR API ---
# In production on Render, these variables are provided by the platform.
cat <<ENV > /app/api/.env
NODE_ENV=${NODE_ENV:-production}
API_PORT=4000
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-7d}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN:-30d}
RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
IMAGEKIT_URL_ENDPOINT=${IMAGEKIT_URL_ENDPOINT}
IMAGEKIT_PUBLIC_KEY=${IMAGEKIT_PUBLIC_KEY}
IMAGEKIT_PRIVATE_KEY=${IMAGEKIT_PRIVATE_KEY}
IMAGEKIT_BASE_FOLDER=${IMAGEKIT_BASE_FOLDER}
SHIPROCKET_EMAIL=${SHIPROCKET_EMAIL}
SHIPROCKET_PASSWORD=${SHIPROCKET_PASSWORD}
SHIPROCKET_BASE_URL=${SHIPROCKET_BASE_URL}
ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS:-900000}
RATE_LIMIT_MAX=${RATE_LIMIT_MAX:-100}
ENV

# --- GENERATE .env FOR WEB ---
echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" > /app/web/.env
echo "NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}" >> /app/web/.env

# --- GENERATE .env FOR ADMIN ---
echo "NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}" > /app/admin/.env

# --- RUN DATABASE MIGRATIONS ---
# This ensures your production database (NeonDB) stays in sync with your schema
echo "Running database migrations..."
cd /app/api && npx prisma migrate deploy

# Start Supervisor
exec supervisord -c /etc/supervisord.conf
SCRIPT
RUN chmod +x /app/start.sh

WORKDIR /app
EXPOSE 80 4000 3001 3002

CMD ["/app/start.sh"]
