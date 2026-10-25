import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';
import { useI18n } from '@/i18n/useI18n';
import { Skeleton } from '@/components/ui/skeleton';

import LandingPage from '@/pages/LandingPage';
import AuthScreen from '@/pages/AuthScreen';
import Dashboard from '@/pages/Dashboard';
import Symptoms from '@/pages/Symptoms';
import SymptomResults from '@/pages/SymptomResults';
import Medicines from '@/pages/Medicines';
import MedicineDetail from '@/pages/MedicineDetail';
import Appointments from '@/pages/Appointments';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Education from '@/pages/Education';
import FirstAid from '@/pages/FirstAid';
import Emergency from '@/pages/Emergency';
import NotFound from '@/pages/NotFound';

function SessionLoading() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-4 w-64" />
      <p className="sr-only">{t('common.loading')}</p>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <SessionLoading />;
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthScreen />} />

          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/symptoms" element={<ProtectedRoute><Symptoms /></ProtectedRoute>} />
            <Route path="/symptoms/results" element={<ProtectedRoute><SymptomResults /></ProtectedRoute>} />
            <Route path="/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
            <Route path="/medicines/:id" element={<ProtectedRoute><MedicineDetail /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            <Route path="/education" element={<Education />} />
            <Route path="/first-aid" element={<FirstAid />} />
            <Route path="/emergency" element={<Emergency />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
