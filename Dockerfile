# Build stage
FROM node:18-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy the built app from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
