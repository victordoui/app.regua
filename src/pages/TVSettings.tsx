import { useEffect, useState } from 'react';
import { Monitor, Plus, Trash2, ExternalLink, Save } from 'lucide-react';
import Layout from '@/components/Layout';
import { PageContainer, PageHeader } from '@/components/ui/workspace-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useTVDisplay } from '@/hooks/useTVDisplay';
import { defaultTVConfig, validTVImage, type TVConfig, type TVSlide } from '@/lib/tvDisplay';
import { toast } from 'sonner';
import ImageUploadField from '@/components/ImageUploadField';
import { uploadFileToStorage } from '@/lib/supabaseStorage';

export default function TVSettings() {
  const { data, error, isLoading, save, isSaving, refetch } = useTVDisplay();
  const [draft, setDraft] = useState<TVConfig>(defaultTVConfig);
  const [dirty, setDirty] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const activeSlides = draft.slides.filter(slide => slide.enabled);
  const preview = draft.slides.find(slide => slide.id === previewId);
  const cycleSeconds = activeSlides.reduce((total, slide) => total + slide.seconds, 0);
  useEffect(() => { if (data && !dirty) setDraft(data); }, [data, dirty]);
  const change = (next: TVConfig) => { setDraft(next); setDirty(true); };
  const edit = (id: string, values: Partial<TVSlide>) => change({ ...draft, slides: draft.slides.map(s => s.id === id ? { ...s, ...values } : s) });
  const submit = async () => {
    if (draft.slides.some(s => !s.title.trim() || !validTVImage(s.imageUrl) || s.seconds < 5 || s.seconds > 300)) { toast.error('Preencha os títulos, use imagens HTTPS e tempos entre 5 e 300 segundos.'); return; }
    try { await save(draft); setDirty(false); toast.success('Programação da TV salva. A tela atualiza em até 30 segundos.'); } catch { toast.error('Não foi possível salvar a programação da TV.'); }
  };
  if (isLoading || error) return <Layout><PageContainer><PageHeader eyebrow="Comunicação" title="Configuração da TV" /><div role={error ? 'alert' : 'status'} className="rounded-2xl border p-6">{error ? 'Não foi possível carregar a configuração da TV.' : 'Carregando programação…'}{error && <Button className="ml-3" variant="outline" onClick={() => refetch()}>Tentar novamente</Button>}</div></PageContainer></Layout>;
  return <Layout><PageContainer>
    <PageHeader eyebrow="Comunicação" icon={<Monitor className="h-5 w-5" />} title="Configuração da TV" subtitle="Monte a programação de anúncios e avisos do seu estabelecimento.">
      <Button variant="outline" asChild><a href="/communication/tv" target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Abrir Painel TV</a></Button>
      <Button disabled={isLoading || !!error || isSaving} onClick={submit}><Save className="mr-2 h-4 w-4" />{isSaving ? 'Salvando…' : 'Salvar programação'}</Button>
    </PageHeader>
    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">Não foi possível carregar a configuração da TV. Tente novamente.</p>}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card><CardHeader><CardTitle className="text-lg">Identidade e avisos</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><Label htmlFor="tv-headline">Mensagem de boas-vindas</Label><Input id="tv-headline" maxLength={120} value={draft.headline} onChange={e => change({ ...draft, headline: e.target.value })} /></div>
          <div><Label htmlFor="tv-ticker">Aviso fixo no rodapé</Label><Textarea id="tv-ticker" maxLength={300} value={draft.ticker} onChange={e => change({ ...draft, ticker: e.target.value })} /></div>
        </CardContent></Card>
        <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Programação · {draft.slides.length} inserções</h2><Button variant="outline" disabled={draft.slides.length >= 30} onClick={() => change({ ...draft, slides: [...draft.slides, { id: crypto.randomUUID(), title: 'Novo anúncio', message: '', imageUrl: '', seconds: 15, enabled: true }] })}><Plus className="mr-2 h-4 w-4" />Adicionar</Button></div>
        {!draft.slides.length && <Card><CardContent className="py-10 text-center"><Monitor className="mx-auto mb-3 h-8 w-8 text-primary" /><p className="font-semibold">Sua TV, com a identidade do seu negócio</p><p className="mt-1 text-sm text-muted-foreground">Adicione promoções, imagens e chamadas. Sem inserções, a TV exibe as boas-vindas.</p></CardContent></Card>}
        {draft.slides.map((slide, index) => <Card key={slide.id}><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Inserção {index + 1}</CardTitle><div className="flex items-center gap-3"><Switch aria-label={`Ativar inserção ${index + 1}`} checked={slide.enabled} onCheckedChange={enabled => edit(slide.id, { enabled })} /><Button size="icon" variant="ghost" aria-label={`Excluir inserção ${index + 1}`} onClick={() => change({ ...draft, slides: draft.slides.filter(s => s.id !== slide.id) })}><Trash2 className="h-4 w-4" /></Button></div></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor={`title-${slide.id}`}>Título</Label><Input id={`title-${slide.id}`} maxLength={120} value={slide.title} onChange={e => edit(slide.id, { title: e.target.value })} /></div>
          <div><Label htmlFor={`time-${slide.id}`}>Tempo na tela (segundos)</Label><Input id={`time-${slide.id}`} type="number" min={5} max={300} value={slide.seconds} onChange={e => edit(slide.id, { seconds: Number(e.target.value) })} /></div>
          <div className="sm:col-span-2"><Label htmlFor={`message-${slide.id}`}>Texto do anúncio ou chamada</Label><Textarea id={`message-${slide.id}`} maxLength={500} value={slide.message} onChange={e => edit(slide.id, { message: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label htmlFor={`image-${slide.id}`}>Endereço da imagem (HTTPS, opcional)</Label><Input id={`image-${slide.id}`} type="url" placeholder="https://…" value={slide.imageUrl} onChange={e => edit(slide.id, { imageUrl: e.target.value })} /></div>
          <div className="sm:col-span-2"><ImageUploadField label={`Imagem da inserção ${index + 1}`} currentUrl={validTVImage(slide.imageUrl) ? slide.imageUrl : ''} folder="banners" aspectRatio="wide" onUploadSuccess={imageUrl => edit(slide.id, { imageUrl })} uploadFile={uploadFileToStorage} /><p className="mt-2 text-xs text-muted-foreground">Envie uma arte horizontal ou cole um endereço HTTPS acima. Depois salve a programação.</p></div>
          <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={index === 0} onClick={() => { const slides = [...draft.slides]; [slides[index - 1], slides[index]] = [slides[index], slides[index - 1]]; change({ ...draft, slides }); }}>Mover para cima</Button><Button size="sm" variant="outline" disabled={index === draft.slides.length - 1} onClick={() => { const slides = [...draft.slides]; [slides[index], slides[index + 1]] = [slides[index + 1], slides[index]]; change({ ...draft, slides }); }}>Mover para baixo</Button><Button size="sm" variant="secondary" onClick={() => setPreviewId(slide.id)}>Visualizar</Button></div>
        </CardContent></Card>)}
      </div>
      <aside className="space-y-4 self-start lg:sticky lg:top-6"><div className="rounded-2xl border bg-card p-5"><p className="text-sm font-semibold">Resumo da programação</p><div className="mt-4 grid grid-cols-2 gap-4"><div><p className="text-2xl font-bold tabular-nums">{activeSlides.length}</p><p className="text-xs text-muted-foreground">inserções ativas</p></div><div><p className="text-2xl font-bold tabular-nums">{cycleSeconds}s</p><p className="text-xs text-muted-foreground">por ciclo</p></div></div></div><Card><CardHeader><CardTitle className="text-lg">Como usar na TV</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p>1. Salve sua programação.</p><p>2. Abra o VIZZU no navegador da TV e entre com sua conta.</p><p>3. Acesse Painel TV e ative a tela cheia.</p><p>Os anúncios ativos alternam na ordem definida. A programação é sincronizada entre seus dispositivos.</p></CardContent></Card><div className="rounded-2xl bg-slate-950 p-6 text-white"><p className="text-xs uppercase tracking-widest text-blue-300">Prévia · {preview ? "inserção selecionada" : "boas-vindas"}</p>{preview?.imageUrl && validTVImage(preview.imageUrl) && <img className="mt-5 aspect-video w-full rounded-xl object-contain" src={preview.imageUrl} alt={preview.title} />}<h2 className="my-6 break-words text-2xl font-bold">{preview?.title || draft.headline || 'Seja bem-vindo!'}</h2>{preview?.message && <p className="mb-6 whitespace-pre-wrap break-words text-sm text-slate-300">{preview.message}</p>}<p className="border-t border-white/10 pt-4 text-sm text-slate-300">{draft.ticker}</p>{preview && <Button className="mt-4" variant="secondary" onClick={() => setPreviewId(null)}>Ver boas-vindas</Button>}</div>{dirty && <p className="text-sm text-amber-700">Há alterações ainda não salvas.</p>}</aside>
    </div>
  </PageContainer></Layout>;
}
