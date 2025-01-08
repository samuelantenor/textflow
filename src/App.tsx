import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";
import Billing from "@/pages/Billing"; // Assuming Billing is the main component

// Initialize the query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Billing />
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
