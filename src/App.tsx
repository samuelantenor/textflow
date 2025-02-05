import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          {publicRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                session && (path === '/login' || path === '/signup' || path === '/reset-password') ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  element
                )
              }
            />
          ))}
          
          {/* Protected routes */}
          {layoutRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                !session ? (
                  <Navigate to="/login" replace />
                ) : (
                  <MainLayout>{element}</MainLayout>
                )
              }
            />
          ))}

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
