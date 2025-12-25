# Use Node.js base image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "dev"]
