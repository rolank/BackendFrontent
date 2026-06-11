# GitHub Workflows

This directory documents the current GitHub Actions setup for the project. The workflows run CI for frontend and backend, build commit-tagged Docker images, push them to Docker Hub, and deploy the images to Google Cloud Run using Workload Identity Federation.

## Workflow Files

- `ci-backend.yaml`
- `ci-frontend.yaml`
- `cd-backend.yaml`
- `cd-frontend.yaml`

## Current Deployment Model

### Shared Characteristics

- Deploy target: Google Cloud Run
- GCP project: `oidc-github-01`
- Region: `us-central1`
- Auth to GCP: GitHub OIDC via Workload Identity Federation
- Image registry for built app images: Docker Hub
- Tagging strategy: commit SHA

### GCP Identities

- Workload Identity Provider:
  `projects/1010347128743/locations/global/workloadIdentityPools/github-pool/providers/github-provider`
- Deployer service account:
  `cloudrun-deployer@oidc-github-01.iam.gserviceaccount.com`

## `ci-backend.yaml`

Purpose:

- Run backend validation on backend changes and backend workflow changes.

Current behavior:

- Triggers on push and pull request to `main`
- Uses path filters for `backend/**` and backend workflow files
- Runs in `backend/`
- Matrix: Node `22.x`, `24.x`
- Executes:
  - `npm install`
  - `npm test`
  - `npm run test:smoke`

## `ci-frontend.yaml`

Purpose:

- Run frontend build validation on pushes and pull requests to `main`.

Current behavior:

- Triggers on push and pull request to `main`
- Matrix: Node `18.x`, `20.x`, `22.x`
- Executes:
  - `npm install`
  - `npm run build`

## `cd-backend.yaml`

Purpose:

- Deploy the backend after successful backend CI, or manually through `workflow_dispatch`.

Current flow:

1. Checkout the exact commit that passed CI.
2. Build backend image from `backend/Dockerfile`.
3. Tag image as `<dockerhub-username>/blog-backend:<commit-sha>`.
4. Log in to Docker Hub.
5. Push the image.
6. Authenticate to GCP with `google-github-actions/auth@v3`.
7. Deploy the pushed image to Cloud Run with `google-github-actions/deploy-cloudrun@v3`.

Cloud Run backend settings applied by the workflow:

- Service: `blog-backend-service`
- Runtime service account: `blog-backend-runtime@oidc-github-01.iam.gserviceaccount.com`
- Env vars:
  - `NODE_ENV=production`
  - `JWT_EXPIRES_IN=7d`
- Secrets from GCP Secret Manager:
  - `DATABASE_URL=MONGODB_URI:latest`
  - `JWT_SECRET=JWT_SECRET:latest`

## `cd-frontend.yaml`

Purpose:

- Deploy the frontend after successful frontend CI, or manually through `workflow_dispatch`.

Current flow:

1. Checkout the exact commit that passed CI.
2. Build frontend image from the root `Dockerfile`.
3. Pass `BUILD_ARG_BACKEND_URL` during the Docker build so Vite bakes the backend URL into the bundle.
4. Tag image as `<dockerhub-username>/blog-frontend:<commit-sha>`.
5. Log in to Docker Hub.
6. Push the image.
7. Authenticate to GCP.
8. Deploy the pushed image to Cloud Run.

Cloud Run frontend settings applied by the workflow:

- Service: `blog-frontend-service`
- Runtime service account: `blog-backend-runtime@oidc-github-01.iam.gserviceaccount.com`
- Build-time backend URL:
  `https://blog-backend-service-1010347128743.us-central1.run.app/api/v1`

Important:

- The frontend API URL is baked into the JS bundle at image build time.
- If the backend URL changes, the frontend image must be rebuilt and redeployed.
- The correct Docker build arg name is `BUILD_ARG_BACKEND_URL` because the root `Dockerfile` expects `ARG BUILD_ARG_BACKEND_URL`.

## Required GitHub Configuration

### Repository Variables

- `DOCKERHUB_USERNAME`

### Repository Secrets

- `DOCKERHUB_TOKEN`

### GCP Secrets Referenced at Deploy Time

These are not GitHub secrets. They are Secret Manager secrets referenced by Cloud Run deployment:

- `MONGODB_URI`
- `cd-backend.yaml` listens for the workflow named `Continuous Integration of Blog Backend on Google Cloud Run`
- `cd-frontend.yaml` listens for the workflow named `Continuous Integration of Blog Frontend on Google Cloud Run`

That means the workflow `name:` field matters. If a CI workflow is renamed, its matching CD workflow must be updated too.

