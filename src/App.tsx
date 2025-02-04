import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Routes that should use the main layout
const layoutRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/billing', element: <Billing /> },
  { path: '/profile', element: <Profile /> },
  { path: '/settings', element: <Settings /> },
  { path: '/forms/:id', element: <ViewForm /> },
  { path: '/campaigns/create', element: <CreateCampaign /> },
];

// Auth routes that don't use the main layout
const authRoutes = [
  { path: '/', element: <Login /> },
  { path: '/login', element: <Login /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/pricing', element: <Pricing /> },
];

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes without layout */}
        {authRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        
        {/* Routes with MainLayout */}
        {layoutRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<MainLayout>{element}</MainLayout>}
          />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
