FROM node:18-alpine
WORKDIR /app

# Accept service name as build argument
ARG SERVICE_NAME=job-acquisition

# Copy the specific service
COPY ${SERVICE_NAME}/package*.json ./
RUN npm install

COPY ${SERVICE_NAME}/src ./src

# Start the service
CMD ["npm", "start"]
