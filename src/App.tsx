import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';

// Language settings
const SUPPORTED_LANGUAGES = ['en', 'fr'];
const DEFAULT_LANGUAGE = 'en';

// Language redirect component
function LanguageRedirect() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Get browser language or stored preference
    const userLang = i18n.language.split('-')[0];
    const targetLang = SUPPORTED_LANGUAGES.includes(userLang) ? userLang : DEFAULT_LANGUAGE;
    navigate(`/${targetLang}`, { replace: true });
  }, [navigate, i18n]);

  return null;
}

// Language wrapper component
function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (lang && SUPPORTED_LANGUAGES.includes(lang)) {
      i18n.changeLanguage(lang);
    } else {
      // Redirect to default language if invalid language is provided
      navigate(`/${DEFAULT_LANGUAGE}${window.location.pathname}`, { replace: true });
    }
  }, [lang, i18n, navigate]);

  return <>{children}</>;
}

// Routes that should use the main layout
const layoutRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/billing', element: <Billing /> },
  { path: '/profile', element: <Profile /> },
  { path: '/settings', element: <Settings /> },
  { path: '/forms/:id', element: <ViewForm /> },
  { path: '/campaigns/create', element: <CreateCampaign /> },
];

// Public routes that don't require auth
const publicRoutes = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/pricing', element: <Pricing /> },
];

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
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<LanguageRedirect />} />

        {/* Language-specific routes */}
        <Route path="/:lang" element={<LanguageWrapper><LandingPage /></LanguageWrapper>} />
        
        {/* Public routes with language prefix */}
        {publicRoutes.map(({ path, element }) => (
          path !== '/' && (
            <Route
              key={path}
              path={`/:lang${path}`}
              element={
                <LanguageWrapper>
                  {session && path !== '/' ? (
                    <Navigate to={`/${i18n.language}/dashboard`} replace />
                  ) : (
                    element
                  )}
                </LanguageWrapper>
              }
            />
          )
        ))}
        
        {/* Protected routes with language prefix */}
        {layoutRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={`/:lang${path}`}
            element={
              <LanguageWrapper>
                {session ? (
                  <MainLayout>{element}</MainLayout>
                ) : (
                  <Navigate to={`/${i18n.language}/login`} replace />
                )}
              </LanguageWrapper>
            }
          />
        ))}

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
