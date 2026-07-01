# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production ────────────────────────────────────────
FROM node:22-alpine AS production

LABEL maintainer="APEXiq Team"
LABEL description="APEXiq Frontend - Race Intelligence OS"

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S apexiq && \
    adduser -S apexiq -u 1001 -G apexiq

WORKDIR /app

COPY --from=builder --chown=apexiq:apexiq /app/dist ./dist
COPY --from=builder --chown=apexiq:apexiq /app/node_modules ./node_modules
COPY --from=builder --chown=apexiq:apexiq /app/package.json ./

USER apexiq

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "dist/server/server.js"]
