# API Service - Main Express.js Application
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose API port
EXPOSE 3005

# Start the API server
CMD ["node", "server.js"]
