
# Swiss CV Builder - Self-Diagnosis Report

## 1. Summary
- **Architecture:** Clean Architecture on Frontend (Domain/Data/Presentation layers). Backend is Express/Prisma.
- **State:** Zustand stores (`cv-store`, `settings-store`, `auth-store`).
- **Tech Stack:** React, Vite, Tailwind, Framer Motion, html2pdf.js.
- **Status:** Functional core, but significant fragmentation in features (Letter) and logic gaps (Scoring, PDF).

## 2. Frontend - What Works
- **Structure:** Clear separation of concerns (Clean Architecture).
- **Tech Stack:** Modern and fast (Vite, React 19).
- **State Management:** Centralized with Zustand.
- **Styling:** TailwindCSS is used consistently.

## 3. Frontend - What is Broken / Inconsistent
- **PDF Export:**
  - `html2pdf-adapter.ts` uses fixed `windowWidth: 794px` (A4). If the preview component doesn't match this exactly, layout shifts occur.
  - Potential CSS unit mismatch (px vs mm).
- **Scoring System (`SemanticAnalyzer.ts`):**
  - **Hardcoded English:** `ACTION_VERBS` are English only. `analyze` function accepts `_language` but ignores it.
  - **Simplistic Logic:** Relies heavily on keyword counting.
  - **Arbitrary Scores:** "Relevance" hardcoded to 70.
- **Letter Generation:**
  - **Duplication:** `CoverLetterTab.tsx` and `AITab.tsx` seem to overlap in functionality.
  - **UX:** Confusing to have multiple places for letters.
- **Language/i18n:**
  - `src/data/translations.ts` exists, but usage is inconsistent in domain logic (Scoring).
- **Mobile:**
  - `MobileLayout.tsx` exists, but needs verification if it's effectively used and toggled.

## 4. Backend / Services - Status
- **Minimal:** `server/index.ts`, `server/routes`, `server/services/email-service.ts`.
- **AI:** `Gemini` integration seems to be on the backend (based on `package.json` dependencies), but need to verify if frontend calls it directly or via backend.

## 5. Architectural Risks / Tech Debt
- **Hardcoded Logic:** Scoring engine is brittle and English-centric.
- **PDF/Preview Disconnect:** WYSIWYG is not guaranteed due to different rendering contexts (screen vs html2canvas).
- **Duplicate Features:** Letter generation needs unification.

## 6. Top 5 Priorities to Fix Next
1.  **Unify Letter Generation:** Merge `CoverLetterTab` and `AITab` into a single, cohesive feature.
2.  **Fix Scoring System:** Make it language-aware and less heuristic-dependent (or better heuristics).
3.  **Fix PDF Export:** Ensure Preview and PDF export use the exact same dimensions/CSS context to guarantee 1:1 match.
4.  **Global i18n:** Ensure all domain logic (scoring) and UI components respect the selected language.
5.  **Mobile Experience:** Verify and improve the mobile layout toggle.
