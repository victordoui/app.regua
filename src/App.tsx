import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Index";
import BarberDashboard from "./pages/BarberDashboard";
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
import Reviews from "./pages/Reviews";
import Gallery from "./pages/Gallery";
import Loyalty from "./pages/Loyalty";
import Waitlist from "./pages/Waitlist";
import Coupons from "./pages/Coupons";
import Referrals from "./pages/Referrals";
import CommissionRules from "./pages/CommissionRules";
import GiftCards from "./pages/GiftCards";
import DynamicPricing from "./pages/DynamicPricing";
import Shifts from "./pages/Shifts";
import TeamChat from "./pages/TeamChat";
import ClientHistory from "./pages/client/ClientHistory";
import ClientLoyalty from "./pages/client/ClientLoyalty";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";

// Super Admin Pages
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SubscribersManagement from "./pages/superadmin/SubscribersManagement";
import PlatformCoupons from "./pages/superadmin/PlatformCoupons";
import AuditLogs from "./pages/superadmin/AuditLogs";
import FinancialMetrics from "./pages/superadmin/FinancialMetrics";
import ExpiringSubscriptions from "./pages/superadmin/ExpiringSubscriptions";
import PaymentHistory from "./pages/superadmin/PaymentHistory";
import BroadcastMessages from "./pages/superadmin/BroadcastMessages";
import EmailTemplates from "./pages/superadmin/EmailTemplates";
import PlanConfiguration from "./pages/superadmin/PlanConfiguration";
import SupportTickets from "./pages/superadmin/SupportTickets";
import TicketDetail from "./pages/superadmin/TicketDetail";
import SystemUsers from "./pages/superadmin/SystemUsers";
import SignupPage from "./pages/public/SignupPage";
import SalesPage from "./pages/public/SalesPage";
import Upgrade from "./pages/Upgrade";

