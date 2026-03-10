# --- AI-ASSISTED ---
# Tool: Claude 4.5 Sonnet
# Prompt: "Create multi-stage Dockerfile for NestJS backend with development and production targets"
# Modifications: Added multi-stage build, separate dev/prod targets, optimized layer caching
# --- END AI-ASSISTED ---

# ========================================
# Stage 1: Base
# ========================================
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for native modules and health checks
RUN apk add --no-cache libc6-compat wget

# ========================================
# Stage 2: Dependencies
# ========================================
FROM base AS dependencies

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# ========================================
# Stage 3: Development
# ========================================
FROM base AS development

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start in development mode with hot reload
CMD ["npm", "run", "start:dev"]

# ========================================
# Stage 4: Builder
# ========================================
FROM base AS builder

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ========================================
# Stage 5: Production
# ========================================
FROM base AS production

# Set NODE_ENV
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
