import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import Login from './pages/Login';
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
    return <div>Loading...</div>; // You might want to add a proper loading screen here
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        {publicRoutes.map(({ path, element }) => (
          <Route 
            key={path} 
            path={path} 
            element={
              // If user is authenticated and tries to access public routes except landing page,
              // redirect to dashboard
              session && path !== '/' ? (
                <Navigate to="/dashboard" replace />
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
                <Navigate to="/login" replace />
              )
            }
          />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
