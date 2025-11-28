# PHASE OLYMPUS ROADMAP ⚡

**Objective**: Deploy a production-ready, monetized, and secure SaaS application.
**Philosophy**: "Production is the only truth."

---

## 1. Stripe Integration (Monetization) 💳

**Goal**: Real payments, real subscriptions, automated provisioning.

**Checklist**:
- [x] **Dependencies**: Install `stripe`.
- [x] **Service**: Create `server/services/stripe-service.ts` (Customer, Checkout, Portal).
- [x] **Webhooks**: Create `server/controllers/webhook-controller.ts` to handle `checkout.session.completed`.
- [x] **Database**: Sync Stripe status (`active`, `past_due`) with `Subscription` model.
- [x] **Env**: Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO`.

---

## 2. Auth Stabilization (Security) 🔒

**Goal**: Secure, persistent, and revocable sessions.

**Checklist**:
- [x] **Strategy**: Implement Access Token (15m) + Refresh Token (7d) rotation.
- [x] **Cookies**: Ensure `httpOnly`, `secure`, `sameSite: strict`.
- [x] **Logout**: Clear cookies server-side.
- [x] **Rate Limiting**: Verify `express-rate-limit` configuration on auth routes.

---

## 3. Dockerization (Containerization) 🐳

**Goal**: "It works on my machine" -> "It works everywhere".

**Checklist**:
- [x] **Backend**: Create `server/Dockerfile`.
- [x] **Frontend**: Create `Dockerfile` (Multi-stage build: Build -> Nginx).
- [x] **Compose**: Create `docker-compose.yml` orchestrating Backend, Frontend, and Postgres.
- [x] **Database**: Switch Prisma from SQLite to PostgreSQL.

---

## 4. Deployment Prep (Launchpad) 🚀

**Goal**: One-click deployment to PaaS (Railway/Render).

**Checklist**:
- [x] **Config**: Create `deployment/render.yaml` (or generic setup).
- [x] **Scripts**: Add `build:prod` and `start:prod` scripts.
- [x] **Documentation**: Create `deployment/README.md`.

---

## 5. UX/UI & i18n (Polish) ✨

**Goal**: Professional look and feel, fully localized.

**Checklist**:
- [x] **Migration**: Move hardcoded text from components to `src/i18n/*.json`.
- [x] **Consistency**: Ensure FR and EN keys match.
- [x] **Cleanup**: Remove any remaining dev-only UI elements.

---

## 6. Final Report (Olympus) 🏛️

**Goal**: Document the architecture and hand over the keys.

**Checklist**:
- [x] **Architecture**: Diagram of the final stack.
- [x] **Manual**: How to deploy, how to manage Stripe.
- [x] **Scaling**: Advice for 10k+ users.

---

**Status**: Ready to Launch.
**Next Step**: Section 1 - Stripe Integration.
