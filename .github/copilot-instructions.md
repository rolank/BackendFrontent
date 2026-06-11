# Copilot Instructions

## Build, test, and lint commands

### Frontend (repo root)

- `npm run dev` - start the Vite dev server
- `npm run build` - build the production frontend bundle
- `npm run preview` or `npm start` - preview the built frontend
- `npm run lint` - run ESLint against `src/`
- `npm test -- --run` - run the Vitest suite once
- `npm test -- --run src/components/Layout.test.jsx` - run a single frontend test file
- `npm test -- --run src/api/posts.test.js -t "creates a post successfully"` - run a single frontend test by name

### Backend (`cd backend`)

- `npm run dev` - start the Express API in development
- `npm start` - start the API in production mode
- `npm run staging` - start the API with `NODE_ENV=staging`
- `npm test` - run Jest service tests against in-memory MongoDB
- `npm test -- posts.test.js` - run a single backend test file
- `npm run test:integration` - run the HTTP integration test file (`src/__tests__/endpoints.integration.test.js`); start `npm run dev` first in another shell

### Local database

- `docker run -d --name dbserver -p 27017:27017 --restart unless-stopped mongo:8.0.11` - local MongoDB for backend development

## High-level architecture

- The repo is split into a Vite/React frontend at the repository root and an Express/Mongoose backend in `backend/`. The frontend talks directly to the backend's `/api/v1` endpoints.
- `src/main.jsx` renders `App`, and `src/App.jsx` is the frontend composition root: it creates the shared React Query client, defines the React Router tree, and wires loaders/actions for auth and posts.
- Data-heavy pages use **React Router loaders/actions plus React Query together**, not one or the other. Loaders fetch initial data, page components reuse the same data through `useQuery({ initialData })`, and actions invalidate or remove the matching cache keys after mutations.
- Authentication is deliberately split across frontend and backend:
  - `src/utils/auth.js` owns localStorage (`auth_token`, `auth_user`) and builds `Authorization: Bearer ...` headers.
  - `backend/src/services/users.js` owns password hashing, login validation, and JWT issuance.
  - `backend/src/middleware/jwt.js` protects post mutation routes and explicitly exempts `/api/v1/user/login` and `/api/v1/user/signup`.
- Backend startup order matters in `backend/src/index.js`: load env config first, initialize JWT middleware second, initialize the database third, then start the Express server. Do not reorder that sequence when touching startup/auth code.
- Posts cross a type boundary between layers: Mongo stores `Post.author` as a `User` ObjectId, but backend services resolve it to a username before returning data to the frontend. Frontend ownership checks therefore compare `currentUser.username` to `post.author`.
- Backend environment loading is centralized in `backend/src/config/env.js`: it loads `.env` first, then `.env.<NODE_ENV>` as an override layer. Frontend backend URL configuration is centralized in `src/config/api.js` and is intended to come from `VITE_BACKEND_URL` at build time.

## Key conventions

- Prefer extending the existing **route loader/action pattern** in `src/routes/` instead of adding ad hoc fetch/mutation logic directly inside page components.
- Keep React Query cache keys aligned with the existing conventions:
  - posts list: `["posts", { author, sortBy, sortOrder }]`
  - single post: `["post", postId]`
    Loaders use those exact keys; mutations currently invalidate the broader `["posts"]` prefix for list refreshes and the exact `["post", postId]` key for single-post refresh/removal.
- Do not hardcode API URLs in components or helpers; import `API_BASE_URL` from `src/config/api.js`.
- Keep backend layers separated the same way the current code does:
  - `backend/src/routes/`: HTTP parsing/validation/response handling
  - `backend/src/services/`: database and business logic
  - `backend/src/db/models/`: Mongoose schemas/models
- Post creation/edit flows currently send the **author username** from the frontend form, and backend route logic resolves that username to a Mongo user id with `findUserId()` before saving.
- Backend unit tests depend on the Jest setup in `backend/src/test/`: `globalSetup.js` starts `mongodb-memory-server`, `setupFileAfterEnv.js` connects Mongoose and seeds `testuser`. Keep that setup intact when changing backend tests.
- `backend/jest.config.json` ignores `endpoints.integration.test.js`, so `npm test` only covers the in-memory service-level suite; the integration test is opt-in and expects a running backend.
