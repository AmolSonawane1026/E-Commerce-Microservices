# Dockerfile for auth-service

# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy shared resources (if any) from the repository root into the container
COPY shared ./shared

# Copy the auth-service source code (the build context is the repository root, so '.' refers to this directory)
COPY . .

# Install dependencies for the auth-service
RUN npm install

# Expose the service port (adjust if needed)
EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev"]