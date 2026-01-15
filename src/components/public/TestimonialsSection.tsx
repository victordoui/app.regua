import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: string;
  rating: number;
  comment: string | null;
  client?: { name: string } | null;
  created_at: string;
}

interface TestimonialsSectionProps {
  reviews: Testimonial[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ reviews }) => {
  // Only show reviews with 4+ stars and comments
  const testimonials = reviews
    .filter(r => r.rating >= 4 && r.comment)
    .slice(0, 6);

  if (testimonials.length === 0) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          O Que Nossos Clientes Dizem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full bg-muted/30 border-0">
                <CardContent className="p-4">
                  <Quote className="h-6 w-6 text-primary/30 mb-2" />
                  <p className="text-sm text-foreground mb-4 line-clamp-4">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {review.client?.name ? getInitials(review.client.name) : '??'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {review.client?.name || 'Cliente'}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsSection;
