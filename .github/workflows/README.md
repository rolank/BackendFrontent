# GitHub Workflows Documentation

This directory contains GitHub Actions workflows that automate Continuous Integration (CI) and Continuous Deployment (CD) processes for the Blog application. Below is a detailed explanation of each workflow file.

---

## 📋 Table of Contents

1. [backend-ci.yaml](#backend-ciyaml)
2. [frontend-ci.yaml](#frontend-ciyaml)
3. [cd-backend.yaml](#cd-backendyaml)
4. [cd-frontend.yaml](#cd-frontendyaml)

---

## backend-ci.yaml

### Purpose

Continuous Integration pipeline for the backend Node.js application. This workflow automatically runs tests whenever code is pushed to the `main` branch or when pull requests are created.

### Trigger Events

- **Push to main branch**: Automatically runs when commits are pushed to the main branch
- **Pull requests to main branch**: Automatically runs when a pull request is opened or updated targeting the main branch

### Matrix Strategy

The workflow uses a **Node.js version matrix** to test against multiple Node versions:

- Node.js 18.x
- Node.js 20.x
- Node.js 22.x

This ensures the backend is compatible across different Node.js versions. Each combination creates a separate job instance.

### Working Directory

- **Location**: `./backend` - All commands run from the backend directory

### Key Steps

1. **Checkout Code**

   - Uses `actions/checkout@v4` to pull the repository code into the runner

2. **Setup Node.js**

   - Uses `actions/setup-node@v4` to install the specified Node.js version
   - Enables npm caching to speed up dependency installation
   - `cache: "npm"` caches node_modules and npm package-lock files between runs

3. **Install Dependencies**

   - Runs `npm install` to install all project dependencies defined in `package.json`

4. **Run Tests**
   - Executes `npm test` to run the test suite (likely Jest tests based on the project structure)
   - This validates that the code changes don't break existing functionality

### Success/Failure

- The workflow **passes** only if all steps complete successfully
- If any step fails, the workflow is marked as failed and notifications are sent
- Pull requests will show the CI status, blocking merges if the workflow fails

---

## frontend-ci.yaml

### Purpose

Continuous Integration pipeline for the React frontend application. This workflow validates that the frontend can successfully build without errors whenever code is pushed or pull requests are created.

### Trigger Events

- **Push to main branch**: Automatically runs when commits are pushed to the main branch
- **Pull requests to main branch**: Automatically runs when a pull request is opened or updated targeting the main branch

### Matrix Strategy

Similar to the backend, this workflow tests against multiple Node.js versions:

- Node.js 18.x
- Node.js 20.x
- Node.js 22.x

This ensures the frontend build process works consistently across different Node versions.

### Environment

Runs on `ubuntu-latest` - a GitHub-hosted Linux runner with common development tools pre-installed

### Key Steps

1. **Checkout Code**

   - Uses `actions/checkout@v4` to fetch the repository code

2. **Setup Node.js**

   - Uses `actions/setup-node@v4` to install the specified Node.js version
   - Enables npm caching for faster dependency installation
   - `cache: 'npm'` caches npm dependencies between workflow runs

3. **Install Dependencies**

   - Runs `npm install` to install all frontend dependencies
   - Includes React, Vite, React Query, and other packages defined in `package.json`

4. **Build Frontend**
   - Executes `npm run build` which runs the Vite build process
   - Creates an optimized production build in the `dist/` directory
   - Validates that no build errors or warnings prevent successful compilation

### Success Criteria

- The workflow passes if the build completes without errors
- Failed builds block pull requests from being merged
- Build artifacts are not uploaded; this workflow only validates build success

---

## cd-backend.yaml

### Purpose

Continuous Deployment pipeline that automatically builds and deploys the backend application to **Google Cloud Run** when code is pushed to the main branch. This is the production deployment workflow for the backend service.

### Trigger Events

- **Push to main branch**: Automatically deploys when commits are pushed to main
- **Manual trigger**: `workflow_dispatch` allows manual deployment via GitHub UI without code changes

### Deployment Environment

- **Target**: Google Cloud Run (serverless container platform)
- **Project**: `oidc-gcp-roland-01`
- **Region**: `us-central1`
- **Service Name**: `blog-backend-service`

### Security & Authentication

- Uses **Workload Identity Federation** (WIF) for secure authentication to GCP
- Requires `id-token: write` permission to generate OIDC tokens
- No long-lived credentials are stored; authentication is temporary and automatic
- **Service Account**: `cloudrun-deployer@oidc-gcp-roland-01.iam.gserviceaccount.com` handles the deployment

### Environment Variables

All key configuration values are stored as environment variables:

- `PROJECT_ID`: GCP project identifier
- `PROJECT_NUMBER`: GCP project number
- `REGION`: Deployment region
- `REPOSITORY`: Artifact Registry repository name (`blog`)
- `IMAGE_NAME`: Docker image name (`blog-backend`)
- `WIF_PROVIDER`: Workload Identity Pool provider path
- `WIF_SA`: Service account email for deployment

### Key Steps

1. **Checkout Code**

   - Uses `actions/checkout@v4` to fetch the latest backend code

2. **Authenticate to GCP**

   - Uses `google-github-actions/auth@v2` with Workload Identity Federation
   - Generates temporary credentials without storing secrets
   - Securely authenticates to Google Cloud

3. **Set Up Cloud SDK**

   - Uses `google-github-actions/setup-gcloud@v2` to initialize gcloud CLI
   - Configures the SDK to interact with the GCP project

4. **Build and Push Docker Image**

   - Configures Docker authentication to Google Artifact Registry
   - Builds a Docker image from `backend/Dockerfile` with the platform `linux/amd64`
   - Tags the image with: `us-central1-docker.pkg.dev/{PROJECT_ID}/{REPOSITORY}/{IMAGE_NAME}:{GITHUB_SHA}`
   - The `GITHUB_SHA` tag ensures each deployment has a unique, traceable version
   - Pushes the image to Google Artifact Registry for storage

5. **Deploy to Cloud Run**
   - Uses `google-github-actions/deploy-cloudrun@v1` to deploy the container
   - Deploys the image to the `blog-backend-service`
   - Configuration:
     - `--allow-unauthenticated`: Makes the API publicly accessible (no authentication required)
   - Returns the deployment URL in step outputs for verification

### Deployment Flow

```
Code Pushed to Main → Build Docker Image → Push to Artifact Registry → Deploy to Cloud Run
```

### Rollback

If a deployment fails, the previous version remains running on Cloud Run. You can manually rollback through the Cloud Run console.

---

## cd-frontend.yaml

### Purpose

Continuous Deployment pipeline that builds and deploys the React frontend to **Google Cloud Run**. The frontend is containerized with Docker and pushed to Docker Hub before deployment.

### Trigger Events

- **Push to main branch**: Automatically deploys when commits are merged to main
- **Manual trigger**: `workflow_dispatch` allows manual deployments through GitHub UI

### Deployment Environment

- **Target**: Google Cloud Run
- **Project**: `oidc-gcp-roland-01`
- **Service Name**: `blog-frontend-service`
- **Region**: Retrieved from GitHub secrets (`GOOGLECLOUD_REGION`)
- **Docker Registry**: Docker Hub (using DockerHub credentials)

### Authentication & Secrets

Uses two authentication methods:

1. **Docker Hub Authentication**

   - `DOCKER_USERNAME`: Retrieved from `secrets.DOCKERHUB_LOR2P`
   - `DOCKER_PASSWORD`: Retrieved from `secrets.DOCKERHUB_TOKEN`
   - Credentials must be stored in GitHub repository secrets

2. **GCP Authentication**
   - Uses Workload Identity Federation (WIF) with OIDC tokens
   - Service Account: `cloudrun-deployer@oidc-gcp-roland-01.iam.gserviceaccount.com`
   - No long-lived credentials stored

### Environment Variables

- `PROJECT_ID`: GCP project ID
- `FRONTEND_IMAGE`: Docker image name (`blog-frontend`)
- `PROJECT_NUMBER`: GCP project number
- `WIF_PROVIDER`: Workload Identity Pool provider
- `WIF_SA`: Service account for deployment

### Key Steps

1. **Checkout Code**

   - Uses `actions/checkout@v4` to fetch the latest frontend code

2. **Log in to Docker Hub**

   - Uses `docker/login-action@v2` to authenticate with Docker Hub
   - Logs in using credentials stored in GitHub secrets
   - Allows pushing images to the personal Docker Hub registry

3. **Authenticate to GCP**

   - Uses `google-github-actions/auth@v2` with Workload Identity Federation
   - Generates temporary OIDC tokens for secure GCP access
   - No sensitive credentials are exposed

4. **Set Up Cloud SDK**

   - Uses `google-github-actions/setup-gcloud@v2` to configure gcloud CLI
   - Installs `gke-gcloud-auth-plugin` for Kubernetes integration (if needed)

5. **Build and Push Docker Image**

   - Builds a Docker image from the root `Dockerfile` with platform `linux/amd64`
   - **Build argument**: `BUILD_ARG_BACKEND_URL`
     - Points to the backend API: `https://blog-backend-service-591006590099.us-central1.run.app/api/v1`
     - Baked into the frontend at build time so the frontend knows where to call the API
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

### Deployment Flow

```
Code Pushed to Main → Build Docker Image → Push to Docker Hub → Deploy to Cloud Run
```

### Backend Integration

The frontend build includes the backend API URL via the `BUILD_ARG_BACKEND_URL` build argument. This means:

- The frontend is built with the production backend URL hardcoded
- All API calls from the frontend will go to the production backend service
- No environment variables needed at runtime; the URL is baked into the build

---

## Summary Table

| Workflow           | Type | Trigger               | Purpose                   | Deploys To        |
| ------------------ | ---- | --------------------- | ------------------------- | ----------------- |
| `backend-ci.yaml`  | CI   | Push/PR to main       | Test backend              | None (test only)  |
| `frontend-ci.yaml` | CI   | Push/PR to main       | Build & validate frontend | None (build only) |
| `cd-backend.yaml`  | CD   | Push to main / Manual | Deploy backend            | Google Cloud Run  |
| `cd-frontend.yaml` | CD   | Push to main / Manual | Deploy frontend           | Google Cloud Run  |

---

## Secrets Required

For the deployment workflows to function, ensure these GitHub repository secrets are configured:

### For `cd-frontend.yaml`:

- `DOCKERHUB_LOR2P`: Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token
- `GOOGLECLOUD_REGION`: GCP region (e.g., `us-central1`)

### For `cd-backend.yaml`:

- `DATABASE_URL`: MongoDB connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/database`)
- `JWT_SECRET`: Secret key for JWT token signing (generate with `openssl rand -base64 32`)

**Note**: While Workload Identity Federation handles GCP authentication, your backend application needs these secrets to function.

---

## Environment Variables & Secrets Explained

### How Secrets Flow from GitHub to Cloud Run

```
GitHub Secrets → Workflow reads them → Passes to Cloud Run → Your app uses them
```

The workflow configuration in [`cd-backend.yaml`](cd-backend.yaml#L69-L71) does:

```yaml
env_vars: |
  NODE_ENV=production
  DATABASE_URL=${{ secrets.DATABASE_URL }}  # ← Reads from GitHub Secrets
  JWT_SECRET=${{ secrets.JWT_SECRET }}      # ← Reads from GitHub Secrets
```

**Important**:

- Keep secrets in **GitHub repository secrets** - the workflow needs them to configure Cloud Run
- **Don't manually set them in GCP** - the workflow sets them automatically on each deployment
- View them in GCP Console → Cloud Run → Service → Variables & Secrets tab (set by the workflow)

### DATABASE_URL

**Purpose**: Connection string for your MongoDB database.

**Format for MongoDB Atlas**:

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Format for self-hosted MongoDB**:

```
mongodb://username:password@host:port/database
```

**How to get it**:

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
```

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
