import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReviews } from '@/hooks/useReviews';
import StarRating from '@/components/reviews/StarRating';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star, Search, MessageSquare, TrendingUp, Users, Trash2, Loader2 } from 'lucide-react';

const Reviews = () => {
  const { reviews, stats, isLoading, deleteReview, isDeleting } = useReviews();
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = search === '' || 
      review.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
      review.comment?.toLowerCase().includes(search.toLowerCase());
    const matchesRating = filterRating === null || review.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const handleDelete = async (reviewId: string) => {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
      await deleteReview(reviewId);
    }
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
            <p className="text-muted-foreground">
              Gerencie as avaliações dos seus clientes
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Nota Média</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</span>
                <StarRating rating={stats.averageRating} size="sm" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total de Avaliações</span>
              </div>
              <p className="text-3xl font-bold mt-2">{stats.totalReviews}</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Distribuição de Notas</span>
              </div>
              <div className="space-y-2">
                {stats.ratingDistribution.reverse().map(({ rating, count }) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <Progress 
                      value={stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0} 
                      className="h-2 flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou comentário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterRating === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterRating(null)}
            >
              Todas
            </Button>
            {[5, 4, 3, 2, 1].map(rating => (
              <Button
                key={rating}
                variant={filterRating === rating ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
              >
                {rating}★
              </Button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle>Avaliações Recentes</CardTitle>
            <CardDescription>
              {filteredReviews.length} avaliação(ões) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma avaliação encontrada</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{review.client?.name || 'Cliente'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(review.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                            {review.comment && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                "{review.comment}"
                              </p>
                            )}
                            {review.barber && (
                              <Badge variant="outline" className="mt-2">
                                Barbeiro: {review.barber.display_name}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(review.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reviews;
