FROM node:20-alpine

# Set build arguments for security
ENV NODE_ENV=production

# Create non-root user and group
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Generate Prisma Client (needed for DB access)
RUN npx prisma generate

# Ensure the app directory is owned by the non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user for execution
USER appuser

EXPOSE 5000
CMD ["node", "index.js"]
