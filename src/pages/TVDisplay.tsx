import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTVDisplay } from '@/hooks/useTVDisplay';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { Button } from '@/components/ui/button';
import { validTVImage } from '@/lib/tvDisplay';

export default function TVDisplay() {
  const { data, error, isLoading } = useTVDisplay();
  const { settings } = useCompanySettings();
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(new Date());
  const [paused, setPaused] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const slides = data?.slides.filter(s => s.enabled) || [];
  const slide = slides[index % (slides.length || 1)];
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (!slide || paused) return; const timer = setTimeout(() => setIndex(i => i + 1), Math.max(5, Math.min(300, slide.seconds)) * 1000); return () => clearTimeout(timer); }, [slide, paused, index]);
  return <main className="flex min-h-screen flex-col bg-slate-950 text-white">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-6 md:px-10">
      <div className="flex items-center gap-4">{settings?.logo_url && <img src={settings.logo_url} alt="" className="h-16 w-16 rounded-2xl bg-white object-contain" />}<div><p className="text-xl font-bold">{settings?.company_name || 'Seu estabelecimento'}</p><p className="text-sm text-blue-200">{data?.headline}</p>{slide && <p className="mt-1 text-xs text-slate-400">Inserção {(index % slides.length) + 1} de {slides.length} · {slide.seconds}s{paused ? " · pausada" : ""}</p>}</div></div>
      <div className="text-right"><p className="text-3xl font-bold tabular-nums">{now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p><p className="text-sm text-slate-400">{now.toLocaleDateString('pt-BR')}</p></div>
    </header>
    <section aria-live="polite" className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center md:p-10">
      {isLoading ? <p>Carregando programação…</p> : error ? <p role="alert">Não foi possível carregar a programação. Atualize a página.</p> : <>
        <div className={`grid w-full items-center gap-8 ${slide?.imageUrl ? 'md:grid-cols-2' : ''}`}>
          {slide?.imageUrl && validTVImage(slide.imageUrl) && <img key={slide.id} src={slide.imageUrl} alt={slide.title} className="mx-auto max-h-[55vh] max-w-full rounded-2xl object-contain" />}
          <div className="space-y-6"><h1 className="mx-auto max-w-5xl break-words text-4xl font-extrabold tracking-tight md:text-5xl">{slide?.title || data?.headline || 'Seja bem-vindo!'}</h1><p className="mx-auto max-w-4xl whitespace-pre-wrap break-words text-xl leading-relaxed text-slate-300 md:text-2xl">{slide?.message || settings?.slogan || 'É um prazer receber você.'}</p></div>
        </div>
      </>}
    </section>
    <footer className="border-t border-white/10 bg-blue-950/60 p-5 text-center text-xl">{data?.ticker}</footer>
    {presentation ? <button className="fixed bottom-2 right-2 rounded-lg bg-slate-900/80 px-3 py-2 text-xs text-white opacity-40 hover:opacity-100 focus:opacity-100" onClick={() => setPresentation(false)}>Mostrar controles</button> : <nav aria-label="Controles da TV" className="flex flex-wrap justify-center gap-2 p-3 [&_button]:bg-white/10 [&_button]:text-white [&_button:hover]:bg-white/20 [&_a]:bg-white/10 [&_a]:text-white"><Button variant="secondary" onClick={() => setPaused(p => !p)}>{paused ? 'Continuar' : 'Pausar'}</Button><Button variant="secondary" disabled={!slides.length} onClick={() => setIndex(i => i + 1)}>Próximo</Button><Button variant="secondary" onClick={() => setPresentation(true)}>Modo apresentação</Button><Button variant="secondary" onClick={async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { /* Browser may not support fullscreen. */ } }}>Tela cheia</Button><Button variant="secondary" asChild><Link to="/communication/tv/settings">Configurar</Link></Button></nav>}
  </main>;
}
