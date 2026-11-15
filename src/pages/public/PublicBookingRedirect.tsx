import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const uuidPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

const PublicBookingRedirect = () => {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const resolveBusiness = async () => {
      if (!businessSlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const isId = uuidPattern.test(businessSlug);
      const { data, error } = await supabase
        .from('public_business_profile')
        .select('user_id')
        .eq(isId ? 'user_id' : 'share_slug', businessSlug)
        .maybeSingle();

      if (cancelled) return;
      if (error || !data?.user_id) {
        setNotFound(true);
      } else {
        navigate(`/b/${data.user_id}/agendar`, { replace: true });
      }
      setLoading(false);
    };

    void resolveBusiness();
    return () => { cancelled = true; };
  }, [businessSlug, navigate]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-xl font-bold">Barbearia não encontrada</h1>
          <p className="mt-2 text-muted-foreground">Confira o link ou peça um novo endereço ao estabelecimento.</p>
        </Card>
      </main>
    );
  }

  return null;
};

export default PublicBookingRedirect;
