# Backend Testing Guide

This document explains how the testing infrastructure works in the backend, including the Jest setup, global test configuration, and how individual tests are executed.

## Overview

The backend uses **Jest** as the testing framework with a sophisticated multi-layer setup to ensure:

- **Isolated test environment** using in-memory MongoDB (no external database needed)
- **Consistent test data** through global setup/teardown
- **Environment configuration** that automatically loads based on `NODE_ENV`

## Test Architecture

### Layer 1: Jest Configuration (`jest.config.json`)

```json
{
  "testEnvironment": "node",
  "globalSetup": "<rootDir>/src/test/globalSetup.js",
  "globalTeardown": "<rootDir>/src/test/globalTeardown.js",
  "setupFilesAfterEnv": ["<rootDir>/src/test/setupFileAfterEnv.js"]
}
```

This configuration defines four key components:

| Component                 | Purpose                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| `testEnvironment: "node"` | Runs tests in Node.js environment (not a browser)                |
| `globalSetup`             | Runs **once before all test suites** to set up in-memory MongoDB |
| `globalTeardown`          | Runs **once after all tests complete** to clean up               |
| `setupFilesAfterEnv`      | Runs **before each test file** for initialization                |

---

## Layer 2: Global Setup (`src/test/globalSetup.js`)

**Runs once at the very beginning of the test session.**

```javascript
export default async function globalSetup() {
  const instance = await MongoMemoryServer.create({
    binary: {
      version: "8.0.11",
    },
  });

  global.__MONGOINSTANCE = instance;
  process.env.DATABASE_URL = instance.getUri();
  console.log(
    "In global setup, set DATABASE_URL to:",
    process.env.DATABASE_URL,
  );
}
```

### What it does:

1. **Creates an in-memory MongoDB instance** (`mongodb-memory-server`)
   - Runs entirely in RAM
   - No disk I/O
   - Auto-isolated between test runs
   - Database URI: `mongodb://127.0.0.1:[random-port]/test`

2. **Stores the instance globally** for later cleanup
   - `global.__MONGOINSTANCE` = MongoDB instance reference

3. **Sets the database URL** as environment variable
   - `process.env.DATABASE_URL` = in-memory MongoDB URI
   - All code that reads `process.env.DATABASE_URL` will connect to the test database

### Why this approach:

✅ No external services needed (local development friendly)  
✅ Fast test execution (in-memory database)  
✅ Completely isolated (fresh DB for each test run)  
✅ Production-like connections (same MongoDB driver)

---

## Layer 3: Setup After Env (`src/test/setupFileAfterEnv.js`)

**Runs before each test file, after the global setup.**

```javascript
beforeAll(async () => {
  // Load test environment configuration
  loadConfig();

  // Connect to the in-memory MongoDB
  await initDatabase();

  // Create a sample user for tests
  const sampleUser = {
    username: "testuser",
    email: "test@rolandklahitar.dev",
    password: "testpassword",
  };
  try {
    await createUser(sampleUser);
  } catch (err) {
    // User already exists, which is fine (idempotent)
  }
});

afterAll(async () => {
  await deleteUser("testuser");
  await mongoose.connection.close();
});
```

### What it does:

1. **Loads configuration** (`loadConfig()`)
   - Sets environment variables from `.env.test`
   - Makes config available to the entire app

2. **Connects to the database** (`initDatabase()`)
   - Uses `process.env.DATABASE_URL` from global setup
   - Establishes Mongoose connection to in-memory MongoDB

