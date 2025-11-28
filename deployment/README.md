# Deployment Guide 🚀

## Option 1: Docker Compose (VPS / Local)

The easiest way to run the full stack (Frontend + Backend + Database).

### Prerequisites
- Docker & Docker Compose installed.

### Steps
1. **Configure Environment**:
   Create a `.env` file (or use system env vars) with:
   ```env
   JWT_SECRET=your_secure_jwt_secret
   REFRESH_TOKEN_SECRET=your_secure_refresh_secret
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ID_PRO=price_...
   ```

2. **Run**:
   ```bash
   docker-compose up -d --build
   ```

3. **Access**:
   - Frontend: `http://localhost:8080`
   - Backend: `http://localhost:3000`

---

## Option 2: PaaS (Railway / Render)

### Backend (Node.js)
1. **Build Command**: `npm ci && npx prisma generate`
2. **Start Command**: `npx tsx server/index.ts`
3. **Environment Variables**:
   - `DATABASE_URL`: (Provided by PaaS Postgres)
   - `JWT_SECRET`: ...
   - `REFRESH_TOKEN_SECRET`: ...
   - `STRIPE_...`: ...
   - `CORS_ORIGIN`: URL of your frontend (e.g., `https://my-app.vercel.app`)

### Frontend (Vercel / Netlify)
1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Environment Variables**:
   - `VITE_API_URL`: URL of your backend (e.g., `https://my-api.railway.app`)

---

## Production Checklist ✅
- [ ] **Database**: Use a managed Postgres instance (RDS, Railway, Neon).
- [ ] **Secrets**: Rotate all secrets (JWT, Stripe).
- [ ] **HTTPS**: Ensure SSL is enabled (handled by PaaS/Vercel automatically).
- [ ] **Stripe Webhook**: Add your backend URL (`/api/webhook`) to Stripe Dashboard.
