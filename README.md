# Full-Stack Blog Project

A modern full-stack web application with Express backend, React frontend, and MongoDB database. Deployed on Google Cloud Platform with CI/CD pipeline.

## Project Structure

```
├── backend/                 # Express.js REST API
│   ├── src/
│   ├── package.json
│   ├── jest.config.json
│   ├── Dockerfile
│   ├── README.md           # Backend documentation
│   └── TESTING.md          # Backend testing guide
├── src/                    # React frontend
│   ├── components/
│   ├── api/
│   └── config/
├── public/                 # Static assets
├── package.json            # Frontend dependencies
├── Dockerfile              # Frontend image
├── docker-compose.yaml     # Local development
└── README.md              # This file
```

## Quick Start

### Prerequisites

- Node.js 22.x+
- Docker & Docker Compose (optional, for local deployment)
- MongoDB (or use in-memory for testing)

### Local Development

**1. Install dependencies:**

```bash
# Backend
cd backend
npm install

# Frontend (from root)
npm install
```

**2. Environment setup:**

```bash
# Backend
cd backend
cp .env.example .env

# Frontend (from root)
# Uses VITE_BACKEND_URL for API connection
```

**3. Run backend:**

```bash
cd backend
npm run dev
```

**4. Run frontend:**

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`  
Backend API at `http://localhost:8080/api/v1`

### Running Tests

**Backend tests:**

```bash
cd backend
npm run test
```

See [backend/TESTING.md](./backend/TESTING.md) for detailed testing information.

## Docker & Docker Compose

### Local Development with Docker Compose

```bash
docker compose up
```

This starts:

- **Frontend**: http://localhost:3000 (nginx, port 8080)
- **Backend**: http://localhost:3001 (port 8080)
- **MongoDB**: mongodb://localhost:27017

Ports mapped: `3000:8080` (frontend), `3001:8080` (backend)

### Stop services:

```bash
docker compose down
```

## Documentation

- **[Backend README](./backend/README.md)** - Express API, setup, and structure
- **[Backend Testing Guide](./backend/TESTING.md)** - Jest configuration and test architecture
- **[Environment Configuration](./backend/ENV_CONFIG.md)** - Environment variables setup
- **Frontend** - React/Vite setup and components

## Technology Stack

### Backend

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest with in-memory MongoDB
- **Validation**: Mongoose schemas
- **Authentication**: Ready for JWT integration

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **HTTP Client**: Fetch API
- **Routing**: React Router v7
- **State Management**: React Query

### Infrastructure

- **Containerization**: Docker
- **Orchestration**: Docker Compose (local), Cloud Run (production)
- **Cloud Platform**: Google Cloud Platform
- **CI/CD**: GitHub Actions
- **Database**: MongoDB Atlas (production)

## API Endpoints

### Posts

- `GET /api/v1/posts` - List all posts (with filtering/sorting)
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts/:id` - Get specific post
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post

### Users

- `GET /api/v1/users/:username` - Get user
- `POST /api/v1/users` - Create user
- `DELETE /api/v1/users/:username` - Delete user

Full API documentation see [backend/README.md](./backend/README.md)

## Environment Configuration

The project uses environment-specific configuration:

- `.env` - Default/local development
- `.env.development` - Development environment
- `.env.production` - Production (GCP)
- `.env.staging` - Staging environment
- `.env.test` - Test environment (backend only)

Backend automatically loads the appropriate `.env.[NODE_ENV]` file.

See [backend/ENV_CONFIG.md](./backend/ENV_CONFIG.md) for details.

## Deployment

### Google Cloud Platform

**Frontend deployment:**

```bash
gcloud builds submit --tag gcr.io/YOUR-PROJECT/blog-frontend \
  --build-arg BUILD_ARG_BACKEND_URL=https://your-backend-url/api/v1

gcloud run deploy blog-frontend \
  --image gcr.io/YOUR-PROJECT/blog-frontend \
  --region us-central1
```

**Backend deployment:**

```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR-PROJECT/blog-backend

gcloud run deploy blog-backend \
  --image gcr.io/YOUR-PROJECT/blog-backend \
  --region us-central1 \
  --set-env-vars DATABASE_URL=mongodb+srv://...
```

See CI/CD workflows in `.github/workflows/` for automated deployment.

## Project Highlights

✅ **Monorepo structure** - Frontend and backend in one repository  
✅ **Comprehensive tests** - Backend with Jest and in-memory MongoDB  
✅ **Environment management** - Different configs for dev/staging/prod  
✅ **Docker support** - Local development with Docker Compose  
✅ **CI/CD pipeline** - GitHub Actions for automated deployment  
✅ **Cloud native** - Designed for Google Cloud Platform  
✅ **Type safe** - Mongoose schemas for database validation  
✅ **API documented** - Clear endpoint structure with filtering/sorting

## Development Workflow

1. **Make changes** in `src/` (frontend) or `backend/src/` (backend)
2. **Run tests**: `cd backend && npm run test`
3. **Check linting**: `npm run lint`
4. **Commit** with clear messages
5. **Push** - GitHub Actions will test and deploy

## Troubleshooting

### Frontend can't connect to backend

- Check `VITE_BACKEND_URL` is set correctly
- See [backend/README.md](./backend/README.md#troubleshooting)

### Tests failing

- Ensure `npm install` completed in backend
- See [backend/TESTING.md](./backend/TESTING.md#troubleshooting)

### Docker issues

- Stop all containers: `docker compose down`
- Remove dangling containers: `docker system prune`
- Rebuild: `docker compose build --no-cache`

## License

ISC

## Contributing

1. Create a feature branch
2. Make changes
3. Run backend tests: `cd backend && npm run test`
4. Run linter: `npm run lint`
5. Push and create a pull request

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
