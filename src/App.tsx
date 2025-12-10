
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from "./presentation/components/ToastContainer";
import { SubscriptionModal } from "./presentation/components/modals/SubscriptionModal";
import { SmartReviewToast } from "./presentation/components/SmartReviewToast";
import { ShareModal } from "./presentation/components/modals/ShareModal";
import { LoginPage } from './presentation/features/auth/LoginPage';
import { RegisterPage } from './presentation/features/auth/RegisterPage';
import { LabsDashboard } from './presentation/labs/LabsDashboard';
import { WizardPage } from './presentation/features/wizard/WizardPage';
import { AdminDashboard } from './presentation/features/admin/AdminDashboard';
import { PotentielDashboard } from './presentation/features/admin/PotentielDashboard';
import { MarketingDashboard } from './presentation/features/admin/MarketingDashboard';
import { CVPageV2 } from './presentation/pages/CVPageV2';
import { TemplateGallery } from './presentation/features/templates/TemplateGallery';
import { VirtualTemplateGallery } from './presentation/features/templates/VirtualTemplateGallery';
import { InteractiveResume } from './presentation/features/interactive-resume/InteractiveResume';
import { NexalOnboardingPage } from './presentation/features/wizard/NexalOnboardingPage';
import { useAuthStore } from './application/store/auth-store';
import { initializeLayouts } from './presentation/layouts';
import { ErrorBoundary } from './presentation/components/ErrorBoundary';
import { AppShell } from './presentation/layouts/AppShell';
import { LandingPage } from './presentation/pages/LandingPage';

// Footer link pages
import TemplatesPage from './presentation/pages/TemplatesPage';
import ExemplesPage from './presentation/pages/ExemplesPage';
import BlogPage from './presentation/pages/BlogPage';
import GuideCVPage from './presentation/pages/GuideCVPage';
import ConfidentialitePage from './presentation/pages/ConfidentialitePage';
import CGUPage from './presentation/pages/CGUPage';
import ContactPage from './presentation/pages/ContactPage';
import MentionsLegalesPage from './presentation/pages/MentionsLegalesPage';

// Region Context for Chameleon Templates
import { RegionProvider } from './presentation/contexts/RegionContext';

// Debug Mode
import { DebugBar } from './presentation/features/debug';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    initializeLayouts();
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <RegionProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page - Outside AppShell for full scroll */}
            <Route path="/landing" element={<LandingPage />} />

            {/* NEXAL Wizard Onboarding - Full-screen immersive */}
            <Route path="/onboard" element={<NexalOnboardingPage />} />

            {/* Footer link pages - Outside AppShell for full scroll */}
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/exemples" element={<ExemplesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/guide-cv" element={<GuideCVPage />} />
            <Route path="/confidentialite" element={<ConfidentialitePage />} />
            <Route path="/cgu" element={<CGUPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/mentions-legales" element={<MentionsLegalesPage />} />

            {/* All other routes wrapped in AppShell */}
            <Route path="/*" element={
              <AppShell>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/labs" element={<LabsDashboard />} />
                  <Route path="/wizard" element={<WizardPage />} />
                  <Route path="/templates" element={<TemplateGallery />} />
                  <Route path="/gallery" element={<VirtualTemplateGallery />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/potentiel" element={<PotentielDashboard />} />
                  <Route path="/admin/marketing" element={<MarketingDashboard />} />
                  {/* SCV .nex Viewer - Interactive Resume */}
                  <Route path="/interactive" element={<InteractiveResume />} />
                  <Route path="/sandbox" element={<InteractiveResume />} />
                  <Route path="/" element={<CVPageV2 />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ToastContainer />
                <SubscriptionModal />
                <SmartReviewToast />
                <ShareModal />
              </AppShell>
            } />

          </Routes>
          {/* DebugBar - Global floating component */}
          <DebugBar />
        </BrowserRouter>
      </RegionProvider>
    </ErrorBoundary>
  );
}

export default App;
