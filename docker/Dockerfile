# Cyphertrade App - Production Dockerfile
# Multi-stage build: Next.js build -> Node.js runtime

FROM node:20-alpine AS builder

LABEL maintainer="Cyphertrade Team"
LABEL description="Cyphertrade Next.js App - Build Stage"

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment
ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

FROM node:20-alpine AS production

LABEL maintainer="Cyphertrade Team"
LABEL description="Cyphertrade Next.js App - Production"

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Expose port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start Next.js
CMD ["npm", "run", "start"]
