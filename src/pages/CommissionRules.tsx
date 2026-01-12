import React from 'react';
import { ArrowLeft, PercentCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CommissionRulesManager from '@/components/commissions/CommissionRulesManager';
import { useAppointments } from '@/hooks/useAppointments';
import { useCommissionRules } from '@/hooks/useCommissionRules';

const CommissionRules: React.FC = () => {
  const navigate = useNavigate();
  const { barbers, services, isLoadingBarbers, isLoadingServices } = useAppointments();
  const { rules, isLoading: isLoadingRules } = useCommissionRules();

  const isLoading = isLoadingBarbers || isLoadingServices || isLoadingRules;

  // Get default rule if exists
  const defaultRule = rules.find(r => r.is_default);
  const specificRulesCount = rules.filter(r => !r.is_default).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/commissions')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Regras de Comissão</h1>
            <p className="text-muted-foreground">
              Configure comissões personalizadas por barbeiro e serviço
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Como funciona:</strong> As regras são aplicadas em ordem de prioridade:
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Regra específica para barbeiro + serviço (maior prioridade)</li>
              <li>Regra para barbeiro (qualquer serviço)</li>
              <li>Regra para serviço (qualquer barbeiro)</li>
              <li>Regra padrão (menor prioridade)</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Comissão Padrão</CardDescription>
              <CardTitle className="text-2xl">
                {defaultRule 
                  ? defaultRule.commission_type === 'percentage'
                    ? `${defaultRule.commission_value}%`
                    : `R$ ${defaultRule.commission_value.toFixed(2)}`
                  : '40%'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {defaultRule ? 'Configurada' : 'Valor padrão do sistema'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Regras Específicas</CardDescription>
              <CardTitle className="text-2xl">{specificRulesCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Para barbeiros ou serviços
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Barbeiros Ativos</CardDescription>
              <CardTitle className="text-2xl">{barbers.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Podem receber comissão
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rules Manager */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Carregando regras...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <CommissionRulesManager 
            barbers={barbers} 
            services={services} 
          />
        )}
      </div>
    </Layout>
  );
};

export default CommissionRules;
