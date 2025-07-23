# Stage 1: Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend .
RUN npm run build

# Stage 2: Build backend and copy frontend build
FROM node:18

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source code
COPY backend ./backend

# Copy built frontend into backend/public 
COPY --from=frontend-builder /app/frontend/dist ./backend/dist

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "server.js"]
