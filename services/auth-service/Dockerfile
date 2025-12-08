# services/auth-service/Dockerfile

FROM node:18-alpine

# 1. Set working directory to the container root
WORKDIR /app

# 2. Copy the SHARED folder first (so it exists at /app/shared)
COPY shared ./shared

# 3. Copy the AUTH service code (so it exists at /app/services/auth-service)
COPY services/auth-service ./services/auth-service

# 4. Switch working directory to where the package.json is
WORKDIR /app/services/auth-service

# 5. Install dependencies
RUN npm install

# 6. Expose the port
EXPOSE 3001

# 7. Start the app
CMD ["npm", "run", "dev"]