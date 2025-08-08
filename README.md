# Full-Stack Web Project

This project implements a Backend and Frontent Using Express, Mongoose ODM, and Jest, and React.
In this chapter, we will create a backend and frontend Docker images.

## Build the Backend Docker Image
```bash
docker image build -t blog-backend backend/
```


## Create a container from the blog-backend image

### Requirements
To create a container from our blog-backend image, we need to make sure that the `mongo` Docker container is running.

```bash
docker run -d --name dbserver -p 27017:27017 --restart unless-stopped mongo:8.0.11
```
### Create
```bash
docker run -it --rm --add-host=host.docker.internal:host-gateway -e PORT=3001 -e DATABASE_URL=mongodb://host.docker.internal:27017/blog -p 3001:3001 blog-backend
```

**To acces the API, go to: http://localhost:3001/api/v1/posts**


## Build the Frontend Docker Image

```bash 
docker build -t blog-frontend .
```

### Creating and running the Frontend container
```bash
docker run -it --rm -p 3000:80 blog-frontend
```

**To acces the FrontEnd, go to: http://localhost:3000**

## Managing multiple images using Docker Compose

Make sure to stop the MongoDB, the FrontEnd, and the Backend containers before  you run the `docker composite` command.

```bash
docker compose up
```

**To check the FrontEnd, go back to: http://localhost:3000**

#### .env file

Since .env contains sensitive credentials, so it should always be in .gitignore file to prevent you from accidentally committing passwords, secrets, or tokens.
Make a copy of .env.template file that contains the variable names without actual secrets

```bash
cd backend/
cp .env.template .env
```

### Start



if, `mongo` is not nunning, run the following command to start a new container:

```bash
docker run -d --name dbserver -p 27017:27017 --restart unless-stopped mongo:8.0.11
```

To run the backend in dev mode, run the following command:

```bash
npm run dev
```

For production mode, run:

```bash
npm start
```

**To acces the API, go to: http://localhost:3001/api/v1/posts**

To exit the web server, press the `Ctrl+C` key combination.

## Frontend

### Requirements

1. Before running the frontend, please make sure to start the backend by following the instructions above.
2. To install the dependencies for the frontend by running this following command:

```bash
npm install
```

### Start

To start the app in development mode, run the following command:

```bash
npm run dev
```


