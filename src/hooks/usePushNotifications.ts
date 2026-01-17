import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// VAPID public key - should be set via environment or fetched from server
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Get existing subscription on mount
  useEffect(() => {
    if (!isSupported) return;
    
    const getExistingSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        setSubscription(existingSubscription);
      } catch (error) {
        console.error('Error getting existing subscription:', error);
      }
    };

    getExistingSubscription();
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: 'Não suportado',
        description: 'Notificações push não são suportadas neste navegador',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({ title: 'Notificações ativadas!' });
        return true;
      } else if (result === 'denied') {
        toast({
          title: 'Permissão negada',
          description: 'Você pode ativar as notificações nas configurações do navegador',
          variant: 'destructive',
        });
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }, [isSupported, toast]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || !user?.id) {
      return null;
    }

    setIsLoading(true);
    
    try {
      // First, request permission if not granted
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return null;
        }
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });

      setSubscription(pushSubscription);

      // Save subscription to database
      const subscriptionJson = pushSubscription.toJSON();
      
      // Check if record exists first
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const subscriptionData = JSON.parse(JSON.stringify(subscriptionJson));
      
      let error;
      if (existing) {
        const result = await supabase
          .from('notification_preferences')
          .update({
            push_enabled: true,
            push_subscription: subscriptionData,
          })
          .eq('user_id', user.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('notification_preferences')
          .insert([{
            user_id: user.id,
            push_enabled: true,
            push_subscription: subscriptionData,
          }]);
        error = result.error;
      }

      if (error) {
        console.error('Error saving subscription:', error);
        throw error;
      }

      toast({ title: 'Notificações push ativadas!' });
      setIsLoading(false);
      return pushSubscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: 'Erro ao ativar notificações',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      setIsLoading(false);
      return null;
    }
  }, [isSupported, user?.id, permission, requestPermission, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription || !user?.id) {
      return false;
    }

    setIsLoading(true);

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Update database
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          push_enabled: false,
          push_subscription: null,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating preferences:', error);
      }

      toast({ title: 'Notificações push desativadas' });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Erro ao desativar notificações',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  }, [subscription, user?.id, toast]);

  // Send a test notification
  const sendTestNotification = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      toast({
        title: 'Permissão necessária',
        description: 'Ative as notificações primeiro',
        variant: 'destructive',
      });
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Teste de Notificação', {
        body: 'Esta é uma notificação de teste do Na Régua!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
      });
      toast({ title: 'Notificação de teste enviada!' });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Erro ao enviar notificação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  }, [isSupported, permission, toast]);

  return {
    permission,
    subscription,
    isSupported,
    isLoading,
    isSubscribed: !!subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}
