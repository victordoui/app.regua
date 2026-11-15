import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
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
const Login = lazy(() => import("./pages/Login"));
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
const Businesses = lazy(() => import("./pages/superadmin/Businesses"));
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
const PublicBookingRedirect = lazy(() => import("./pages/public/PublicBookingRedirect"));
const TVDisplay = lazy(() => import('./pages/TVDisplay'));
const TVSettings = lazy(() => import('./pages/TVSettings'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PublicPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const queryClient = new QueryClient();

function LegacyPublicBookingRedirect() {
  const { userId } = useParams<{ userId: string }>();
  return <Navigate to={userId ? `/b/${userId}/agendar` : "/login"} replace />;
}

function PublicBusinessBookingRedirect() {
  const { userId } = useParams<{ userId: string }>();
  return <Navigate to={userId ? `/b/${userId}/agendar` : "/login"} replace />;
}

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': { title: 'VIZZU — Gestão para barbearias e salões', description: 'Organize agendamentos, clientes, equipe e financeiro da sua barbearia ou salão com o VIZZU.' },
  '/vendas': { title: 'VIZZU — Gestão para barbearias e salões', description: 'Organize agendamentos, clientes, equipe e financeiro da sua barbearia ou salão. Teste grátis por 7 dias.' },
  '/login': { title: 'Entrar na sua conta | VIZZU', description: 'Acesse o VIZZU para gerenciar sua barbearia, salão ou agendamentos.' },
  '/cadastro': { title: 'Criar conta e testar grátis | VIZZU', description: 'Crie sua conta VIZZU e organize a agenda da sua barbearia ou salão.' },
  '/redefinir-senha': { title: 'Redefinir senha | VIZZU', description: 'Recupere seu acesso à plataforma VIZZU.' },
  '/onboarding': { title: 'Configurar meu negócio | VIZZU', description: 'Finalize a configuração da empresa, dos serviços e da agenda no VIZZU.' },
  '/dashboard': { title: 'Painel do negócio | VIZZU', description: 'Indicadores, agenda e resultados do seu negócio no VIZZU.' },
  '/dashboard/desempenho': { title: 'Desempenho | VIZZU', description: 'Acompanhe o desempenho da sua barbearia ou salão.' },
  '/dashboard/sucesso-cliente': { title: 'Sucesso do cliente | VIZZU', description: 'Acompanhe relacionamento e retorno dos clientes do seu negócio.' },
  '/barber-dashboard': { title: 'Meu desempenho | VIZZU', description: 'Consulte seus atendimentos, horários e ganhos como profissional.' },
  '/appointments': { title: 'Agenda | VIZZU', description: 'Gerencie os agendamentos da sua empresa no VIZZU.' },
  '/clients': { title: 'Clientes | VIZZU', description: 'Consulte clientes e histórico de atendimentos da empresa.' },
  '/conversations': { title: 'Conversas e comunicação | VIZZU', description: 'Acompanhe conversas, campanhas e comunicações com os clientes.' },
  '/profile': { title: 'Meu perfil | VIZZU', description: 'Atualize seus dados de acesso e informações do perfil VIZZU.' },
  '/barbers': { title: 'Profissionais | VIZZU', description: 'Gerencie a equipe de profissionais da sua empresa.' },
  '/services': { title: 'Serviços | VIZZU', description: 'Configure os serviços e preços da sua barbearia ou salão.' },
  '/reports': { title: 'Relatórios | VIZZU', description: 'Acompanhe receitas e resultados do seu negócio.' },
  '/billing': { title: 'Contas e despesas | VIZZU', description: 'Acompanhe as contas e movimentações financeiras do negócio.' },
  '/commissions': { title: 'Comissões | VIZZU', description: 'Consulte comissões, regras e valores da equipe profissional.' },
  '/coupons': { title: 'Promoções e cupons | VIZZU', description: 'Gerencie promoções, cupons e ofertas para os clientes.' },
  '/subscriptions': { title: 'Planos e assinaturas | VIZZU', description: 'Acompanhe planos e assinaturas de clientes do seu negócio.' },
  '/loyalty': { title: 'Fidelidade | VIZZU', description: 'Gerencie benefícios e ações de fidelidade para seus clientes.' },
  '/settings/company': { title: 'Minha empresa | VIZZU', description: 'Configure os dados, a identidade visual e o agendamento da empresa.' },
  '/upgrade': { title: 'Planos VIZZU | VIZZU', description: 'Compare os planos VIZZU e escolha os recursos para sua empresa.' },
  '/users': { title: 'Usuários da empresa | VIZZU', description: 'Gerencie os acessos e as permissões dos usuários da sua empresa.' },
  '/cash': { title: 'Caixa e PDV | VIZZU', description: 'Registre vendas e acompanhe o caixa do seu negócio.' },
  '/communication/tv': { title: 'Painel TV | VIZZU', description: 'Exiba informações da sua empresa na TV do estabelecimento.' },
  '/communication/tv/settings': { title: 'Configurações do Painel TV | VIZZU', description: 'Configure chamadas, anúncios e conteúdos exibidos na TV da empresa.' },
  '/superadmin': { title: 'Painel da plataforma | VIZZU', description: 'Acompanhe assinantes, conversões e indicadores da plataforma VIZZU.' },
  '/superadmin/users': { title: 'Usuários da plataforma | VIZZU', description: 'Pesquise e gerencie os usuários e assinaturas da plataforma VIZZU.' },
  '/superadmin/companies': { title: 'Empresas da plataforma | VIZZU', description: 'Consulte empresas, responsáveis, planos e acessos vinculados ao VIZZU.' },
  '/superadmin/metrics': { title: 'Métricas financeiras | VIZZU', description: 'Acompanhe receita recorrente, pagamentos e resultados financeiros do VIZZU.' },
  '/superadmin/subscribers': { title: 'Gestão de assinantes | VIZZU', description: 'Gerencie planos, períodos de teste e assinaturas das empresas.' },
  '/superadmin/expiring': { title: 'Assinaturas a vencer | VIZZU', description: 'Acompanhe empresas com assinaturas próximas do vencimento.' },
  '/superadmin/payments': { title: 'Histórico de pagamentos | VIZZU', description: 'Consulte os pagamentos e o histórico financeiro da plataforma.' },
  '/superadmin/coupons': { title: 'Cupons da plataforma | VIZZU', description: 'Gerencie cupons de desconto para os planos do VIZZU.' },
  '/superadmin/broadcast': { title: 'Mensagens da plataforma | VIZZU', description: 'Prepare comunicações para os assinantes do VIZZU.' },
  '/superadmin/templates': { title: 'Modelos de e-mail | VIZZU', description: 'Gerencie modelos usados nas comunicações da plataforma.' },
  '/superadmin/plans': { title: 'Planos e preços | VIZZU', description: 'Configure preços, limites e recursos dos planos VIZZU.' },
  '/superadmin/support': { title: 'Tickets de suporte | VIZZU', description: 'Acompanhe solicitações de suporte das empresas usuárias do VIZZU.' },
  '/superadmin/logs': { title: 'Logs de auditoria | VIZZU', description: 'Consulte o histórico de ações administrativas na plataforma.' },
};

const notFoundMetadata = {
  title: 'Página não encontrada | VIZZU',
  description: 'O endereço informado não corresponde a uma página do VIZZU.',
};

function getRouteMetadata(pathname: string) {
  const knownRoute = routeMetadata[pathname];
  if (knownRoute) return knownRoute;

  const clientPage = pathname.match(/^\/b\/[^/]+\/(login|cadastro|home|agendamentos|agendar|perfil|historico|fidelidade|pagamentos)$/)?.[1];
  if (clientPage) {
    const clientMetadata: Record<string, { title: string; description: string }> = {
      login: { title: 'Entrar para agendar | VIZZU', description: 'Acesse sua conta para acompanhar seus agendamentos nesta barbearia ou salão.' },
      cadastro: { title: 'Criar conta de cliente | VIZZU', description: 'Crie seu acesso para acompanhar os agendamentos e serviços desta empresa.' },
      home: { title: 'Meus agendamentos | VIZZU', description: 'Acompanhe seus próximos horários e serviços no VIZZU.' },
      agendamentos: { title: 'Meus agendamentos | VIZZU', description: 'Consulte e gerencie seus horários agendados.' },
      agendar: { title: 'Agendar horário | VIZZU', description: 'Escolha um serviço e um horário em uma barbearia ou salão.' },
      perfil: { title: 'Meu perfil de cliente | VIZZU', description: 'Atualize seus dados de contato para os agendamentos.' },
      historico: { title: 'Histórico de atendimentos | VIZZU', description: 'Consulte seus atendimentos anteriores nesta empresa.' },
      fidelidade: { title: 'Minha fidelidade | VIZZU', description: 'Consulte seus pontos e benefícios de fidelidade.' },
      pagamentos: { title: 'Meus pagamentos | VIZZU', description: 'Consulte seus pagamentos relacionados aos atendimentos.' },
    };
    return clientMetadata[clientPage];
  }

  if (/^\/b\/[^/]+$/.test(pathname) || /^\/public-booking\/[^/]+(?:\/.*)?$/.test(pathname)
    || /^\/(?:s|agendamento)\/[^/]+(?:\/.*)?$/.test(pathname)) {
    return { title: 'Agendamento online | VIZZU', description: 'Agende serviços em barbearias e salões pelo VIZZU.' };
  }

  if (/^\/superadmin\/support\/[^/]+$/.test(pathname)) {
    return { title: 'Detalhes do suporte | VIZZU', description: 'Consulte os detalhes de uma solicitação de suporte.' };
  }

  return notFoundMetadata;
}

function RouteMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = getRouteMetadata(pathname);
    const origin = window.location.origin;
    const imageUrl = new URL('/og-vizzu.png', origin).href;
    const canonicalUrl = new URL(pathname, origin).href;

    document.title = metadata.title;
    const setMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = content;
    };
    setMeta('meta[name="description"]', 'name', 'description', metadata.description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', metadata.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', metadata.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    setMeta('meta[property="og:image:type"]', 'property', 'og:image:type', 'image/png');
    setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
    setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', metadata.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', metadata.description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    setMeta('meta[name="robots"]', 'name', 'robots', pathname === '/' || pathname === '/vendas' ? 'index,follow' : 'noindex,follow');

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [pathname]);

  return null;
}

