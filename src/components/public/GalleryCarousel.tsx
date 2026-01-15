import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Camera } from 'lucide-react';

interface GalleryItem {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
}

interface GalleryCarouselProps {
  images: GalleryItem[];
}

const GalleryCarousel: React.FC<GalleryCarouselProps> = ({ images }) => {
  if (images.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Nossos Trabalhos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {images.map((item) => (
              <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className="relative group aspect-square rounded-lg overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title || 'Trabalho realizado'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {item.title && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-white/80 text-xs truncate">{item.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 3 && (
            <>
              <CarouselPrevious className="hidden md:flex -left-4" />
              <CarouselNext className="hidden md:flex -right-4" />
            </>
          )}
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default GalleryCarousel;
