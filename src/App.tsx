import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from "./presentation/components/ToastContainer";
import { LoginPage } from './presentation/features/auth/LoginPage';
import { RegisterPage } from './presentation/features/auth/RegisterPage';
import { LabsDashboard } from './presentation/labs/LabsDashboard';
import { WizardPage } from './presentation/features/wizard/WizardPage';
import { AdaptiveLayout } from './presentation/layouts/AdaptiveLayout';
import { useAuthStore } from './application/store/auth-store';
import { useCVStore } from './application/store/cv-store';
import { initializeLayouts } from './presentation/layouts';
import { ErrorBoundary } from './presentation/components/ErrorBoundary';

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
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/labs" element={<LabsDashboard />} />
          <Route path="/wizard" element={<WizardPage />} />
          <Route path="/" element={<AdaptiveLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
