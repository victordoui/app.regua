import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCircle, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { useMySubscription } from '@/hooks/useMySubscription';
import SubscriptionInfoCard from '@/components/subscriptions/SubscriptionInfoCard';
import { PageContainer, PageHeader } from '@/components/ui/workspace-page';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const { user } = useAuth();
  const { isBarbeiro } = useRole();
  const subscriptionData = useMySubscription();

  const userName = user?.user_metadata?.full_name || user?.email || 'Usuário';
  const userEmail = user?.email || '';
  const userPhone = user?.user_metadata?.phone || '';

  const getInitials = () => {
    if (!user?.user_metadata?.full_name) {
      return user?.email?.charAt(0).toUpperCase() || 'U';
    }
    return user.user_metadata.full_name
      .split(' ')
      .map((w: string) => w.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader eyebrow="Minha conta" icon={<UserCircle className="h-5 w-5" />} title="Meu Perfil" subtitle={isBarbeiro ? "Consulte os dados do seu acesso profissional" : "Consulte seus dados pessoais e sua assinatura"} />

        {/* Personal Data */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.8fr)]"><Card className="overflow-hidden rounded-[20px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCircle className="h-5 w-5 text-primary" />
                Dados Pessoais
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-primary/[0.04] p-5">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold text-foreground">{userName}</p>
                <p className="text-sm text-muted-foreground">{isBarbeiro ? "Profissional" : "Administrador"}</p>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0"><p className="text-xs text-muted-foreground">E-mail de acesso</p><p className="break-all font-medium">{userEmail || 'Não informado'}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div><p className="text-xs text-muted-foreground">Telefone de contato</p><p className="font-medium">{userPhone || 'Não informado'}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        {!isBarbeiro && <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">Minha Assinatura</h2>
          {subscriptionData.isLoading ? (
            <Card>
              <CardContent className="py-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </CardContent>
            </Card>
          ) : (
            <SubscriptionInfoCard data={subscriptionData} />
          )}
          <Button variant="outline" className="w-full" asChild><Link to="/upgrade">Comparar planos do VIZZU</Link></Button>
        </div>}
        </div>
      </PageContainer>
    </Layout>
  );
};

export default Profile;
