import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Bell, CheckCircle, Trash2, Phone, MessageCircle } from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { WaitlistItem } from '@/hooks/useWaitlist';

interface WaitlistCardProps {
  item: WaitlistItem;
  onNotify: () => void;
  onConvert: () => void;
  onRemove: () => void;
  isUpdating?: boolean;
}

const WaitlistCard: React.FC<WaitlistCardProps> = ({ 
  item, 
  onNotify, 
  onConvert, 
  onRemove,
  isUpdating 
}) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
      waiting: { label: 'Aguardando', variant: 'outline', color: 'text-yellow-600' },
      notified: { label: 'Notificado', variant: 'secondary', color: 'text-blue-600' },
      booked: { label: 'Agendado', variant: 'default', color: 'text-green-600' },
      expired: { label: 'Expirado', variant: 'destructive', color: 'text-red-600' }
    };
    return configs[status] || configs.waiting;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const statusConfig = getStatusConfig(item.status);
  const waitTime = formatDistanceToNow(parseISO(item.created_at), { 
    addSuffix: true, 
    locale: ptBR 
  });

  const handleWhatsApp = () => {
    const phone = item.client_phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${item.client_name}! Temos um horário disponível para você. Deseja agendar?`);
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(item.client_name)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold truncate">{item.client_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{item.client_phone}</span>
                  </div>
                </div>
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                {item.preferred_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Prefere: {format(parseISO(item.preferred_date), 'dd/MM/yyyy')}</span>
                  </div>
                )}
                {item.preferred_time_start && item.preferred_time_end && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.preferred_time_start} - {item.preferred_time_end}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Na lista {waitTime}</span>
                </div>
              </div>

              {/* Service/Barber */}
              <div className="flex flex-wrap gap-2 mt-2">
                {item.service && (
                  <Badge variant="outline" className="text-xs">{item.service.name}</Badge>
                )}
                {item.barber && (
                  <Badge variant="outline" className="text-xs">{item.barber.display_name}</Badge>
                )}
              </div>

              {/* Notified info */}
              {item.notified_at && (
                <p className="text-xs text-blue-600 mt-2">
                  Notificado {formatDistanceToNow(parseISO(item.notified_at), { addSuffix: true, locale: ptBR })}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleWhatsApp}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>

            {item.status === 'waiting' && (
              <Button
                size="sm"
                variant="outline"
                onClick={onNotify}
                disabled={isUpdating}
              >
                <Bell className="h-4 w-4 mr-1" />
                Notificar
              </Button>
            )}

            {(item.status === 'waiting' || item.status === 'notified') && (
              <Button
                size="sm"
                onClick={onConvert}
                disabled={isUpdating}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Agendar
              </Button>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={onRemove}
              disabled={isUpdating}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WaitlistCard;
