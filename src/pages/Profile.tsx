import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserCircle, Mail, Phone, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMySubscription } from '@/hooks/useMySubscription';
import SubscriptionInfoCard from '@/components/subscriptions/SubscriptionInfoCard';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const subscriptionData = useMySubscription();
  const navigate = useNavigate();

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
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground">Seus dados pessoais e informações da assinatura</p>
        </div>

        {/* Personal Data */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCircle className="h-5 w-5 text-primary" />
                Dados Pessoais
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold text-foreground">{userName}</p>
                <p className="text-sm text-muted-foreground">Administrador</p>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{userEmail || 'Não informado'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{userPhone || 'Não informado'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <div>
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
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