- `cd-frontend.yaml` passes `BUILD_ARG_BACKEND_URL`
- The value points to `/api/v1`
- A new frontend image was built after the change

### Backend fails on startup in Cloud Run

Check:

- `JWT_SECRET` exists in GCP Secret Manager
- `MONGODB_URI` exists in GCP Secret Manager
- `DATABASE_URL` resolves to a reachable MongoDB instance

Check:

| Workflow           | Purpose         | Trigger                                    | Main Checks / Actions                                           |
| ------------------ | --------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `ci-backend.yaml`  | Backend CI      | Push/PR to `main` with backend path filter | Install, Jest tests, smoke tests                                |
| `ci-frontend.yaml` | Frontend CI     | Push/PR to `main`                          | Install, frontend build                                         |
| `cd-backend.yaml`  | Backend deploy  | Successful backend CI or manual            | Build, push to Docker Hub, deploy to Cloud Run                  |
| `cd-frontend.yaml` | Frontend deploy | Successful frontend CI or manual           | Build with backend URL, push to Docker Hub, deploy to Cloud Run |

- Generates temporary OIDC tokens for secure GCP access
- No sensitive credentials are exposed

- Installs `gke-gcloud-auth-plugin` for Kubernetes integration (if needed)

5. **Build and Push Docker Image**

   - Builds a Docker image from the root `Dockerfile` with platform `linux/amd64`
   - **Build argument**: `BUILD_ARG_BACKEND_URL`
     - Points to the backend API: `https://blog-backend-service-591006590099.us-central1.run.app/api/v1`
   - Tags image as: `{DOCKER_USERNAME}/{FRONTEND_IMAGE}:latest`
   - Pushes to Docker Hub for centralized image storage
   - The `latest` tag is used; previous versions are retained in Docker Hub history

6. **Deploy to Cloud Run**
   - Uses `google-github-actions/deploy-cloudrun@v1`
   - Deploys the Docker Hub image to Cloud Run
   - Configuration:
     - `service`: `blog-frontend-service` (the Cloud Run service name)
     - `region`: Retrieved from `secrets.GOOGLECLOUD_REGION`
     - `platform`: `managed` (Google-managed Cloud Run, not Kubernetes)
     - `allow_unauthenticated`: `true` (publicly accessible)
   - Returns the deployment URL

```
Code Pushed to Main → Build Docker Image → Push to Docker Hub → Deploy to Cloud Run

### Backend Integration

The frontend build includes the backend API URL via the `BUILD_ARG_BACKEND_URL` build argument. This means:

- The frontend is built with the production backend URL hardcoded
- All API calls from the frontend will go to the production backend service

---

## Summary Table

| Workflow           | Type | Trigger               | Purpose                   | Deploys To        |
| ------------------ | ---- | --------------------- | ------------------------- | ----------------- |
| `backend-ci.yaml`  | CI   | Push/PR to main       | Test backend              | None (test only)  |
| `frontend-ci.yaml` | CI   | Push/PR to main       | Build & validate frontend | None (build only) |
| `cd-backend.yaml`  | CD   | Push to main / Manual | Deploy backend            | Google Cloud Run  |
| `cd-frontend.yaml` | CD   | Push to main / Manual | Deploy frontend           | Google Cloud Run  |

---


### For `cd-frontend.yaml`:

- `DOCKERHUB_LOR2P`: Docker Hub username
### For `cd-backend.yaml`:

- `DATABASE_URL`: MongoDB connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/database`)
- `JWT_SECRET`: Secret key for JWT token signing (generate with `openssl rand -base64 32`)


---


### How Secrets Flow from GitHub to Cloud Run

```

GitHub Secrets → Workflow reads them → Passes to Cloud Run → Your app uses them
The workflow configuration in [`cd-backend.yaml`](cd-backend.yaml#L69-L71) does:

```yaml
  DATABASE_URL=${{ secrets.DATABASE_URL }}  # ← Reads from GitHub Secrets
  JWT_SECRET=${{ secrets.JWT_SECRET }}      # ← Reads from GitHub Secrets
```

**Important**:

- Keep secrets in **GitHub repository secrets** - the workflow needs them to configure Cloud Run
- **Don't manually set them in GCP** - the workflow sets them automatically on each deployment
- View them in GCP Console → Cloud Run → Service → Variables & Secrets tab (set by the workflow)
  **Purpose**: Connection string for your MongoDB database.

**Format for MongoDB Atlas**:

```
**Format for self-hosted MongoDB**:

