# ============================================
# SN HandCrafts — Multi-service Dockerfile
# Runs API + Web + Admin + Nginx in one container
# ============================================

FROM node:20-alpine AS base
RUN apk add --no-cache nginx supervisor envsubst

# ── Build API ─────────────────────────────────
FROM base AS api-build
WORKDIR /build/api
COPY api/package*.json ./
RUN npm ci
COPY api/ .
RUN npx prisma generate
RUN npm run build

# ── Build Web ─────────────────────────────────
FROM base AS web-build
WORKDIR /build/web
COPY web/package*.json ./
RUN npm ci
COPY web/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Build Admin ───────────────────────────────
FROM base AS admin-build
WORKDIR /build/admin
COPY admin/package*.json ./
RUN npm ci
COPY admin/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Final image ───────────────────────────────
FROM base AS runtime

# API
WORKDIR /app/api
COPY --from=api-build /build/api/package*.json ./
COPY --from=api-build /build/api/node_modules ./node_modules
COPY --from=api-build /build/api/dist ./dist
COPY --from=api-build /build/api/prisma ./prisma
COPY --from=api-build /build/api/node_modules/.prisma ./node_modules/.prisma

# Web
WORKDIR /app/web
COPY --from=web-build /build/web/package*.json ./
COPY --from=web-build /build/web/node_modules ./node_modules
COPY --from=web-build /build/web/.next ./.next
COPY --from=web-build /build/web/public ./public

# Admin
WORKDIR /app/admin
COPY --from=admin-build /build/admin/package*.json ./
COPY --from=admin-build /build/admin/node_modules ./node_modules
COPY --from=admin-build /build/admin/.next ./.next
COPY --from=admin-build /build/admin/public ./public

# Nginx template (will be resolved at runtime with $PORT)
COPY nginx.conf /etc/nginx/nginx.conf.template

# Supervisor config
RUN mkdir -p /var/log/supervisor
COPY <<'EOF' /etc/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log

[program:api]
command=node dist/server.js
directory=/app/api
environment=NODE_ENV=production,PORT=3000
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:web]
command=npm start
directory=/app/web
environment=NODE_ENV=production,PORT=3001,NEXT_PUBLIC_API_URL=http://127.0.0.1:3000/api/v1
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:admin]
command=npm start
directory=/app/admin
environment=NODE_ENV=production,PORT=3002,NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3000/api/v1
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:nginx]
command=nginx -g "daemon off;"
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
EOF

# Startup script: resolve nginx port then launch supervisor
COPY <<'SCRIPT' /app/start.sh
#!/bin/sh
export NGINX_PORT=${PORT:-80}
envsubst '${NGINX_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
exec supervisord -c /etc/supervisord.conf
SCRIPT
RUN chmod +x /app/start.sh

WORKDIR /app

CMD ["/app/start.sh"]
