import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import AuthContainer from "@/components/auth/AuthContainer";
import LoadingState from "@/components/auth/LoadingState";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useToast } from "@/hooks/use-toast";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
