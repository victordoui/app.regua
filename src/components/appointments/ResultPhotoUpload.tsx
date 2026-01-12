import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X, Loader2, Trash2 } from 'lucide-react';

interface ResultPhotoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  currentPhotoUrl?: string | null;
  onSuccess: (photoUrl: string | null) => void;
}

const ResultPhotoUpload: React.FC<ResultPhotoUploadProps> = ({
  isOpen,
  onClose,
  appointmentId,
  currentPhotoUrl,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${appointmentId}-${Date.now()}.${fileExt}`;
      const filePath = `results/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('appointment-photos')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('appointment-photos')
        .getPublicUrl(filePath);

      // Update appointment with photo URL
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ result_photo_url: publicUrl })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      toast({ title: "Foto salva com sucesso!" });
      onSuccess(publicUrl);
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar foto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPhotoUrl) return;

    setDeleting(true);
    try {
      // Extract file path from URL
      const urlParts = currentPhotoUrl.split('/');
      const filePath = urlParts.slice(-2).join('/');

      // Delete from storage
      await supabase.storage
        .from('appointment-photos')
        .remove([filePath]);

      // Update appointment
      const { error } = await supabase
        .from('appointments')
        .update({ result_photo_url: null })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({ title: "Foto removida com sucesso" });
      onSuccess(null);
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao remover foto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleClearPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(currentPhotoUrl || null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto do Resultado
          </DialogTitle>
          <DialogDescription>
            Adicione uma foto do resultado do atendimento para o histórico do cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              {selectedFile && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleClearPreview}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Arraste uma imagem ou clique para selecionar
              </p>
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Imagem
                  </span>
                </Button>
              </Label>
            </div>
          )}

          <Input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {!previewUrl && (
            <Label htmlFor="photo-upload" className="w-full">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Imagem
                </span>
              </Button>
            </Label>
          )}

          <div className="flex gap-2">
            {currentPhotoUrl && !selectedFile && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Remover Foto
              </Button>
            )}
            
            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Salvar Foto
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultPhotoUpload;
