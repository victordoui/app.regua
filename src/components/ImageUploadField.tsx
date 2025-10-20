import React, { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Upload, Loader2, Crop, X } from 'lucide-react';
import { toast } from 'sonner';

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

  React.useEffect(() => {
    setPreviewUrl(currentUrl);
  }, [currentUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file) {
      toast.error("Selecione um arquivo primeiro.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onUploadSuccess(url);
      toast.success(`${label} atualizado com sucesso!`);
      setFile(null); // Clear file after successful upload
    } catch (error: any) {
      toast.error(error.message || `Erro ao fazer upload do ${label}.`);
      setPreviewUrl(currentUrl); // Revert preview on error
    } finally {
      setIsUploading(false);
    }
  }, [file, folder, onUploadSuccess, uploadFile, label, currentUrl]);

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

  return (
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
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? "Enviando..." : "Fazer Upload"}
            </Button>
            
            {/* Placeholder para Ajuste/Crop */}
            <Button
              type="button"
              variant="outline"
              disabled={!previewUrl || isUploading}
              title="Funcionalidade de ajuste em desenvolvimento"
            >
              <Crop className="h-4 w-4" />
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
  );
};

export default ImageUploadField;