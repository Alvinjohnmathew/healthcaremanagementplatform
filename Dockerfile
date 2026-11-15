# Multi-stage build for CareBridge 360
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the client production assets
RUN npm --workspace=client run build

# Stage 2: Production runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules and built artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/client/package*.json ./client/
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server

# Create data directory for JSON persistence
RUN mkdir -p /app/server/data

EXPOSE 5000

CMD ["node", "--import", "tsx", "server/src/index.ts"]
