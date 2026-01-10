import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Index";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import BarberManagement from "./pages/BarberManagement";
import Subscriptions from "./pages/Subscriptions";
import Conversations from "./pages/Conversations";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import CustomerSuccess from "./pages/CustomerSuccess";
import AdvancedNotifications from "./pages/AdvancedNotifications";
import Settings from "./pages/Settings";
import OnlineBooking from "./pages/OnlineBooking";
import Services from "./pages/Services";

// Novas Páginas
import BarberPerformance from "./pages/BarberPerformance";
import Campaigns from "./pages/Campaigns";
import Billing from "./pages/Billing";
import Commissions from "./pages/Commissions";
import SubscriptionCreation from "./pages/SubscriptionCreation";
import CompanySettings from "./pages/CompanySettings";
import Inventory from "./pages/Inventory";
import Integrations from "./pages/Integrations";
import Cash from "./pages/Cash";
import SalesReports from "./pages/SalesReports";
import PublicBookingPage from "./pages/PublicBookingPage";

// Client Mobile Pages
import ClientLogin from "./pages/client/ClientLogin";
import ClientRegister from "./pages/client/ClientRegister";
import ClientHome from "./pages/client/ClientHome";
import ClientAppointments from "./pages/client/ClientAppointments";
import ClientBooking from "./pages/client/ClientBooking";
import ClientProfile from "./pages/client/ClientProfile";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rotas Mobile para Clientes - /b/:userId */}
        <Route path="/b/:userId/login" element={<ClientLogin />} />
        <Route path="/b/:userId/cadastro" element={<ClientRegister />} />
        <Route path="/b/:userId/home" element={<ClientHome />} />
        <Route path="/b/:userId/agendamentos" element={<ClientAppointments />} />
        <Route path="/b/:userId/agendar" element={<ClientBooking />} />
        <Route path="/b/:userId/perfil" element={<ClientProfile />} />
        <Route path="/b/:userId" element={<Navigate to="login" replace />} />

        {/* Rota Pública Legacy */}
        <Route path="/public-booking/:userId/*" element={<PublicBookingPage />} />

        {/* Dashboard / Visão Geral */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/customer-success" element={<ProtectedRoute><CustomerSuccess /></ProtectedRoute>} />
        <Route path="/barber-performance" element={<ProtectedRoute><BarberPerformance /></ProtectedRoute>} />

        {/* Operações */}
        <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route path="/barbers" element={<ProtectedRoute><BarberManagement /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />

        {/* Comunicação */}
        <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
        {/* Rota unificada para Notificações Avançadas (inclui Notificações Gerais) */}
        <Route path="/advanced-notifications" element={<ProtectedRoute><AdvancedNotifications /></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />

        {/* Financeiro */}
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} /> {/* Visão Financeira */}
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/commissions" element={<ProtectedRoute><Commissions /></ProtectedRoute>} />

        {/* Assinaturas */}
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/subscriptions/new" element={<ProtectedRoute><SubscriptionCreation /></ProtectedRoute>} />

        {/* Minha Empresa */}
        <Route path="/settings/company" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />

        {/* Administração */}
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} /> {/* Configurações Gerais */}

        {/* Vendas / Caixa */}
        <Route path="/cash" element={<ProtectedRoute><Cash /></ProtectedRoute>} />
        <Route path="/sales-reports" element={<ProtectedRoute><SalesReports /></ProtectedRoute>} />

        {/* Rota de Agendamento Online (mantida, mas não aparece na sidebar de gestão) */}
        <Route path="/booking" element={<ProtectedRoute><OnlineBooking /></ProtectedRoute>} />

        {/* Rota de fallback */}
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
        <ErrorBoundary>
          <AuthProvider>
            <AppContent />
            <Toaster />
            <Sonner />
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;