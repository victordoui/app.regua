import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGallery } from '@/hooks/useGallery';
import { useBarbers } from '@/hooks/useBarbers';
import { useServices } from '@/hooks/useServices';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Image, Plus, Trash2, Loader2, Upload, X } from 'lucide-react';

const Gallery = () => {
  const { gallery, isLoading, uploadImage, addGalleryItem, deleteGalleryItem, isAdding, isDeleting } = useGallery();
  const { barbers } = useBarbers();
  const { services } = useServices();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', barber_id: '', service_id: '', image_url: '' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: url }));
      setPreviewUrl(URL.createObjectURL(file));
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.image_url) return;
    await addGalleryItem({
      image_url: formData.image_url,
      title: formData.title || undefined,
      description: formData.description || undefined,
      barber_id: formData.barber_id || undefined,
      service_id: formData.service_id || undefined
    });
    setDialogOpen(false);
    setFormData({ title: '', description: '', barber_id: '', service_id: '', image_url: '' });
    setPreviewUrl(null);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Galeria</h1>
            <p className="text-muted-foreground">Portfólio de trabalhos realizados</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Adicionar Foto</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Foto</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Imagem</Label>
                  {previewUrl ? (
                    <div className="relative mt-2">
                      <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <Button size="icon" variant="destructive" className="absolute top-2 right-2" onClick={() => { setPreviewUrl(null); setFormData(prev => ({ ...prev, image_url: '' })); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <><Upload className="h-8 w-8 text-muted-foreground" /><span className="text-sm text-muted-foreground mt-2">Clique para enviar</span></>}
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                    </label>
                  )}
                </div>
                <div><Label>Título</Label><Input value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} /></div>
                <div><Label>Descrição</Label><Textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Barbeiro</Label><Select value={formData.barber_id} onValueChange={v => setFormData(prev => ({ ...prev, barber_id: v }))}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.full_name || b.email}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Serviço</Label><Select value={formData.service_id} onValueChange={v => setFormData(prev => ({ ...prev, service_id: v }))}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <Button onClick={handleSubmit} disabled={!formData.image_url || isAdding} className="w-full">{isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : gallery.length === 0 ? (
          <Card className="min-h-[300px] flex items-center justify-center"><CardContent className="text-center p-8"><Image className="h-12 w-12 text-primary mx-auto mb-4" /><CardTitle>Galeria Vazia</CardTitle><p className="text-muted-foreground">Adicione fotos dos seus trabalhos.</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map(item => (
              <Card key={item.id} className="overflow-hidden group cursor-pointer" onClick={() => setLightboxImage(item.image_url)}>
                <div className="relative aspect-square">
                  <img src={item.image_url} alt={item.title || 'Galeria'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="icon" variant="destructive" onClick={(e) => { e.stopPropagation(); deleteGalleryItem(item.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                {(item.title || item.barber || item.service) && (
                  <CardContent className="p-3">
                    {item.title && <p className="font-medium truncate">{item.title}</p>}
                    <div className="flex gap-1 mt-1 flex-wrap">{item.barber && <Badge variant="outline" className="text-xs">{item.barber.display_name}</Badge>}{item.service && <Badge variant="secondary" className="text-xs">{item.service.name}</Badge>}</div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {lightboxImage && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxImage(null)}>
            <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-white" onClick={() => setLightboxImage(null)}><X className="h-6 w-6" /></Button>
            <img src={lightboxImage} alt="Lightbox" className="max-w-[90vw] max-h-[90vh] object-contain" />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Gallery;
