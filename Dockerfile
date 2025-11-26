FROM node:lts-jod AS build 
ARG BUILD_ARG_BACKEND_URL
# Set the backend URL environment variable using the build argument
ENV VITE_BACKEND_URL=${BUILD_ARG_BACKEND_URL}
WORKDIR /build
COPY package.json ./
COPY package-lock.json ./
RUN npm install 
COPY . .
RUN npm run build
FROM nginx AS final
WORKDIR /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist .
EXPOSE 8080