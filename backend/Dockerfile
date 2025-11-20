# backend/Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# copy only package files and install first for caching
COPY package*.json ./
RUN npm ci --only=production

# copy source
COPY . .

# make sure port 8080 is exposed
EXPOSE 8080

# runtime environment
ENV NODE_ENV=production

# start the app
CMD ["node", "index.js"]