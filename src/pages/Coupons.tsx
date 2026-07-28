import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Tag, Gift, TrendingUp } from 'lucide-react';
import CouponsContent from '@/components/promotions/CouponsContent';
import GiftCardsContent from '@/components/promotions/GiftCardsContent';
import DynamicPricingContent from '@/components/promotions/DynamicPricingContent';
import { PageContainer, PageHeader } from '@/components/ui/page-header';
import { SectionTabsLayout } from '@/components/ui/section-tabs';

const promotionSections = [
  { value: 'cupons', label: 'Cupons', description: 'Descontos promocionais', icon: Tag },
  { value: 'gift-cards', label: 'Vales-presente', description: 'Créditos para presentear', icon: Gift },
  { value: 'precos', label: 'Preços dinâmicos', description: 'Valores por horário', icon: TrendingUp },
] as const;

const Coupons = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "cupons";

  return (
    <Layout>
      <PageContainer>
        <PageHeader eyebrow="Financeiro" icon={<Tag className="h-5 w-5" />} title="Promoções" subtitle="Crie incentivos simples para atrair clientes e aumentar os agendamentos." />

        <Tabs value={defaultTab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <SectionTabsLayout items={promotionSections} navigationTitle="Qual promoção você quer gerenciar?">
            <TabsContent value="cupons" className="mt-0"><CouponsContent /></TabsContent>
            <TabsContent value="gift-cards" className="mt-0"><GiftCardsContent /></TabsContent>
            <TabsContent value="precos" className="mt-0"><DynamicPricingContent /></TabsContent>
          </SectionTabsLayout>
        </Tabs>
      </PageContainer>
    </Layout>
  );
};

export default Coupons;
