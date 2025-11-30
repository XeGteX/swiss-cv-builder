# Implementation Plan - Internationalization Fixes

## Goal
Fix missing French translations in the "Account & Storage" menu (Settings) and the Login/Register pages.

## User Review Required
> [!NOTE]
> No critical user review required. Standard translation updates.

## Proposed Changes

### [Translation Data]
#### [MODIFY] [translations.ts](file:///C:/Users/user/.gemini/antigravity/scratch/swiss-cv-builder/src/data/translations.ts)
- Add `auth` section to `fr` and `en` objects.
- Keys to add:
    - `signIn`: "Se connecter" / "Sign In"
    - `register`: "S'inscrire" / "Register"
    - `createAccount`: "Créer un compte" / "Create Account"
    - `welcomeBack`: "Bon retour" / "Welcome Back"
    - `signInDesc`: "Connectez-vous à votre compte" / "Sign in to your account"
    - `email`: "Email" / "Email"
    - `password`: "Mot de passe" / "Password"
    - `noAccount`: "Pas de compte ?" / "Don't have an account?"
    - `hasAccount`: "Déjà un compte ?" / "Already have an account?"
    - `createOne`: "En créer un" / "Create one"
    - `continueOffline`: "Continuer en mode hors-ligne" / "Continue in Offline Mode"
    - `joinSync`: "Rejoignez-nous pour synchroniser vos CVs" / "Join to sync your CVs across devices"
    - `signOut`: "Se déconnecter" / "Sign Out"
    - `accountStorage`: "Compte & Stockage" / "Account & Storage"
    - `signInSync`: "Connectez-vous pour synchroniser vos données." / "Sign in to sync your data across devices."
    - `localMode`: "Mode Local" / "Local Mode"
    - `cloudMode`: "Mode Cloud" / "Cloud Mode"
    - `localStorageDesc`: "Données stockées uniquement dans ce navigateur." / "Data is stored only in this browser."
    - `cloudStorageDesc`: "Données synchronisées avec votre compte." / "Data is synced to your account."

### [Components]
#### [MODIFY] [SettingsTab.tsx](file:///C:/Users/user/.gemini/antigravity/scratch/swiss-cv-builder/src/presentation/features/settings/SettingsTab.tsx)
- Replace hardcoded strings with `t('auth.*')` and `t('settings.*')`.

#### [MODIFY] [LoginPage.tsx](file:///C:/Users/user/.gemini/antigravity/scratch/swiss-cv-builder/src/presentation/features/auth/LoginPage.tsx)
- Import `useTranslation`.
- Replace hardcoded strings with `t('auth.*')`.

#### [MODIFY] [RegisterPage.tsx](file:///C:/Users/user/.gemini/antigravity/scratch/swiss-cv-builder/src/presentation/features/auth/RegisterPage.tsx)
- Import `useTranslation`.
- Replace hardcoded strings with `t('auth.*')`.

## Verification Plan

### Manual Verification
1.  **Settings Tab**:
    - Go to Settings.
    - Switch language to French.
    - Verify "Account & Storage", "Sign In / Create Account", "Sign Out", "Local Mode", "Cloud Mode" are translated.
2.  **Login Page**:
    - Click "Sign In".
    - Verify "Welcome Back", "Email", "Password", "Sign In" button, "Don't have an account?" are translated.
3.  **Register Page**:
    - Click "Create one" (from Login) or "Register".
    - Verify "Create Account", "Join to sync...", "Email", "Password", "Create Account" button, "Already have an account?" are translated.
