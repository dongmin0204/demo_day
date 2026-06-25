import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { MedicineProvider } from '@/contexts/MedicineContext';
import { AnalysisProvider } from '@/contexts/AnalysisContext';
import { UserProvider, useUserContext } from '@/contexts/UserContext';

import OnboardingPage from '@/pages/OnboardingPage';
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import AddMedicinePage from '@/pages/AddMedicinePage';
import OcrPage from '@/pages/OcrPage';
import CombinationPage from '@/pages/CombinationPage';
import ResultsPage from '@/pages/ResultsPage';
import DetailPage from '@/pages/DetailPage';
import SharePage from '@/pages/SharePage';
import SettingsPage from '@/pages/SettingsPage';

const ONBOARDING_REDIRECT_KEY = 'yak-josim-onboarding-redirect';

function getOnboardingRedirectPath() {
  const fallbackPath = '/home';

  try {
    const path = window.sessionStorage.getItem(ONBOARDING_REDIRECT_KEY);
    window.sessionStorage.removeItem(ONBOARDING_REDIRECT_KEY);

    return path === '/combine' || path === '/home' ? path : fallbackPath;
  } catch {
    return fallbackPath;
  }
}

function OnboardingGuard() {
  const { state } = useUserContext();
  if (state.hasCompletedOnboarding) {
    return <Navigate to={getOnboardingRedirectPath()} replace />;
  }
  return <OnboardingPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<OnboardingGuard />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/add-medicine" element={<AddMedicinePage />} />
      <Route path="/ocr" element={<OcrPage />} />
      <Route path="/combine" element={<CombinationPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/detail/:resultId" element={<DetailPage />} />
      <Route path="/share/:sessionId" element={<SharePage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <UserProvider>
          <MedicineProvider>
            <AnalysisProvider>
              <AppRoutes />
              <Toaster
                position="top-center"
                richColors
                toastOptions={{
                  classNames: {
                    toast:
                      'rounded-2xl border border-gray-200 bg-white text-foreground shadow-lg',
                    title: 'text-sm font-medium',
                    description: 'text-sm text-gray-600',
                  },
                }}
              />
            </AnalysisProvider>
          </MedicineProvider>
        </UserProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
