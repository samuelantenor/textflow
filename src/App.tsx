import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ViewForm from './pages/ViewForm';
import CreateCampaign from './pages/CreateCampaign';
import Pricing from './pages/Pricing';
import LandingPage from './app/page';
import { useEffect, useState } from 'react';
import { supabase } from './integrations/supabase/client';
import './lib/i18n'; // Import i18n configuration
import { useTranslation } from 'react-i18next';

// Routes that should use the main layout
const layoutRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'billing', element: <Billing /> },
  { path: 'profile', element: <Profile /> },
  { path: 'settings', element: <Settings /> },
  { path: 'forms/:id', element: <ViewForm /> },
  { path: 'campaigns/create', element: <CreateCampaign /> },
];

// Public routes that don't require auth
const publicRoutes = [
  { path: '', element: <LandingPage /> },
  { path: 'login', element: <Login /> },
  { path: 'signup', element: <SignUp /> },
  { path: 'reset-password', element: <ResetPassword /> },
  { path: 'pricing', element: <Pricing />, allowAuthenticated: true },
];

// Language redirect component
function LanguageRedirect() {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    // If we're at the root without a language prefix, redirect to the preferred language
    if (location.pathname === '/') {
      const preferredLanguage = localStorage.getItem('i18nextLng') || 'en';
      window.location.replace(`/${preferredLanguage}`);
    }
  }, [location]);

  return null;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <LanguageRedirect />
      <Routes>
        {/* Language-specific routes */}
        {['en', 'fr'].map((lang) => (
          <Route key={lang} path={`/${lang}`} element={null}>
            {/* Public routes */}
            {publicRoutes.map(({ path, element, allowAuthenticated }) => (
              <Route
                key={path}
                path={path}
                element={
                  session && path !== '' && !allowAuthenticated ? (
                    <Navigate to={`/${lang}/dashboard`} replace />
                  ) : (
                    element
                  )
                }
              />
            ))}

            {/* Protected routes with MainLayout */}
            {layoutRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={
                  session ? (
                    <MainLayout>{element}</MainLayout>
                  ) : (
                    <Navigate to={`/${lang}/login`} replace />
                  )
                }
              />
            ))}
          </Route>
        ))}

        {/* Redirect root to preferred language */}
        <Route path="/" element={<Navigate to={`/${i18n.language}`} replace />} />
        
        {/* Catch all other routes and redirect to preferred language */}
        <Route path="*" element={<Navigate to={`/${i18n.language}`} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
