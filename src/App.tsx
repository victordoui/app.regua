import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Index";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import BarberManagement from "./pages/BarberManagement";
import Subscriptions from "./pages/Subscriptions";
import Conversations from "./pages/Conversations";
import Notifications from "./pages/Notifications";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import CustomerSuccess from "./pages/CustomerSuccess";
import AdvancedNotifications from "./pages/AdvancedNotifications";
import Settings from "./pages/Settings";
import OnlineBooking from "./pages/OnlineBooking";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/appointments" element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        } />
        
        <Route path="/booking" element={
          <ProtectedRoute>
            <OnlineBooking />
          </ProtectedRoute>
        } />
        
        <Route path="/clients" element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        } />
        
        <Route path="/barbers" element={
          <ProtectedRoute>
            <BarberManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/subscriptions" element={
          <ProtectedRoute>
            <Subscriptions />
          </ProtectedRoute>
        } />
        
        <Route path="/conversations" element={
          <ProtectedRoute>
            <Conversations />
          </ProtectedRoute>
        } />
        
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        
        <Route path="/customer-success" element={
          <ProtectedRoute>
            <CustomerSuccess />
          </ProtectedRoute>
        } />
        
        <Route path="/advanced-notifications" element={
          <ProtectedRoute>
            <AdvancedNotifications />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthProvider>
          <AppContent />
          <Toaster />
          <Sonner />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;