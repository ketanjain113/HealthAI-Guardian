# Build stage
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm install

# Copy public directory and source code
COPY public/ ./public/
COPY src/ ./src/

# Build the React app with environment variables
ARG REACT_APP_API_URL
ARG REACT_APP_MODEL_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_MODEL_API_URL=${REACT_APP_MODEL_API_URL}

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
