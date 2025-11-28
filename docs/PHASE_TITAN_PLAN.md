# PHASE TITAN ROADMAP 🛡️

**Objective**: Upgrade Swiss CV Builder from "Prototype" to "Production-Grade SaaS".
**Philosophy**: No shortcuts. Solid engineering. 10+ year survival.

---

## 1. Backend & Auth (The Backbone) 🦴

**Current State**: Monolithic Express server, hardcoded URLs, basic auth without validation.
**Problems/Risks**: Security vulnerabilities, hard to maintain, tight coupling, no environment configuration.

**Objectives**:
- Modular Architecture (Controller/Service/Route).
- Environment Configuration (Zod validated).
- Robust Auth (JWT/Session, Hashing, Rate Limiting).
- Structured Logging & Error Handling.

**Checklist**:
- [x] **Refactor Structure**: Create `server/routes`, `server/controllers`, `server/services`, `server/middleware`, `server/config`.
- [x] **Env Config**: Implement `server/config/env.ts` with Zod validation for `PORT`, `DB_URL`, `JWT_SECRET`, etc.
- [x] **Auth Hardening**: Implement `AuthService` with bcrypt and JWT (Access + Refresh).
- [x] **Validation**: Add Zod schemas for all API inputs (Login, Register, CV Save).
- [x] **Error Handling**: Create global error middleware (JSON responses, status codes).
- [x] **Logging**: Implement `LoggerService` (Console/File) for structured logs.
- [x] **Rate Limiting**: Add `express-rate-limit` to auth routes.

---

## 2. Subscription / SaaS Mode 💰

**Current State**: UI tab exists but is empty. No backend logic.
**Problems/Risks**: No monetization capability.
**Objectives**: Functional subscription model (Free/Pro), extensible for Stripe.

**Checklist**:
- [x] **Data Model**: Update Prisma schema with `Subscription` model (Plan, Status, Period).
- [x] **Backend Routes**: `GET /api/subscription`, `POST /api/subscription/upgrade`.
- [x] **Mock Payment**: Implement a "Fake Payment" flow for testing upgrades.
- [x] **Frontend Integration**: Connect `SubscriptionTab.tsx` to backend.
- [x] **Limits**: Enforce limits based on plan (e.g., max 1 CV for Free).

---

## 3. Persistence & Data Model 💾

**Current State**: Basic Prisma schema, LocalStorage fallback.
**Problems/Risks**: Schema might not support SaaS features.
**Objectives**: Robust schema, reliable migrations.

**Checklist**:
- [x] **Schema Audit**: Review `schema.prisma`. Ensure `User` -> `CV` -> `Subscription` relations are correct.
- [x] **Migrations**: Run `prisma migrate dev` to align DB with new schema.
- [x] **Seeding**: Create a seed script for default plans/admin user.

---

## 4. Frontend & Templates (Cleanup) 🧹
**Problems/Risks**: Edge cases (huge images, long content).
**Objectives**: Bulletproof generation, Documentation.

**Checklist**:
- [x] **Documentation**: Create `docs/PDF_ENGINE.md` explaining the `html-to-image` pipeline.
- [x] **Image Handling**: Add client-side check for image size/dimensions before upload.
- [x] **Optimization**: Ensure `pixelRatio` and quality settings are optimal.

---

## 6. Testing (Safety Net) 🧪

**Current State**: Zero tests.
**Problems/Risks**: Regressions are guaranteed without tests.
**Objectives**: Unit tests for core logic, Smoke E2E.

**Checklist**:
- [x] **Setup**: Install Vitest (Frontend) and Jest (Backend).
- [x] **Unit Tests**: Test `cv-store` reducers/actions.
- [x] **Backend Tests**: Test `AuthService` (Login/Register logic).
- [ ] **E2E Setup**: Install Playwright.
- [ ] **Smoke Test**: Write one E2E test: Load App -> Fill Data -> Generate PDF.

---

## 7. i18n (Real Languages) 🌍

**Current State**: Manual text switches.
**Problems/Risks**: Hard to add new languages, inconsistent UI.
**Objectives**: Centralized translation system.

**Checklist**:
- [x] **Structure**: Create `src/i18n/en.json` and `src/i18n/fr.json`.
- [x] **Hook**: Implement `useTranslation` hook.
- [ ] **Migration**: Replace hardcoded text in UI with translation keys.

---

## 8. DevOps & Self-Discipline 🛠️

**Current State**: Manual run.
**Objectives**: Reproducible environment, disciplined logging.

**Checklist**:
- [x] **AI Journal**: Maintain `ai-notes/` (Success/Failure logs).
- [x] **Cleanup**: Remove unused files and dead code.
- [x] **Final Report**: Generate `docs/PHASE_TITAN_REPORT.md`.

---

**Status**: Ready to Execute.
**Next Step**: Section 1 - Backend & Auth Refactor.
