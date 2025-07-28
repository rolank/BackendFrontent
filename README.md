# Full-Stack Web Project

This project implements a Backend and Frontent Using Express, Mongoose ODM, and Jest, and React.

## Backend

### Requirements

To install the dependencies for the backend, run:

```bash
cd backend/
npm install
```

#### .env file

Since .env contains sensitive credentials, so it should always be in .gitignore file to prevent you from accidentally committing passwords, secrets, or tokens.
Make a copy of .env.template file that contains the variable names without actual secrets

```bash
cd backend/
cp .env.template .env
```

### Start

To start the backend service, you need to make sure that the `mongo` Docker container is running.

```bash
docker ps
```

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

**To acces the GUI, go to: http://localhost:5173**
