# services/order-service/Dockerfile

FROM node:18-alpine

# 1. Set the working directory to the "root" of the container project
WORKDIR /app

# 2. Copy the SHARED folder from your project root into the container
# This is crucial so your relative import (../../../shared) works
COPY shared ./shared

# 3. Copy the Order Service code into its specific nested folder
COPY services/order-service ./services/order-service

# 4. Move context into the order service folder
WORKDIR /app/services/order-service

# 5. Install dependencies specifically for this service
RUN npm install --production

# 6. Expose the port defined in your code (3003)
EXPOSE 3003

# 7. Start the service
CMD ["npm", "start"]