3. **Creates test user** for tests that need authentication/author data
   - Username: `testuser`
   - Email: `test@rolandklahitar.dev`
   - Creates idempotently (won't fail if user already exists)

4. **Cleanup** (`afterAll`)
   - Deletes test user
   - Closes database connection
   - Prevents test data pollution between test files

---

## Layer 4: Individual Test Files (`src/__tests__/posts.test.js`)

**Runs after the setup layers above.**

```javascript
import { createPost, listAllPosts } from "../services/posts";
import { createUser } from "../services/users";

let userId;

beforeAll(async () => {
  // Global setup has already created database connection and testuser
  // We just need to retrieve the userId for our tests
  userId = await findUserId("testuser");
  if (!userId) {
    // Fallback: create user if global setup didn't
    let createdUser = await createUser({
      username: "testuser",
      email: "test@rolandklahitar.dev",
      password: "testpassword",
    });
    userId = createdUser._id;
  }
  console.log(`Using userId: ${userId}`);
});

describe("Create Post", () => {
  test("with all parameters should succeed", async () => {
    const postDetails = {
      title: "Hello Mongoose",
      author: userId,
      contents: "This is my first post",
      tags: ["intro", "mongoose"],
    };
    const post = await createPost(postDetails);
    expect(post._id).toBeInstanceOf(mongoose.Types.ObjectId);

    const fetchedPost = await Post.findById(post._id).exec();
    expect(fetchedPost.title).toBe(postDetails.title);
  });
});
```

### Key Points:

1. **Database is already connected** - no need to call `mongoose.connect()`
2. **Test user already exists** - just retrieve `userId` for use in tests
3. **Each test is isolated** - changes don't affect other tests
4. **Tests use the in-memory database** - created by global setup

---

## Complete Test Execution Flow

```
┌─────────────────────────────────────┐
│  npm run test (Jest starts)          │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│  globalSetup() runs                  │
│  • Creates in-memory MongoDB         │
│  • Sets process.env.DATABASE_URL    │
└────────────────┬────────────────────┘
                 │
        ┌────────▼────────┐
        │ For each test file:
        │
┌───────▼─────────────────────────────┐
│  setupFileAfterEnv.js beforeAll()   │
│  • Calls loadConfig()               │
│  • Calls initDatabase()             │
│  • Creates testuser                 │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│  Test File executes                  │
│  (e.g., posts.test.js)              │
│  • Uses already-connected DB        │
│  • Uses pre-created testuser        │
│  • Runs individual test cases       │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│  setupFileAfterEnv.js afterAll()    │
│  • Deletes testuser                 │
│  • Closes connection                │
└────────────────┬────────────────────┘
                 │
        └────────┬────────┘
                 │
┌────────────────▼────────────────────┐
│  globalTeardown() runs               │
│  • Stops in-memory MongoDB          │
│  • Cleans up resources              │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│  Jest completes                      │
└─────────────────────────────────────┘
```

---

## Running Tests

### Run all tests:

```bash
npm run test
```

### Run tests in watch mode (re-run on file changes):

```bash
npm run test -- --watch
```

### Run specific test file:

```bash
npm run test -- posts.test.js
```

### Run with coverage:

```bash
npm run test -- --coverage
```

---

## Environment Configuration

### Test Environment (`.env.test`):

```
NODE_ENV=test
# DATABASE_URL is set dynamically by globalSetup.js
PORT=8080
```

The `DATABASE_URL` is **not** in `.env.test` because:

- It's generated dynamically by `globalSetup.js`
- Each test run gets a fresh in-memory database
- Setting it in `.env` would override the in-memory URL

---

## Key Files

| File                            | Purpose                                      |
| ------------------------------- | -------------------------------------------- |
| `jest.config.json`              | Jest configuration with setup/teardown hooks |
| `src/test/globalSetup.js`       | Creates in-memory MongoDB instance           |
| `src/test/globalTeardown.js`    | Stops in-memory MongoDB instance             |
| `src/test/setupFileAfterEnv.js` | Connects to DB, creates test user            |
| `src/__tests__/posts.test.js`   | Example test file                            |
| `src/config/env.js`             | Environment configuration loader             |
| `src/db/init.js`                | Database connection initialization           |

---

## Important Design Decisions

### 1. In-Memory Database

**Why?** Eliminates need for external MongoDB service during development/testing.  
**How?** `mongodb-memory-server` package creates isolated MongoDB in RAM.

### 2. Global Setup Pattern

**Why?** Ensures database is ready before ANY test runs.  
**How?** Jest's `globalSetup` runs once, before all test files.

### 3. Test User Creation

**Why?** Many tests need a valid user for testing posts/articles.  
**How?** `setupFileAfterEnv.js` creates test user with known credentials.

### 4. Environment Configuration

**Why?** Same code works locally (in-memory) and in production (MongoDB Atlas).  
**How?** `loadConfig()` loads `.env.test`, which can be overridden by environment variables.

---

## Troubleshooting

### Tests hang or timeout

- Check if `globalSetup.js` is creating the MongoDB instance correctly
- Verify `process.env.DATABASE_URL` is set: add `console.log(process.env.DATABASE_URL)` in tests

### "Database connection refused" errors

- Ensure `globalSetup()` ran before tests
- Check `jest.config.json` paths are correct

### "testuser already exists" errors

- The `try/catch` in `setupFileAfterEnv.js` handles this - it's expected behavior
- This is idempotent design - safe to re-run tests multiple times

### Tests can't find modules

- Ensure Node.js version supports ES modules (`"type": "module"` in `package.json`)
- Verify all imports use correct relative paths

---

## Summary

The backend testing setup creates a **complete, isolated test environment** where:

1. ✅ Each test runs with fresh in-memory MongoDB
2. ✅ Test data is consistent (test user pre-created)
3. ✅ No external services required
4. ✅ Tests are fast (in-memory DB)
5. ✅ Production-like (uses real MongoDB driver)
6. ✅ Easy to debug (local, visible logs)

This architecture allows developers to run tests without Docker, external MongoDB, or any setup beyond `npm install` and `npm run test`.
