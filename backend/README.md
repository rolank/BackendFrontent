# Blog Backend API

Express.js backend server for the blog application with MongoDB integration and comprehensive test coverage.

## Features

- RESTful API for blog posts and user management
- MongoDB integration with Mongoose
- JWT authentication (ready for implementation)
- Comprehensive Jest test suite with in-memory database
- CORS enabled for frontend integration
- Environment-based configuration (development, staging, production, test)

## Getting Started

### Prerequisites

- Node.js 22.x or later
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Available environment files:

- `.env` - Default/local development
- `.env.development` - Development environment
- `.env.production` - Production environment (GCP)
- `.env.staging` - Staging environment
- `.env.test` - Test environment

### Running the Application

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

**Staging:**

```bash
npm run staging
```

### Running Tests

**Run all tests:**

```bash
npm run test
```

**Run tests in watch mode:**

```bash
npm run test -- --watch
```

**Run specific test file:**

```bash
npm run test -- posts.test.js
```

**Run with coverage:**

```bash
npm run test -- --coverage
```

For detailed information about the test architecture, see [TESTING.md](./TESTING.md).

## Project Structure

```
src/
├── app.js                 # Express app configuration
├── index.js              # Server entry point
├── config/
│   └── env.js           # Environment configuration loader
├── db/
│   ├── init.js          # Database initialization
│   └── models/          # Mongoose models
│       ├── post.js
│       └── user.js
├── services/            # Business logic
│   ├── posts.js
│   └── users.js
├── routes/              # API routes
│   ├── posts.js
│   └── users.js
└── test/                # Test configuration
    ├── globalSetup.js
    ├── globalTeardown.js
    └── setupFileAfterEnv.js
__tests__/
└── posts.test.js        # Test files
```

## API Endpoints

### Posts

- `GET /api/v1/posts` - Get all posts (with filtering/sorting)
- `POST /api/v1/posts` - Create a new post
- `GET /api/v1/posts/:id` - Get a specific post
- `PUT /api/v1/posts/:id` - Update a post
- `DELETE /api/v1/posts/:id` - Delete a post

### Users

- `GET /api/v1/users/:username` - Get user by username
- `POST /api/v1/users` - Create a new user
- `DELETE /api/v1/users/:username` - Delete a user

## Database

### Development & Testing

Uses MongoDB (local or Atlas connection depending on `.env` settings).

### Test Environment

Automatically uses in-memory MongoDB instance via `mongodb-memory-server`. No external database needed for running tests.

## Environment Variables

| Variable       | Description               | Example                             |
| -------------- | ------------------------- | ----------------------------------- |
| `NODE_ENV`     | Environment name          | `development`, `production`, `test` |
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/blog`    |
| `PORT`         | Server port               | `8080`                              |

## Configuration Loading

The application uses a smart configuration system:

1. Base config from `.env`
2. Environment-specific overrides from `.env.[NODE_ENV]`
3. System environment variables (highest priority)

See [ENV_CONFIG.md](./ENV_CONFIG.md) for detailed configuration documentation.

## Testing

This project uses Jest with a multi-layer setup:

- **Global Setup**: Creates in-memory MongoDB instance
- **Per-File Setup**: Establishes database connection and creates test user
- **Individual Tests**: Run against isolated, fresh database

**Key features:**
✅ No external services required  
✅ Fast in-memory database  
✅ Complete test isolation  
✅ Idempotent test data

For comprehensive testing information, see [TESTING.md](./TESTING.md).

## Development

### Code Style

Uses ESLint and Prettier for code formatting:

```bash
npm run lint
```

### Database Models

Models are defined in `src/db/models/`:

- **Post**: Blog post with title, content, author, tags
- **User**: User with username, email, password

## GCP Deployment

When deploying to Google Cloud Platform:

1. Backend is deployed to Cloud Run
2. Environment variables are set in Cloud Run configuration
3. MongoDB Atlas is used for production database

The application expects `DATABASE_URL` to be injected at runtime in production.

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