// Client Mobile Pages
import ClientLogin from "./pages/client/ClientLogin";
import ClientRegister from "./pages/client/ClientRegister";
import ClientPayments from "./pages/client/ClientPayments";
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
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        {/* Super Admin Routes */}
        <Route path="/superadmin" element={<ProtectedRoute requiredRole="super_admin"><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/users" element={<ProtectedRoute requiredRole="super_admin"><SystemUsers /></ProtectedRoute>} />
        <Route path="/superadmin/metrics" element={<ProtectedRoute requiredRole="super_admin"><FinancialMetrics /></ProtectedRoute>} />
        <Route path="/superadmin/subscribers" element={<ProtectedRoute requiredRole="super_admin"><SubscribersManagement /></ProtectedRoute>} />
        <Route path="/superadmin/expiring" element={<ProtectedRoute requiredRole="super_admin"><ExpiringSubscriptions /></ProtectedRoute>} />
        <Route path="/superadmin/payments" element={<ProtectedRoute requiredRole="super_admin"><PaymentHistory /></ProtectedRoute>} />
        <Route path="/superadmin/coupons" element={<ProtectedRoute requiredRole="super_admin"><PlatformCoupons /></ProtectedRoute>} />
        <Route path="/superadmin/broadcast" element={<ProtectedRoute requiredRole="super_admin"><BroadcastMessages /></ProtectedRoute>} />
        <Route path="/superadmin/templates" element={<ProtectedRoute requiredRole="super_admin"><EmailTemplates /></ProtectedRoute>} />
        <Route path="/superadmin/plans" element={<ProtectedRoute requiredRole="super_admin"><PlanConfiguration /></ProtectedRoute>} />
        <Route path="/superadmin/support" element={<ProtectedRoute requiredRole="super_admin"><SupportTickets /></ProtectedRoute>} />
        <Route path="/superadmin/support/:id" element={<ProtectedRoute requiredRole="super_admin"><TicketDetail /></ProtectedRoute>} />
        <Route path="/superadmin/logs" element={<ProtectedRoute requiredRole="super_admin"><AuditLogs /></ProtectedRoute>} />

        {/* Rotas Mobile para Clientes - /b/:userId */}
        <Route path="/b/:userId/login" element={<ClientLogin />} />
        <Route path="/b/:userId/cadastro" element={<ClientRegister />} />
        <Route path="/b/:userId/home" element={<ClientHome />} />
        <Route path="/b/:userId/agendamentos" element={<ClientAppointments />} />
        <Route path="/b/:userId/agendar" element={<ClientBooking />} />
        <Route path="/b/:userId/perfil" element={<ClientProfile />} />
        <Route path="/b/:userId/historico" element={<ClientHistory />} />
        <Route path="/b/:userId/fidelidade" element={<ClientLoyalty />} />
        <Route path="/b/:userId/pagamentos" element={<ClientPayments />} />
        <Route path="/b/:userId" element={<Navigate to="login" replace />} />

        {/* Rota Pública Legacy */}
        <Route path="/public-booking/:userId/*" element={<PublicBookingPage />} />

        {/* Páginas públicas */}
        <Route path="/cadastro" element={<SignupPage />} />
        <Route path="/vendas" element={<SalesPage />} />

        {/* Dashboard - Admin vê completo, Barbeiro vê simplificado */}
        <Route path="/" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Dashboard /></ProtectedRoute>} />
        <Route path="/barber-dashboard" element={<ProtectedRoute allowedRoles={['barbeiro']}><BarberDashboard /></ProtectedRoute>} />

        {/* Rotas compartilhadas: Admin + Barbeiro */}
        <Route path="/appointments" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Appointments /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Clients /></ProtectedRoute>} />
        <Route path="/conversations" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Conversations /></ProtectedRoute>} />
        <Route path="/advanced-notifications" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><AdvancedNotifications /></ProtectedRoute>} />
        <Route path="/team-chat" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><TeamChat /></ProtectedRoute>} />
        <Route path="/shifts" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Shifts /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Profile /></ProtectedRoute>} />

        {/* Rotas exclusivas do Admin */}
        <Route path="/customer-success" element={<ProtectedRoute allowedRoles={['admin']}><CustomerSuccess /></ProtectedRoute>} />
        <Route path="/barber-performance" element={<ProtectedRoute allowedRoles={['admin']}><BarberPerformance /></ProtectedRoute>} />
        <Route path="/barbers" element={<ProtectedRoute allowedRoles={['admin']}><BarberManagement /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute allowedRoles={['admin']}><Services /></ProtectedRoute>} />
        <Route path="/waitlist" element={<ProtectedRoute allowedRoles={['admin']}><Waitlist /></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute allowedRoles={['admin']}><Campaigns /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute allowedRoles={['admin']}><Billing /></ProtectedRoute>} />
        <Route path="/commissions" element={<ProtectedRoute allowedRoles={['admin']}><Commissions /></ProtectedRoute>} />
        <Route path="/coupons" element={<ProtectedRoute allowedRoles={['admin']}><Coupons /></ProtectedRoute>} />
        <Route path="/gift-cards" element={<ProtectedRoute allowedRoles={['admin']}><GiftCards /></ProtectedRoute>} />
        <Route path="/dynamic-pricing" element={<ProtectedRoute allowedRoles={['admin']}><DynamicPricing /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><Subscriptions /></ProtectedRoute>} />
        <Route path="/subscriptions/new" element={<ProtectedRoute allowedRoles={['admin']}><SubscriptionCreation /></ProtectedRoute>} />
        <Route path="/loyalty" element={<ProtectedRoute allowedRoles={['admin']}><Loyalty /></ProtectedRoute>} />
        <Route path="/referrals" element={<ProtectedRoute allowedRoles={['admin']}><Referrals /></ProtectedRoute>} />
        <Route path="/settings/company" element={<ProtectedRoute allowedRoles={['admin']}><CompanySettings /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute allowedRoles={['admin']}><Inventory /></ProtectedRoute>} />
        <Route path="/gallery" element={<ProtectedRoute allowedRoles={['admin']}><Gallery /></ProtectedRoute>} />
        <Route path="/integrations" element={<ProtectedRoute allowedRoles={['admin']}><Integrations /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute allowedRoles={['admin']}><Reviews /></ProtectedRoute>} />
        <Route path="/commission-rules" element={<ProtectedRoute allowedRoles={['admin']}><CommissionRules /></ProtectedRoute>} />
        <Route path="/booking" element={<ProtectedRoute allowedRoles={['admin']}><OnlineBooking /></ProtectedRoute>} />
        <Route path="/upgrade" element={<ProtectedRoute allowedRoles={['admin']}><Upgrade /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
        <Route path="/cash" element={<ProtectedRoute allowedRoles={['admin']}><Cash /></ProtectedRoute>} />
        <Route path="/sales-reports" element={<ProtectedRoute allowedRoles={['admin']}><SalesReports /></ProtectedRoute>} />

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
            <RoleProvider>
              <AppContent />
              <Toaster />
              <Sonner />
            </RoleProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
