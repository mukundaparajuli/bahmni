# -------------------------
# Stage 1: Build frontend
# -------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install frontend dependencies (cached unless package.json changes)
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy all frontend files and build
COPY frontend/ .
RUN npm run build

# -------------------------
# Stage 2: Build backend
# -------------------------
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

# Install backend dependencies (cached unless package.json changes)
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install && npx prisma generate

# Copy backend source code
COPY backend .

# -------------------------
# Stage 3: Production image
# -------------------------
FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY backend/package*.json ./
RUN npm install --only=production

# Copy built artifacts from previous stages
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend ./
COPY --from=frontend-builder /app/frontend/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5555

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Expose the backend port
EXPOSE ${PORT}

# Run migrations and start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]