import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { MessageSquare, Bell } from "lucide-react";
import ConversationsContent from "@/components/communication/ConversationsContent";
import NotificationsContent from "@/components/communication/NotificationsContent";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { SectionTabsLayout } from "@/components/ui/section-tabs";

const communicationSections = [
  { value: "conversas", label: "Conversas", description: "Atendimento aos clientes", icon: MessageSquare },
  { value: "notificacoes", label: "Notificações", description: "Avisos e lembretes", icon: Bell },
] as const;

const Conversations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "conversas";

  return (
    <Layout>
      <PageContainer>
        <PageHeader eyebrow="Comunicação" icon={<MessageSquare className="h-5 w-5" />} title="Central de Comunicação" subtitle="Atenda clientes, acompanhe avisos e converse com sua equipe." />

        <Tabs value={defaultTab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <SectionTabsLayout items={communicationSections} navigationTitle="Como você quer se comunicar?">
            <TabsContent value="conversas" className="mt-0"><ConversationsContent /></TabsContent>
            <TabsContent value="notificacoes" className="mt-0"><NotificationsContent /></TabsContent>
          </SectionTabsLayout>
        </Tabs>
      </PageContainer>
    </Layout>
  );
};

export default Conversations;
