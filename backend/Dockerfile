FROM node:lts-jod
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3001/tcp
CMD ["npm", "start"]
