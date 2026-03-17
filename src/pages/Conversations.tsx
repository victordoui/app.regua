import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell, MessageCircle } from "lucide-react";
import ConversationsContent from "@/components/communication/ConversationsContent";
import NotificationsContent from "@/components/communication/NotificationsContent";
import TeamChatContent from "@/components/communication/TeamChatContent";

const Conversations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "conversas";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Comunicação</h1>
        </div>

        <Tabs value={defaultTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="conversas" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversas
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="chat-equipe" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat Equipe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversas">
            <ConversationsContent />
          </TabsContent>
          <TabsContent value="notificacoes">
            <NotificationsContent />
          </TabsContent>
          <TabsContent value="chat-equipe">
            <TeamChatContent />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Conversations;
