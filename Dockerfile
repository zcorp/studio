# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifest first (layer cache optimisation)
COPY package.json ./

# Install all dependencies (no lockfile required)
RUN npm install --no-audit --no-fund

# Copy full source
COPY . .

# Build production bundle
RUN npm run build

# ── Stage 2: Preview (serve built output) ────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Re-install only what vite preview needs
COPY package.json ./
RUN npm install --no-audit --no-fund

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.js ./vite.config.js

EXPOSE 5173

# Vite preview serves the dist/ folder
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
