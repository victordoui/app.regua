import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import BillingFormDialog from '@/components/billing/BillingFormDialog';
import BillingTransactionCard from '@/components/billing/BillingTransactionCard';
import { AccountTransaction, AccountTransactionFormData, TransactionStatus, TransactionType } from '@/types/billing';
import { format } from 'date-fns';

const Billing = () => {
  const {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    updateTransactionStatus,
    deleteTransaction,
  } = useBilling();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<AccountTransaction | null>(null);
  const [currentTab, setCurrentTab] = useState<TransactionType | 'all'>('all');

  const handleNewTransaction = (type: TransactionType) => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
    // Set initial type for the form if needed
    // This is handled by initialType prop in BillingFormDialog
  };

  const handleEditTransaction = (transaction: AccountTransaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleSaveTransaction = async (formData: AccountTransactionFormData, id: string | null) => {
    if (id) {
      await updateTransaction({ id, formData });
    } else {
      await addTransaction(formData);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este lançamento?")) {
      await deleteTransaction(id);
    }
  };

  const handleUpdateTransactionStatus = async (id: string, status: TransactionStatus) => {
    await updateTransactionStatus({ id, status });
  };

  const filteredTransactions = useMemo(() => {
    if (currentTab === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.type === currentTab);
  }, [transactions, currentTab]);

  const totalPayable = useMemo(() => {
    return transactions
      .filter(t => t.type === 'payable' && t.status !== 'paid' && t.status !== 'cancelled')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalReceivable = useMemo(() => {
    return transactions
      .filter(t => t.type === 'receivable' && t.status !== 'received' && t.status !== 'cancelled')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const balance = useMemo(() => {
    const paidAmount = transactions
      .filter(t => t.type === 'payable' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
    const receivedAmount = transactions
      .filter(t => t.type === 'receivable' && t.status === 'received')
      .reduce((sum, t) => sum + t.amount, 0);
    return receivedAmount - paidAmount;
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar / Receber</h1>
            <p className="text-muted-foreground">
              Gerencie o fluxo de caixa e as obrigações financeiras.
            </p>
          </div>
          <Button onClick={() => handleNewTransaction('payable')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{formatCurrency(totalPayable)}</div>
              <p className="text-xs text-muted-foreground">Lançamentos pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{formatCurrency(totalReceivable)}</div>
              <p className="text-xs text-muted-foreground">Valores a receber</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
              <p className="text-xs text-muted-foreground">Saldo de transações concluídas</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as TransactionType | 'all')} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="payable">A Pagar</TabsTrigger>
            <TabsTrigger value="receivable">A Receber</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando lançamentos...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum lançamento encontrado.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTransactions.map(transaction => (
                  <BillingTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    onUpdateStatus={handleUpdateTransactionStatus}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payable" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando lançamentos...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhuma conta a pagar encontrada.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTransactions.map(transaction => (
                  <BillingTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    onUpdateStatus={handleUpdateTransactionStatus}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="receivable" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando lançamentos...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhuma conta a receber encontrada.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTransactions.map(transaction => (
                  <BillingTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    onUpdateStatus={handleUpdateTransactionStatus}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <BillingFormDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          editingTransaction={editingTransaction}
          saveTransaction={handleSaveTransaction}
          initialType={currentTab === 'payable' || currentTab === 'receivable' ? currentTab : 'payable'}
        />
      </div>
    </Layout>
  );
};

export default Billing;