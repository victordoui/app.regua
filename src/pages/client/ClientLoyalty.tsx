import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Gift, Star, Trophy, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MobileLayout from '@/components/mobile/MobileLayout';
import { Button } from '@/components/ui/button';

interface BarbershopSettings {
  company_name: string;
  logo_url: string | null;
  banner_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
  slogan: string | null;
  address: string | null;
  phone: string | null;
}

interface LoyaltyData {
  points: number;
  tier: string;
  pointsToNextTier: number;
  history: Array<{
    id: string;
    points: number;
    type: string;
    description: string;
    created_at: string;
  }>;
}

const TIERS = [
  { name: 'Bronze', minPoints: 0, color: '#CD7F32' },
  { name: 'Prata', minPoints: 100, color: '#C0C0C0' },
  { name: 'Ouro', minPoints: 300, color: '#FFD700' },
  { name: 'Platina', minPoints: 600, color: '#E5E4E2' },
  { name: 'Diamante', minPoints: 1000, color: '#B9F2FF' }
];

const ClientLoyalty = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<BarbershopSettings | null>(null);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate(`/b/${userId}/login`);
        return;
      }

      // Fetch barbershop settings
      const { data: settingsData } = await supabase
        .from('barbershop_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsData) {
        setSettings(settingsData as BarbershopSettings);
      }

      // Fetch client profile with loyalty points
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id, loyalty_points')
        .eq('user_id', user.id)
        .single();

      if (clientProfile) {
        const points = clientProfile.loyalty_points || 0;
        
        // Calculate tier
        const currentTier = [...TIERS].reverse().find(t => points >= t.minPoints) || TIERS[0];
        const nextTier = TIERS.find(t => t.minPoints > points);
        const pointsToNext = nextTier ? nextTier.minPoints - points : 0;

        // Fetch loyalty history
        const { data: historyData } = await supabase
          .from('loyalty_transactions')
          .select('*')
          .eq('client_id', clientProfile.id)
          .order('created_at', { ascending: false })
          .limit(20);

        setLoyaltyData({
          points,
          tier: currentTier.name,
          pointsToNextTier: pointsToNext,
          history: historyData || []
        });
      } else {
        setLoyaltyData({
          points: 0,
          tier: 'Bronze',
          pointsToNextTier: 100,
          history: []
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Barbearia não encontrada</p>
        </Card>
      </div>
    );
  }

  const currentTierInfo = TIERS.find(t => t.name === loyaltyData?.tier) || TIERS[0];
  const nextTierInfo = TIERS.find(t => t.minPoints > (loyaltyData?.points || 0));
  const progressToNextTier = nextTierInfo 
    ? ((loyaltyData?.points || 0) - currentTierInfo.minPoints) / (nextTierInfo.minPoints - currentTierInfo.minPoints) * 100
    : 100;

  return (
    <MobileLayout settings={settings}>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/b/${userId}/home`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Fidelidade</h1>
            <p className="text-muted-foreground">Seus pontos e recompensas</p>
          </div>
        </div>

        {/* Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card 
            className="p-6 text-white rounded-2xl overflow-hidden relative"
            style={{ 
              background: `linear-gradient(135deg, ${settings.primary_color_hex}, ${settings.secondary_color_hex})` 
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Badge 
                  className="text-white border-white/30"
                  style={{ backgroundColor: currentTierInfo.color, color: '#000' }}
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  {loyaltyData?.tier}
                </Badge>
                <Heart className="h-6 w-6" />
              </div>
              
              <p className="text-4xl font-bold mb-1">{loyaltyData?.points || 0}</p>
              <p className="text-white/80">pontos acumulados</p>
              
              {nextTierInfo && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Próximo nível: {nextTierInfo.name}</span>
                    <span>{loyaltyData?.pointsToNextTier} pts</span>
                  </div>
                  <Progress value={progressToNextTier} className="h-2 bg-white/30" />
                </div>
              )}
            </div>
            <Star className="absolute right-4 bottom-4 h-24 w-24 text-white/10" />
          </Card>
        </motion.div>

        {/* Tiers */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Níveis de Fidelidade</h3>
          <div className="space-y-3">
            {TIERS.map((tier, index) => (
              <div 
                key={tier.name}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  loyaltyData?.tier === tier.name ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: tier.color }}
                >
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{tier.name}</p>
                  <p className="text-sm text-muted-foreground">{tier.minPoints}+ pontos</p>
                </div>
                {loyaltyData?.tier === tier.name && (
                  <Badge variant="secondary">Atual</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* How to Earn */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5" style={{ color: settings.primary_color_hex }} />
            Como Ganhar Pontos
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span>Cada R$ 1 gasto</span>
              <Badge variant="secondary">+1 ponto</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span>Indicar um amigo</span>
              <Badge variant="secondary">+50 pontos</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span>Avaliação 5 estrelas</span>
              <Badge variant="secondary">+10 pontos</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span>Aniversário</span>
              <Badge variant="secondary">+20 pontos</Badge>
            </div>
          </div>
        </Card>

        {/* History */}
        {loyaltyData?.history && loyaltyData.history.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Histórico de Pontos</h3>
            <div className="space-y-3">
              {loyaltyData.history.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant={item.points > 0 ? 'default' : 'secondary'}>
                    {item.points > 0 ? '+' : ''}{item.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default ClientLoyalty;
