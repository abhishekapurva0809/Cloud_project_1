# Multi-stage Dockerfile for Project 1 - Smart Visitor Counter
# 1. Build Stage for React Vite Three.js Frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# 2. Production Runtime Stage for Express Backend + Static Assets
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

COPY backend/ ./backend/
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

EXPOSE 5001

CMD ["node", "backend/server.js"]
