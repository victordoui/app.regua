import React, { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Upload, Loader2, Crop, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageCropperDialog from './ImageCropperDialog'; // Importando o novo componente

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
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [fileToCrop, setFileToCrop] = useState<File | null>(null);

  React.useEffect(() => {
    setPreviewUrl(currentUrl);
  }, [currentUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFileToCrop(selectedFile);
      setIsCropperOpen(true);
      e.target.value = ''; // Clear input so same file can be selected again
    }
  };

  const handleCropComplete = useCallback(async (croppedBlob: Blob) => {
    // Convert Blob back to File for upload
    const croppedFile = new File([croppedBlob], fileToCrop?.name || 'cropped_image.jpg', {
      type: croppedBlob.type,
    });
    
    setFile(croppedFile);
    setPreviewUrl(URL.createObjectURL(croppedFile));
    setFileToCrop(null);
    
    // Automatically trigger upload after crop
    await handleUpload(croppedFile);
  }, [fileToCrop, folder, onUploadSuccess, uploadFile, label, currentUrl]);


  const handleUpload = useCallback(async (fileToUpload: File) => {
    setIsUploading(true);
    try {
      const url = await uploadFile(fileToUpload, folder);
      onUploadSuccess(url);
      toast.success(`${label} atualizado com sucesso!`);
      setFile(null); // Clear file after successful upload
    } catch (error: any) {
      toast.error(error.message || `Erro ao fazer upload do ${label}.`);
      setPreviewUrl(currentUrl); // Revert preview on error
    } finally {
      setIsUploading(false);
    }
  }, [folder, onUploadSuccess, uploadFile, label, currentUrl]);


  const handleRemove = () => {
    onUploadSuccess('');
    setFile(null);
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

            {/* Upload Input */}
            <div className="flex items-center gap-2">
              <Input
                id={`upload-${folder}`}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1"
                disabled={isUploading}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-border">
              {/* O botão de upload automático foi removido, pois o upload ocorre após o crop */}
              
              {/* Botão de Ajuste/Crop - Abre o modal se houver uma imagem atual */}
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                    if (currentUrl) {
                        // Se já houver uma URL, precisamos buscar o arquivo para cortar
                        toast.info("Funcionalidade de re-corte de URL existente em desenvolvimento.");
                        // Para simplificar, vamos apenas abrir o cropper se um novo arquivo foi selecionado
                    } else if (fileToCrop) {
                        setIsCropperOpen(true);
                    } else {
                        toast.info("Selecione um arquivo para ajustar.");
                    }
                }}
                disabled={isUploading}
              >
                <Crop className="h-4 w-4 mr-2" />
                Ajustar Posição
              </Button>

              {previewUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
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