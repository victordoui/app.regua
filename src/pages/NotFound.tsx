import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Search className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Erro 404</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Não encontramos esta página</h1>
        <p className="mt-2 text-sm text-muted-foreground">Confira o endereço ou volte para a página inicial do VIZZU.</p>
        <Button asChild className="mt-6">
          <Link to="/vendas"><ArrowLeft className="mr-2 h-4 w-4" />Ir para o início</Link>
        </Button>
      </div>
    </main>
  );
}
