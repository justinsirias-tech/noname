# Production Dockerfile for Google Cloud Run / Container Registry
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Production runtime image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --only=production

# Copy built assets and server code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/bangkok ./bangkok
COPY --from=builder /app/pattaya ./pattaya
COPY --from=builder /app/css ./css
COPY --from=builder /app/server ./server
COPY --from=builder /app/index.html ./index.html
COPY --from=builder /app/manifest.json ./manifest.json
COPY --from=builder /app/robots.txt ./robots.txt
COPY --from=builder /app/sitemap.xml ./sitemap.xml

EXPOSE 8080

CMD ["node", "server/index.js"]
