import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ViewForm from './pages/ViewForm';
import CreateCampaign from './pages/CreateCampaign';
import Pricing from './pages/Pricing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/forms/:id" element={<ViewForm />} />
        <Route path="/campaigns/create" element={<CreateCampaign />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </Router>
  );
}

export default App;