function AppContent() {
  return (
    <BrowserRouter>
      <RouteMetadata />
      <Suspense fallback={<PublicPageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        {/* Super Admin Routes */}
        <Route path="/superadmin" element={<ProtectedRoute requiredRole="super_admin"><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/users" element={<ProtectedRoute requiredRole="super_admin"><SystemUsers /></ProtectedRoute>} />
        <Route path="/superadmin/companies" element={<ProtectedRoute requiredRole="super_admin"><Businesses /></ProtectedRoute>} />
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
        <Route path="/b/:userId" element={<PublicBusinessBookingRedirect />} />

        {/* Rota pública antiga: encaminha para o fluxo multiempresa atual. */}
        <Route path="/public-booking/:userId/*" element={<LegacyPublicBookingRedirect />} />
        <Route path="/s/:businessSlug/*" element={<PublicBookingRedirect />} />
        <Route path="/agendamento/:businessSlug/*" element={<PublicBookingRedirect />} />

        {/* Páginas públicas */}
        <Route path="/cadastro" element={<Suspense fallback={<PublicPageLoader />}><SignupPage /></Suspense>} />
        <Route path="/vendas" element={<Suspense fallback={<PublicPageLoader />}><SalesPage /></Suspense>} />

        {/* Dashboard - Admin vê completo, Barbeiro vê simplificado */}
        <Route path="/" element={<Navigate to="/vendas" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/desempenho" element={<ProtectedRoute allowedRoles={['admin']}><DashboardPerformance /></ProtectedRoute>} />
        <Route path="/dashboard/sucesso-cliente" element={<ProtectedRoute allowedRoles={['admin']}><DashboardCustomerSuccess /></ProtectedRoute>} />
        <Route path="/barber-dashboard" element={<ProtectedRoute allowedRoles={['barbeiro']}><BarberDashboard /></ProtectedRoute>} />

        {/* Rotas compartilhadas: Admin + Barbeiro */}
        <Route path="/appointments" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Appointments /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Clients /></ProtectedRoute>} />
        <Route path="/conversations" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Conversations /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin', 'barbeiro']}><Profile /></ProtectedRoute>} />

        {/* Rotas exclusivas do Admin */}
        <Route path="/communication/tv" element={<ProtectedRoute allowedRoles={['admin']}><TVDisplay /></ProtectedRoute>} />
        <Route path="/communication/tv/settings" element={<ProtectedRoute allowedRoles={['admin']}><TVSettings /></ProtectedRoute>} />
        <Route path="/barbers" element={<ProtectedRoute allowedRoles={['admin']}><BarberManagement /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute allowedRoles={['admin']}><Services /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute allowedRoles={['admin']}><Billing /></ProtectedRoute>} />
        <Route path="/commissions" element={<ProtectedRoute allowedRoles={['admin']}><Commissions /></ProtectedRoute>} />
        <Route path="/coupons" element={<ProtectedRoute allowedRoles={['admin']}><Coupons /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><Subscriptions /></ProtectedRoute>} />
        <Route path="/loyalty" element={<ProtectedRoute allowedRoles={['admin']}><Loyalty /></ProtectedRoute>} />
        <Route path="/settings/company" element={<ProtectedRoute allowedRoles={['admin']}><CompanySettings /></ProtectedRoute>} />
        <Route path="/upgrade" element={<ProtectedRoute allowedRoles={['admin']} skipSubscriptionCheck><Upgrade /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="/cash" element={<ProtectedRoute allowedRoles={['admin']}><Cash /></ProtectedRoute>} />

        {/* Redirects for removed/consolidated routes */}
        <Route path="/subscriptions/new" element={<Navigate to="/subscriptions" replace />} />
        <Route path="/referrals" element={<Navigate to="/loyalty" replace />} />
        <Route path="/commission-rules" element={<Navigate to="/commissions" replace />} />
        <Route path="/sales-reports" element={<Navigate to="/reports" replace />} />
        <Route path="/integrations" element={<Navigate to="/dashboard" replace />} />
        <Route path="/settings" element={<Navigate to="/settings/company" replace />} />
        <Route path="/booking" element={<Navigate to="/appointments" replace />} />
        <Route path="/campaigns" element={<Navigate to="/conversations" replace />} />
        <Route path="/advanced-notifications" element={<Navigate to="/conversations?tab=notificacoes" replace />} />
        <Route path="/team-chat" element={<Navigate to="/conversations?tab=conversas" replace />} />
        <Route path="/gift-cards" element={<Navigate to="/coupons?tab=gift-cards" replace />} />
        <Route path="/dynamic-pricing" element={<Navigate to="/coupons?tab=precos" replace />} />
        <Route path="/inventory" element={<Navigate to="/settings/company?tab=estoque" replace />} />
        <Route path="/gallery" element={<Navigate to="/settings/company?tab=galeria" replace />} />
      <Route path="/customer-success" element={<Navigate to="/dashboard/sucesso-cliente" replace />} />
        <Route path="/barber-performance" element={<Navigate to="/dashboard" replace />} />
        <Route path="/reviews" element={<Navigate to="/dashboard" replace />} />
        <Route path="/waitlist" element={<Navigate to="/appointments?tab=espera" replace />} />
        <Route path="/shifts" element={<Navigate to="/appointments?tab=turnos" replace />} />

        {/* Rota de fallback */}
        <Route path="*" element={<Suspense fallback={<PublicPageLoader />}><NotFound /></Suspense>} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function App() {
  useEffect(() => {
    const getFieldMessage = (field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
      const validity = field.validity;
      if (validity.valueMissing) return 'Preencha este campo.';
      if (validity.typeMismatch && field instanceof HTMLInputElement && field.type === 'email') return 'Informe um e-mail válido.';
      if (validity.tooShort && field instanceof HTMLInputElement || validity.tooShort && field instanceof HTMLTextAreaElement) return `Informe pelo menos ${field.minLength} caracteres.`;
      if (validity.tooLong && field instanceof HTMLInputElement || validity.tooLong && field instanceof HTMLTextAreaElement) return `Use no máximo ${field.maxLength} caracteres.`;
      if (validity.patternMismatch) return 'Use o formato indicado para este campo.';
      if (validity.rangeUnderflow && field instanceof HTMLInputElement) return `Informe um valor igual ou maior que ${field.min}.`;
      if (validity.rangeOverflow && field instanceof HTMLInputElement) return `Informe um valor igual ou menor que ${field.max}.`;
      if (validity.stepMismatch || validity.badInput) return 'Verifique o valor informado.';
      return field.validationMessage || 'Verifique este campo.';
    };
    const handleInvalid = (event: Event) => {
      const field = event.target;
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.setCustomValidity(getFieldMessage(field));
      }
    };
    const clearCustomValidity = (event: Event) => {
      const field = event.target;
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.setCustomValidity('');
      }
    };

    document.addEventListener('invalid', handleInvalid, true);
    document.addEventListener('input', clearCustomValidity, true);
    document.addEventListener('change', clearCustomValidity, true);
    return () => {
      document.removeEventListener('invalid', handleInvalid, true);
      document.removeEventListener('input', clearCustomValidity, true);
      document.removeEventListener('change', clearCustomValidity, true);
    };
  }, []);

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
