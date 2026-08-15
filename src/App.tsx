import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import UpdateNotificationBanner from "@/components/UpdateNotificationBanner";

// Pages
import Login from "./pages/Login";
// Routes are loaded on demand so a client does not download the whole back office.
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Index"));
const BarberDashboard = lazy(() => import("./pages/BarberDashboard"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Clients = lazy(() => import("./pages/Clients"));
const BarberManagement = lazy(() => import("./pages/BarberManagement"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Conversations = lazy(() => import("./pages/Conversations"));
const Users = lazy(() => import("./pages/Users"));
const Reports = lazy(() => import("./pages/Reports"));
const Services = lazy(() => import("./pages/Services"));
const Billing = lazy(() => import("./pages/Billing"));
const Commissions = lazy(() => import("./pages/Commissions"));
const CompanySettings = lazy(() => import("./pages/CompanySettings"));
const Cash = lazy(() => import("./pages/Cash"));
const Loyalty = lazy(() => import("./pages/Loyalty"));
const Coupons = lazy(() => import("./pages/Coupons"));
const ClientHistory = lazy(() => import("./pages/client/ClientHistory"));
const ClientLoyalty = lazy(() => import("./pages/client/ClientLoyalty"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Profile = lazy(() => import("./pages/Profile"));
const DashboardPerformance = lazy(() => import("./pages/DashboardPerformance"));
const DashboardCustomerSuccess = lazy(() => import("./pages/DashboardCustomerSuccess"));
const SuperAdminDashboard = lazy(() => import("./pages/superadmin/SuperAdminDashboard"));
const SubscribersManagement = lazy(() => import("./pages/superadmin/SubscribersManagement"));
const PlatformCoupons = lazy(() => import("./pages/superadmin/PlatformCoupons"));
const AuditLogs = lazy(() => import("./pages/superadmin/AuditLogs"));
const FinancialMetrics = lazy(() => import("./pages/superadmin/FinancialMetrics"));
const ExpiringSubscriptions = lazy(() => import("./pages/superadmin/ExpiringSubscriptions"));
const PaymentHistory = lazy(() => import("./pages/superadmin/PaymentHistory"));
const BroadcastMessages = lazy(() => import("./pages/superadmin/BroadcastMessages"));
const EmailTemplates = lazy(() => import("./pages/superadmin/EmailTemplates"));
const PlanConfiguration = lazy(() => import("./pages/superadmin/PlanConfiguration"));
const SupportTickets = lazy(() => import("./pages/superadmin/SupportTickets"));
const TicketDetail = lazy(() => import("./pages/superadmin/TicketDetail"));
const SystemUsers = lazy(() => import("./pages/superadmin/SystemUsers"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const ClientLogin = lazy(() => import("./pages/client/ClientLogin"));
const ClientRegister = lazy(() => import("./pages/client/ClientRegister"));
const ClientPayments = lazy(() => import("./pages/client/ClientPayments"));
const ClientHome = lazy(() => import("./pages/client/ClientHome"));
const ClientAppointments = lazy(() => import("./pages/client/ClientAppointments"));
const ClientBooking = lazy(() => import("./pages/client/ClientBooking"));
const ClientProfile = lazy(() => import("./pages/client/ClientProfile"));
const SignupPage = lazy(() => import("./pages/public/SignupPage"));
const SalesPage = lazy(() => import("./pages/public/SalesPage"));
const PublicPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const queryClient = new QueryClient();

function LegacyPublicBookingRedirect() {
  const { userId } = useParams<{ userId: string }>();
  return <Navigate to={userId ? `/b/${userId}/login` : "/login"} replace />;
}

function AppContent() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PublicPageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />
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

        {/* Rota pública antiga: encaminha para o fluxo multiempresa atual. */}
        <Route path="/public-booking/:userId/*" element={<LegacyPublicBookingRedirect />} />

        {/* Páginas públicas */}
        <Route path="/cadastro" element={<Suspense fallback={<PublicPageLoader />}><SignupPage /></Suspense>} />
        <Route path="/vendas" element={<Suspense fallback={<PublicPageLoader />}><SalesPage /></Suspense>} />

        {/* Dashboard - Admin vê completo, Barbeiro vê simplificado */}
        <Route path="/" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/desempenho" element={<ProtectedRoute allowedRoles={['admin']}><DashboardPerformance /></ProtectedRoute>} />
        <Route path="/dashboard/sucesso-cliente" element={<ProtectedRoute allowedRoles={['admin']}><DashboardCustomerSuccess /></ProtectedRoute>} />
        <Route path="/barber-dashboard" element={<ProtectedRoute allowedRoles={['barbeiro']}><BarberDashboard /></ProtectedRoute>} />

        {/* Rotas compartilhadas: Admin + Barbeiro */}
        <Route path="/appointments" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Appointments /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Clients /></ProtectedRoute>} />
        <Route path="/conversations" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Conversations /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Profile /></ProtectedRoute>} />

        {/* Rotas exclusivas do Admin */}
        <Route path="/barbers" element={<ProtectedRoute allowedRoles={['admin']}><BarberManagement /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute allowedRoles={['admin']}><Services /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute allowedRoles={['admin']}><Billing /></ProtectedRoute>} />
        <Route path="/commissions" element={<ProtectedRoute allowedRoles={['admin']}><Commissions /></ProtectedRoute>} />
        <Route path="/coupons" element={<ProtectedRoute allowedRoles={['admin']}><Coupons /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><Subscriptions /></ProtectedRoute>} />
        <Route path="/loyalty" element={<ProtectedRoute allowedRoles={['admin']}><Loyalty /></ProtectedRoute>} />
        <Route path="/settings/company" element={<ProtectedRoute allowedRoles={['admin']}><CompanySettings /></ProtectedRoute>} />
        <Route path="/upgrade" element={<ProtectedRoute allowedRoles={['admin']}><Upgrade /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="/cash" element={<ProtectedRoute allowedRoles={['admin']}><Cash /></ProtectedRoute>} />

        {/* Redirects for removed/consolidated routes */}
        <Route path="/subscriptions/new" element={<Navigate to="/subscriptions" replace />} />
        <Route path="/referrals" element={<Navigate to="/loyalty" replace />} />
        <Route path="/commission-rules" element={<Navigate to="/commissions" replace />} />
        <Route path="/sales-reports" element={<Navigate to="/reports" replace />} />
        <Route path="/integrations" element={<Navigate to="/" replace />} />
        <Route path="/settings" element={<Navigate to="/settings/company" replace />} />
        <Route path="/booking" element={<Navigate to="/appointments" replace />} />
        <Route path="/campaigns" element={<Navigate to="/conversations" replace />} />
        <Route path="/advanced-notifications" element={<Navigate to="/conversations?tab=notificacoes" replace />} />
        <Route path="/team-chat" element={<Navigate to="/conversations?tab=conversas" replace />} />
        <Route path="/gift-cards" element={<Navigate to="/coupons?tab=gift-cards" replace />} />
        <Route path="/dynamic-pricing" element={<Navigate to="/coupons?tab=precos" replace />} />
        <Route path="/inventory" element={<Navigate to="/settings/company?tab=estoque" replace />} />
        <Route path="/gallery" element={<Navigate to="/settings/company?tab=galeria" replace />} />
        <Route path="/customer-success" element={<Navigate to="/?tab=sucesso-cliente" replace />} />
        <Route path="/barber-performance" element={<Navigate to="/" replace />} />
        <Route path="/reviews" element={<Navigate to="/" replace />} />
        <Route path="/waitlist" element={<Navigate to="/appointments?tab=espera" replace />} />
        <Route path="/shifts" element={<Navigate to="/appointments?tab=turnos" replace />} />

        {/* Rota de fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
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
              <UpdateNotificationBanner />
            </RoleProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
