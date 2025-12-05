
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
import { CVPageV2 } from './presentation/pages/CVPageV2';
import { TemplateGallery } from './presentation/features/templates/TemplateGallery';
import { InteractiveResume } from './presentation/features/interactive-resume/InteractiveResume';
import { useAuthStore } from './application/store/auth-store';
import { useCVStore } from './application/store/cv-store';
import { initializeLayouts } from './presentation/layouts';
import { ErrorBoundary } from './presentation/components/ErrorBoundary';
import { AppShell } from './presentation/layouts/AppShell';
import PDFRenderPage from './presentation/pages/PDFRenderPage';

function App() {
  const { checkAuth } = useAuthStore();
  const { syncData } = useCVStore();

  useEffect(() => {
    initializeLayouts();
    checkAuth();
    syncData();
  }, [checkAuth, syncData]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/labs" element={<LabsDashboard />} />
            <Route path="/wizard" element={<WizardPage />} />
            <Route path="/templates" element={<TemplateGallery />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Hidden R&D Route - Access via /sandbox */}
            <Route path="/sandbox" element={<InteractiveResume />} />
            {/* PDF Render Route for Puppeteer - Do NOT add AppShell chrome */}
            <Route path="/pdf-render/:id" element={<PDFRenderPage />} />
            <Route path="/" element={<CVPageV2 />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
          <SubscriptionModal />
          <SmartReviewToast />
          <ShareModal />
        </AppShell>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