```

mongodb://username:password@host:port/database

````
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) (or your MongoDB provider)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your actual database password

### JWT_SECRET

**Purpose**: Secret key used to **sign and verify** JWT (JSON Web Tokens) for user authentication.

**Why it's required for backend deployment**:

Your backend checks for `JWT_SECRET` during startup in [`backend/src/middleware/jwt.js`](../backend/src/middleware/jwt.js#L19-L21):

```javascript
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
````

This check happens **before** the database connection, so the backend crashes on startup if `JWT_SECRET` is missing, even though the database itself doesn't need it.

**How it works**:

1. User logs in → Backend creates JWT signed with `JWT_SECRET`
2. Frontend stores token → Sends with each request
3. Backend verifies token using same `JWT_SECRET`

**Important clarification**:

- ❌ The **database** does NOT need `JWT_SECRET` - only `DATABASE_URL`
- ✅ The **backend application** needs `JWT_SECRET` to initialize and run
- ✅ The **frontend** never knows or uses `JWT_SECRET` - it only receives and sends the resulting tokens

**Why it's critical**:

- If someone gets your `JWT_SECRET`, they can create fake login tokens
- They could impersonate any user in your system
- **Never commit it to Git** or expose it publicly

**Generate a strong secret**:

```bash
openssl rand -base64 32
```

Example output: `3K9j2nR7pQ8mF6vL1xY4wH5tE0sA9bC7dG2hJ3kM8nP=`

**Why keep it consistent**:

- Tokens issued in one deployment remain valid in the next
- If you change it, **all users get logged out**
- Only rotate it if you suspect it's been compromised

### Security Considerations

**Who can see these environment variables?**

✅ **CAN see them:**

- GCP project Owners, Editors, and Viewers
- Anyone with Cloud Run `viewer` or `admin` IAM roles
- They appear in: GCP Console → Cloud Run → Variables & Secrets tab

❌ **CANNOT see them:**

- End users visiting your website/API
- People without GCP project access
- GitHub Actions logs (masked as `***`)
- Anyone accessing your application endpoints

**Is this secure?**

Yes, for most applications:

- ✅ Standard practice - Environment variables are the recommended way to pass secrets to containers
- ✅ Access controlled - Only people with GCP IAM permissions can view them
- ✅ Not in code - Secrets aren't hardcoded or committed to Git
- ✅ Not exposed publicly - Your API doesn't expose them

**Best practices**:

- Only grant GCP project access to trusted team members
- Use strong, randomly generated passwords
- Rotate secrets if you suspect compromise
- Never log or expose secrets in application code

### Alternative: GCP Secret Manager (Advanced)

For **enterprise-grade security**, use GCP Secret Manager instead of environment variables.

**Benefits**:

- Secrets stored separately from Cloud Run service
- Detailed audit logs of secret access
- Fine-grained access controls per secret
- Rotate secrets without redeploying

**How to use**:

1. **Store secrets in Secret Manager** (one-time setup):

```bash
# Create secrets
echo -n "mongodb+srv://user:pass@..." | gcloud secrets create DATABASE_URL --data-file=-
echo -n "your-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-

# Grant Cloud Run service account access
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:cloudrun-deployer@oidc-gcp-roland-01.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding JWT_SECRET \
  --member="serviceAccount:cloudrun-deployer@oidc-gcp-roland-01.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

2. **Update workflow** to reference secrets:

```yaml
# Replace env_vars with secrets in cd-backend.yaml
secrets: |
  DATABASE_URL=DATABASE_URL:latest
  JWT_SECRET=JWT_SECRET:latest
