# Blog Backend API

Express 5 API for posts and users, backed by MongoDB via Mongoose. The backend is deployed to Google Cloud Run and uses JWT authentication for protected post mutations.

## Runtime Overview

- Node.js backend with ES modules
- MongoDB via Mongoose
- JWT auth via `express-jwt`
- Public auth routes for login and signup
- Protected create, update, and delete post routes
- Node.js 22+
- npm
- Docker or another reachable MongoDB instance

### Install

npm install

````

### Start MongoDB

```bash
docker run -d --name dbserver -p 27017:27017 --restart unless-stopped mongo:8.0.11
````

### Local Environment

Create `backend/.env` with values similar to:

```dotenv
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/blog
PORT=8080
JWT_SECRET=replace-me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

Notes:

- `JWT_SECRET` is required during backend startup.
- `JWT_EXPIRES_IN` is currently used as a duration string such as `7d`.
- `DATABASE_URL` controls which MongoDB database is used. The app does not currently consume a separate `MONGO_DB_NAME` variable.

### Start the Server

````

Other modes:

```bash
npm start
npm run staging
````

## API Surface

### Posts

- `GET /api/v1/posts`
- `GET /api/v1/posts/:id`
- `POST /api/v1/posts` (JWT required)
- `PATCH /api/v1/posts/:id` (JWT required)
- `DELETE /api/v1/posts/:id` (JWT required)
- `sortBy`
- `sortOrder`

- `GET /api/v1/user/:id`

## Auth Model

- JWTs are signed with `JWT_SECRET` and expire according to `JWT_EXPIRES_IN`.
- Frontend stores the returned bearer token and sends it on protected requests.

npm run test:integration
npm run test:smoke

````

Test setup details:

- Jest unit/service tests use `mongodb-memory-server`.
- Integration tests live in `src/__tests__/endpoints.integration.test.js`.
- Smoke tests use Playwright.

See [TESTING.md](TESTING.md) for more detail.
```text
backend/
├── src/app.js                  # Express app wiring
├── src/index.js                # Config load, JWT init, DB init, server start
├── src/config/env.js           # Environment file loading
├── src/db/init.js              # Mongoose connection
├── src/middleware/jwt.js       # JWT middleware initialization
├── src/routes/posts.js         # Post endpoints
├── src/routes/users.js         # Auth and user endpoints
├── src/services/posts.js       # Post business logic
├── src/services/users.js       # User and login logic
└── test/                       # Jest global setup/teardown helpers
````

## Production Deployment

The backend is deployed by [../.github/workflows/cd-backend.yaml](../.github/workflows/cd-backend.yaml) with these current characteristics:

- Cloud Run service: `blog-backend-service`
- GCP project: `oidc-github-01`
- Region: `us-central1`
- Image source: Docker Hub commit-tagged image
- Runtime service account: `blog-backend-runtime@oidc-github-01.iam.gserviceaccount.com`
- `JWT_EXPIRES_IN=7d`
- `DATABASE_URL` from GCP Secret Manager secret `MONGODB_URI`
- `JWT_SECRET` from GCP Secret Manager secret `JWT_SECRET`

- [ENV_CONFIG.md](ENV_CONFIG.md)
- [TESTING.md](TESTING.md)
- [../.github/workflows/README.md](../.github/workflows/README.md)

3. MongoDB Atlas is used for production database

## Troubleshooting

### Tests failing

- Ensure `npm install` completed successfully
- Check that `NODE_ENV=test` when running tests
- See [TESTING.md](./TESTING.md) for test-specific troubleshooting

### Database connection errors

- Verify `DATABASE_URL` is correct in `.env`
- Ensure MongoDB is running (for local development)
- Check network connectivity to MongoDB Atlas (if using cloud)

### Port already in use

- Change `PORT` in `.env`
- Or kill the process using the port

## License

ISC

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test`
4. Run linter: `npm run lint`
5. Commit with clear messages
6. Push and create a pull request
