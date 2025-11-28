# Deployment Guide 🚀

This project is configured as a **Modular Monolith**, meaning both the React Frontend and Node.js Backend are deployed as a **single service**. This simplifies deployment and reduces costs.

## 🐳 Docker Deployment (Render / Railway)

The project includes a production-optimized `Dockerfile` that:
1.  Builds the Frontend (Vite)
2.  Builds the Backend (TypeScript)
3.  Serves the Frontend via the Node.js Backend

### 1. Environment Variables
You **MUST** set these variables in your deployment platform (Render/Railway):

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Set to production | `production` |
| `DATABASE_URL` | Connection string for your database (PostgreSQL/SQLite) | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Secret for signing tokens (min 10 chars) | `complex_random_string` |
| `CORS_ORIGIN` | URL of your deployed app | `https://my-cv-builder.onrender.com` |
| `STRIPE_SECRET_KEY` | (Optional) Stripe Secret Key | `sk_live_...` |

### 2. Deploy on Render
1.  Create a new **Web Service**.
2.  Connect your GitHub repository.
3.  Select **Docker** as the Runtime.
4.  Add the Environment Variables listed above.
5.  Deploy!

### 3. Deploy on Railway
1.  New Project -> Deploy from GitHub.
2.  Railway will automatically detect the `Dockerfile`.
3.  Go to **Variables** and add the required Environment Variables.
4.  Railway will build and deploy.

## 🛠️ Local Production Test
To test the production build locally:

```bash
# 1. Build everything
npm run build

# 2. Start the production server
node dist-server/server/index.js
```

## 📦 Build Details
-   **Frontend**: Built to `dist/` using Vite.
-   **Backend**: Built to `dist-server/` using `tsc`.
-   **Server**: `server/app.ts` is configured to serve static files from `dist/` when `NODE_ENV=production`.
