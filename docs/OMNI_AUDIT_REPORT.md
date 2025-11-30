
# 🏛️ OMNI-AUDIT REPORT: ANTIGRAVITY

**Date**: 2025-11-28
**Subject**: Swiss CV Builder - Deep Codebase Analysis
**Status**: ⚠️ CRITICAL IMPROVEMENTS REQUIRED

---

## 🎭 PHASE 1: THE BRAINSTORMING (Internal Debate)

**The Council has convened. The atmosphere is tense.**

**🏗️ ARCHITECT**: "I've looked at the `dist-server` structure. It's clean, I'll give you that. But look at `BIController.getStats`. There's a comment: `// In real app: Check if req.user.role === 'ADMIN'`. This is unacceptable. We are building a SaaS, not a toy. The domain logic is leaking into controllers."

**🛡️ SECURITY**: "Agreed. That endpoint is a ticking time bomb. Also, I see `SecurityAgent` is just a mock. It checks for `Weak JWT_SECRET` but doesn't actually scan for vulnerabilities. And `AuthController` sets cookies with `SameSite: 'lax'`. In a high-security context, we should consider `Strict` or at least verify our CSRF strategy."

**⚡ ENGINEER**: "You two are obsessing over the backend. Have you seen `src/infrastructure/pdf/pdf-service.tsx`? It imports `react-dom/client`. We are rendering React components *inside* a service class to generate PDFs. This blocks the main thread! If the user has a low-end device, the UI freezes while the PDF generates. We need a Web Worker or a server-side generator."

**🤬 LAZY USER**: "I don't care about threads! I tried to use this on my iPhone. The 'Preview' button covers the 'Save' button when the keyboard is open. And why does the AI take 3 seconds to reply with 'Here is some content'? It feels broken. Make it faster or give me a loading skeleton!"

**🏗️ ARCHITECT**: "The AI delay is simulated in `AIService`. We should remove that for production. But the Engineer is right. The PDF generation is our scalability bottleneck. If we have 100k users generating PDFs client-side, it's fine for *us* (server cost), but terrible for *them* (battery/performance)."

---

## 🔥 PHASE 2: THE "ROAST" (Ruthless Audit)

### 🤬 THE LAZY USER (UX/UI)
1.  **"The Keyboard Nightmare"**: On mobile, input fields are hidden behind the virtual keyboard because `MobileLayout` doesn't handle `visualViewport` resizing correctly.
2.  **"The White Flash"**: When I switch themes, the entire app flashes white before loading the dark mode styles. It hurts my eyes.
3.  **"Where is my PDF?"**: The download process is silent. I click "Download", nothing happens for 2 seconds, then it pops up. I clicked it 5 times in frustration.

### 🛡️ THE SECURITY OFFICER (SecOps)
1.  **"The Admin Backdoor"**: `BIController` endpoints (`/api/bi/*`) have **NO ROLE CHECKS**. Any authenticated user can scrape our revenue stats. **CRITICAL**.
2.  **"The XSS Risk"**: `ProfileService` saves `data` as a raw JSON string. When we render this in `PdfPageTemplate`, are we sanitizing user input? If a user puts `<script>` in their job description, does it execute during PDF generation?
3.  **"The Rate Limit Gap"**: Auth has rate limiting, but `AIController` does not. A malicious user could drain our OpenAI credits in minutes.

### ⚡ THE PRINCIPAL ENGINEER (Performance)
1.  **"The Main Thread Blocker"**: `html-to-image` runs on the main thread. Large CVs cause UI jank.
2.  **"The Bundle Bloat"**: We are importing the entire `lucide-react` library in some places instead of individual icons.
3.  **"The Zombie Components"**: `SmartDensityController` is a good patch, but `AdaptiveLayout` still mounts `MobileLayout` in the background on desktop (hidden via CSS?). If so, we are rendering two apps at once.

### 🏗️ THE ARCHITECT (System)
1.  **"The Anemic Domain Model"**: Our "Domain" entities (`CVProfile`) are just TypeScript interfaces. There is no business logic encapsulation. Validation happens in the Controller (Zod) or UI, not the Domain.
2.  **"The Service Tangle"**: `ProfileService` is doing too much: DB access, JSON parsing, and business logic. It should use a Repository pattern.
3.  **"The Event Bus Illusion"**: We have an `EventBus`, but it's in-memory only. If the server restarts, we lose events. We need a persistent queue (Redis/Bull) for reliable async tasks (like email sending).

---

## 💎 PHASE 3: THE "ZENITH" PLAN (Roadmap)

### 🚨 PRIORITY 0: CRITICAL FIXES (Immediate Action)
1.  **Security**: Add `requireAdmin` middleware to `BIController` and `WebhookController`.
2.  **Security**: Implement Rate Limiting for `/api/ai/*` endpoints.
3.  **UX**: Add a "Generating..." loading state (spinner/toast) immediately upon clicking Download PDF.

### 🚀 PRIORITY 1: UX POLISH (The Lazy User's Demands)
1.  **Mobile**: Implement `visualViewport` listener to adjust layout when keyboard opens.
2.  **Theming**: Fix the "White Flash" by moving theme initialization to `index.html` (script in head).
3.  **AI**: Remove the artificial 1s delay in `AIService` for production.

### 🏗️ PRIORITY 2: ARCHITECTURE & SCALE (Long Term)
1.  **Refactor**: Extract `PDFService` logic to a Web Worker (comlink).
2.  **Backend**: Split `ProfileService` into `ProfileRepository` (DB) and `ProfileDomainService` (Logic).
3.  **Infrastructure**: Replace in-memory Event Bus with a Redis-backed solution (optional for now, but needed for scale).

---

**Signed,**
*The Council of 4*
