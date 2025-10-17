import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Trash2, CheckCircle, XCircle, MoreHorizontal, Clock, DollarSign } from 'lucide-react';
import { AccountTransaction, TransactionStatus } from '@/types/billing';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BillingTransactionCardProps {
  transaction: AccountTransaction;
  onEdit: (transaction: AccountTransaction) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: TransactionStatus) => void;
}

const BillingTransactionCard: React.FC<BillingTransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
  onUpdateStatus,
}) => {
  const isOverdue = transaction.status === 'pending' && isPast(new Date(transaction.due_date));
  const isPaidOrReceived = transaction.status === 'paid' || transaction.status === 'received';

  const getStatusBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case 'paid':
      case 'received':
        return 'default';
      case 'pending':
        return isOverdue ? 'destructive' : 'secondary';
      case 'overdue':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: TransactionStatus) => {
    switch (status) {
      case 'pending':
        return isOverdue ? 'Atrasado' : 'Pendente';
      case 'paid':
        return 'Pago';
      case 'received':
        return 'Recebido';
      case 'overdue':
        return 'Atrasado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <DollarSign className={`h-5 w-5 ${transaction.type === 'payable' ? 'text-red-500' : 'text-green-500'}`} />
            <div>
              <CardTitle className="text-lg">{transaction.description}</CardTitle>
              <Badge variant={getStatusBadgeVariant(transaction.status)} className="mt-1">
                {getStatusText(transaction.status)}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(transaction)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              {!isPaidOrReceived && (
                <DropdownMenuItem onClick={() => onUpdateStatus(transaction.id, transaction.type === 'payable' ? 'paid' : 'received')}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Marcar como {transaction.type === 'payable' ? 'Pago' : 'Recebido'}
                </DropdownMenuItem>
              )}
              {(isPaidOrReceived || transaction.status === 'pending') && (
                <DropdownMenuItem onClick={() => onUpdateStatus(transaction.id, 'cancelled')}>
                  <XCircle className="mr-2 h-4 w-4" /> Marcar como Cancelado
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(transaction.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Valor:</span>
          <span className={`font-bold ${transaction.type === 'payable' ? 'text-red-500' : 'text-green-500'}`}>
            {formatCurrency(transaction.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium">Vencimento:</span>
          <span>{format(new Date(transaction.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
        </div>
        {transaction.category && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium">Categoria:</span>
            <span>{transaction.category}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingTransactionCard;