import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCw, ZoomIn, ZoomOut, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCropperDialogProps {
  imageFile: File;
  aspectRatio: number;
  onCropComplete: (croppedBlob: Blob) => void;
  onClose: () => void;
  isOpen: boolean;
}

// Função utilitária para criar o blob da imagem cortada
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed for cross-origin media
    image.src = url;
  });

async function getCroppedImage(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('2D context not available');
  }

  const { width: imageWidth, height: imageHeight } = image;
  const { width: cropWidth, height: cropHeight } = pixelCrop;

  // Set canvas size to match the crop size
  canvas.width = cropWidth;
  canvas.height = cropHeight;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error('Failed to create blob from canvas');
      }
    }, 'image/jpeg');
  });
}

const ImageCropperDialog: React.FC<ImageCropperDialogProps> = ({
  imageFile,
  aspectRatio,
  onCropComplete,
  onClose,
  isOpen,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const imageSrc = URL.createObjectURL(imageFile);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaChange = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImage(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
      onClose();
    } catch (e) {
      console.error(e);
      onClose();
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete, onClose]);

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl w-full h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ajustar Imagem</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative min-h-[400px] bg-muted rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={setRotation}
            onCropComplete={onCropAreaChange}
            objectFit="contain"
            showGrid={true}
            restrictPosition={false}
            classes={{
                containerClassName: "w-full h-full",
                mediaClassName: "w-full h-full",
            }}
          />
        </div>

        <div className="space-y-4 pt-4">
          {/* Zoom Control */}
          <div className="flex items-center gap-4">
            <ZoomOut className="h-5 w-5 text-muted-foreground" />
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(val) => setZoom(val[0])}
              className="flex-1"
            />
            <ZoomIn className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Rotation Control */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleRotate}>
              <RotateCw className="h-4 w-4 mr-2" />
              Girar
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar e Fazer Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropperDialog;