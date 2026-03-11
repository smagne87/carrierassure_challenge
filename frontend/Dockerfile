# --- AI-ASSISTED ---
# Tool: Claude 4.5 Sonnet
# Prompt: "Create multi-stage Dockerfile for Next.js 15 application with development and production targets"
# Modifications: Added optimizations, health checks, security best practices
# --- END AI-ASSISTED ---

# ========================================
# Stage 1: Base
# ========================================
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat curl

# ========================================
# Stage 2: Dependencies
# ========================================
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# ========================================
# Stage 3: Builder
# ========================================
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application files
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ========================================
# Stage 4: Development
# ========================================
FROM base AS development
WORKDIR /app

# Install all dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000

# Start development server
CMD ["npm", "run", "dev"]

# ========================================
# Stage 5: Production
# ========================================
FROM base AS production
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start production server
CMD ["npm", "start"]