```

The `:latest` means "use the latest version of this secret"

**When to use Secret Manager**:

- Multiple services need to share secrets
- Compliance/audit requirements
- Need to rotate secrets without redeployment
- Enterprise environment with strict security policies

**For most projects**: Environment variables (current setup) are sufficient.

---

## Prerequisites for Deployment

1. **GCP Setup**: Workload Identity Federation configured between GitHub and GCP
2. **Docker Hub Account**: For frontend image storage
3. **GitHub Secrets**: All required secrets configured in repository settings
4. **Service Accounts**: GCP service accounts with appropriate permissions
5. **Cloud Run Services**: `blog-backend-service` and `blog-frontend-service` created in GCP

---

## Monitoring & Debugging

### View Workflow Status

- Go to **Actions** tab in your GitHub repository
- Click on a workflow run to see detailed logs for each step
- Failed steps will show error messages and logs

### Common Issues

**Backend CI Fails**: Check `backend/` directory and ensure `npm test` works locally

**Frontend Build Fails**: Verify `npm run build` works locally and all dependencies are installed

**Deployment Fails**:

- Check GCP project ID and region settings
- Verify Workload Identity Federation is properly configured
- Ensure Cloud Run services exist in GCP
- Check Docker Hub credentials are valid (for frontend)

### Cloud Run Deployment Errors (Backend/Frontend)

When the `google-github-actions/deploy-cloudrun` step fails with incomplete error messages, follow these diagnostics:

#### 1. Check Service Exists

```bash
gcloud run services list --region us-central1
```

Verify `blog-backend-service` or `blog-frontend-service` is listed. If not, create it:

```bash
gcloud run create blog-backend-service --region us-central1 --platform managed
```

#### 2. Verify Image Exists

**Backend and Frontend use different Docker registries** - this is why they're checked differently:

**Backend** → Google Artifact Registry (private GCP registry)

- Built and tagged in [`cd-backend.yaml`](cd-backend.yaml#L46-L56) lines 46-56
- **Push command** at [line 57](cd-backend.yaml#L57):
  ```bash
  docker push "$IMAGE"
  ```
- Where `IMAGE` is: `us-central1-docker.pkg.dev/oidc-gcp-roland-01/blog/blog-backend:{GITHUB_SHA}`
- Check if image exists with:
  ```bash
  gcloud artifacts docker images list us-central1-docker.pkg.dev/oidc-gcp-roland-01/blog
  ```

**Frontend** → Docker Hub (public registry)

- Built and tagged in [`cd-frontend.yaml`](cd-frontend.yaml#L51-L54) lines 51-54
- **Push command** at [line 54](cd-frontend.yaml#L54):
  ```bash
  docker push ${{ env.DOCKER_USERNAME }}/${{ env.FRONTEND_IMAGE }}:latest
  ```
- Where the image is: `{DOCKER_USERNAME}/blog-frontend:latest`
- Check if image exists with:
  ```bash
  docker pull {DOCKERHUB_USERNAME}/blog-frontend:latest
  ```

**Why the difference?**

- Backend stores images in GCP's Artifact Registry for direct access by Cloud Run in the same GCP project
- Frontend stores images on Docker Hub (public/personal account) as an intermediate step before Cloud Run deployment

#### 3. Check Service Account Permissions

Ensure the service account has the required roles:

```bash
gcloud projects get-iam-policy oidc-gcp-roland-01 \
  --flatten="bindings[].members" \
  --filter="bindings.members:cloudrun-deployer*"
```

It should have at least:

- `roles/run.admin` - to manage Cloud Run services
- `roles/iam.serviceAccountUser` - to use service accounts

#### 4. Check Memory/CPU Requirements

The Cloud Run service may fail due to insufficient resources. Try increasing memory:

```bash
gcloud run deploy blog-backend-service \
  --image us-central1-docker.pkg.dev/oidc-gcp-roland-01/blog/blog-backend:HASH \
  --region us-central1 \
  --memory 512Mi \
  --cpu 1 \
  --allow-unauthenticated
```

#### 5. Verify Artifact Registry Access

For backend deployment, the service account must access Artifact Registry:

```bash
gcloud artifacts repositories list --location=us-central1
```

#### 6. Check Cloud Run Service Configuration

Inspect the existing service to see current settings:

```bash
gcloud run services describe blog-backend-service --region us-central1
```

#### 7. Enable Required APIs

Ensure these GCP APIs are enabled:

```bash
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable iam.googleapis.com
```

#### 8. Test Deployment Locally

Try deploying manually to identify the exact error message:

```bash
gcloud auth login
gcloud config set project oidc-gcp-roland-01
gcloud run deploy blog-backend-service \
  --image us-central1-docker.pkg.dev/oidc-gcp-roland-01/blog/blog-backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

This will show the full error message instead of the truncated workflow error.

#### 9. Container Failed to Start on PORT

**Error**: "The user-provided container failed to start and listen on the port defined provided by the PORT=8080 environment variable"

This means your backend application isn't listening on the correct port. Cloud Run requires:

**Fix your backend code** to listen on the `PORT` environment variable:

```javascript
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Check startup logs**:

```bash
gcloud logs read --project=oidc-gcp-roland-01 \
  --service=blog-backend-service \
  --limit=50
```

**Common causes**:

- App hardcoded to port 3000 or other port instead of using `process.env.PORT`
- App crashes during startup (check logs for errors)
- App takes too long to start (increase timeout with `--timeout=60`)
- Missing environment variables or database connection issues

**Increase startup timeout** if needed:

```bash
gcloud run deploy blog-backend-service \
  --image us-central1-docker.pkg.dev/oidc-gcp-roland-01/blog/blog-backend:latest \
  --region us-central1 \
  --timeout=60 \
  --allow-unauthenticated
```

### Re-run Workflows

Failed workflows can be re-run from the GitHub Actions page without pushing new code, useful for debugging transient failures.
