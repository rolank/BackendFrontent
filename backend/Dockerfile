FROM node:22.21.1
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 8080
ENV PORT 8080
CMD ["npm", "start"]
