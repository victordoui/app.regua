import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tag, Gift, TrendingUp } from 'lucide-react';
import CouponsContent from '@/components/promotions/CouponsContent';
import GiftCardsContent from '@/components/promotions/GiftCardsContent';
import DynamicPricingContent from '@/components/promotions/DynamicPricingContent';
import { PageHeader } from '@/components/ui/page-header';

const Coupons = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "cupons";

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <PageHeader icon={<Tag className="h-5 w-5" />} title="Promoções" subtitle="Cupons, gift cards e preços dinâmicos" />

        <Tabs value={defaultTab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <TabsList>
            <TabsTrigger value="cupons" className="flex items-center gap-2"><Tag className="h-4 w-4" />Cupons</TabsTrigger>
            <TabsTrigger value="gift-cards" className="flex items-center gap-2"><Gift className="h-4 w-4" />Gift Cards</TabsTrigger>
            <TabsTrigger value="precos" className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Preços Dinâmicos</TabsTrigger>
          </TabsList>
          <TabsContent value="cupons"><CouponsContent /></TabsContent>
          <TabsContent value="gift-cards"><GiftCardsContent /></TabsContent>
          <TabsContent value="precos"><DynamicPricingContent /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Coupons;
