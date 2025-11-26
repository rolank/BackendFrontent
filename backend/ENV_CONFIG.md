# Environment Configuration

This project uses environment-specific configuration files to manage different deployment environments.

## Environment Files

- `.env` - Base configuration (loaded first)
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.staging` - Staging environment
- `.env.test` - Test environment (used by Jest)
- `.env.example` - Template file (commit to git)

## Setup

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your local configuration

## Configuration Priority

The config loader follows this priority:

1. Environment-specific file (`.env.[NODE_ENV]`)
2. Base file (`.env`)
3. Environment variables already set in the system

## Available Scripts

```bash
# Development (uses .env.development)
npm run dev

# Production (uses .env.production)
npm start

# Staging (uses .env.staging)
npm run staging

# Tests (uses .env.test + in-memory MongoDB)
npm test
```

## Environment Variables

- `NODE_ENV` - Environment name (development, production, staging, test)
- `DATABASE_URL` - MongoDB connection string
- `PORT` - Server port (default: 8080)

## Notes

- Never commit `.env` files containing secrets to git
- `.env.example` should contain all required variables without sensitive values
- Test environment uses in-memory MongoDB (DATABASE_URL set by Jest globalSetup)
