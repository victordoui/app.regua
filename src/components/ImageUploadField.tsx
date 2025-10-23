import React, { useState, useCallback, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Upload, Loader2, Crop, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageCropperDialog from './ImageCropperDialog';

interface ImageUploadFieldProps {
  label: string;
  currentUrl: string;
  folder: 'logos' | 'banners';
  onUploadSuccess: (url: string) => void;
  uploadFile: (file: File, folder: string) => Promise<string>;
  aspectRatio: 'square' | 'wide';
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  currentUrl,
  folder,
  onUploadSuccess,
  uploadFile,
  aspectRatio,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [fileToCrop, setFileToCrop] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreviewUrl(currentUrl);
  }, [currentUrl]);

  const handleUpload = useCallback(async (fileToUpload: File) => {
    setIsUploading(true);
    try {
      const url = await uploadFile(fileToUpload, folder);
      onUploadSuccess(url);
      toast.success(`${label} atualizado com sucesso!`);
    } catch (error: any) {
      console.error("Upload Error:", error);
      toast.error(error.message || `Erro ao fazer upload do ${label}. Verifique as permissões do Supabase Storage.`);
      setPreviewUrl(currentUrl);
    } finally {
      setIsUploading(false);
    }
  }, [folder, onUploadSuccess, uploadFile, label, currentUrl]);

  const handleCropComplete = useCallback(async (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], fileToCrop?.name || 'cropped_image.jpg', {
      type: croppedBlob.type,
    });
    
    setPreviewUrl(URL.createObjectURL(croppedFile));
    setFileToCrop(null);
    
    await handleUpload(croppedFile);
  }, [fileToCrop, handleUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFileToCrop(selectedFile);
      setIsCropperOpen(true);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    onUploadSuccess('');
    setPreviewUrl('');
    toast.info(`${label} removido.`);
  };

  const previewClasses = aspectRatio === 'square' 
    ? 'w-24 h-24 rounded-full' 
    : 'w-full h-32 rounded-lg';
  
  const objectFit = aspectRatio === 'square' ? 'object-cover' : 'object-cover';
  const cropAspectRatio = aspectRatio === 'square' ? 1 / 1 : 16 / 9;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`upload-${folder}`}>{label}</Label>
        
        <Card className="p-4">
          <CardContent className="p-0 space-y-3">
            {/* Preview Area */}
            <div className={`relative border-2 border-dashed p-2 flex items-center justify-center ${previewClasses} mx-auto`}>
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className={`${previewClasses} ${objectFit}`}
                />
              ) : (
                <Image className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            {/* Hidden Input */}
            <Input
              id={`upload-${folder}`}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              disabled={isUploading}
            />

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? "Carregando..." : "Selecionar Imagem"}
              </Button>

              {previewUrl && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        // Reabre o cropper com a imagem atual (se for um URL, precisa ser um File/Blob)
                        // Para simplificar, pedimos para o usuário selecionar novamente se quiser reajustar
                        toast.info("Selecione o arquivo novamente para reajustar.");
                        fileInputRef.current?.click();
                    }}
                    disabled={isUploading}
                  >
                    <Crop className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cropper Dialog */}
      {fileToCrop && isCropperOpen && (
        <ImageCropperDialog
          isOpen={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setFileToCrop(null);
          }}
          imageFile={fileToCrop}
          aspectRatio={cropAspectRatio}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
};

export default ImageUploadField;