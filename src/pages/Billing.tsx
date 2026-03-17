import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import BillingFormDialog from '@/components/billing/BillingFormDialog';
import BillingTransactionCard from '@/components/billing/BillingTransactionCard';
import { AccountTransaction, AccountTransactionFormData, TransactionStatus, TransactionType } from '@/types/billing';
import { PageHeader } from '@/components/ui/page-header';
import { StatusCards } from '@/components/ui/status-cards';

const Billing = () => {
  const { transactions, isLoading, addTransaction, updateTransaction, updateTransactionStatus, deleteTransaction } = useBilling();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<AccountTransaction | null>(null);
  const [currentTab, setCurrentTab] = useState<TransactionType | 'all'>('all');

  const handleNewTransaction = (type: TransactionType) => { setEditingTransaction(null); setIsDialogOpen(true); };
  const handleEditTransaction = (transaction: AccountTransaction) => { setEditingTransaction(transaction); setIsDialogOpen(true); };
  const handleSaveTransaction = async (formData: AccountTransactionFormData, id: string | null) => { if (id) await updateTransaction({ id, formData }); else await addTransaction(formData); };
  const handleDeleteTransaction = async (id: string) => { if (window.confirm("Tem certeza que deseja excluir?")) await deleteTransaction(id); };
  const handleUpdateTransactionStatus = async (id: string, status: TransactionStatus) => { await updateTransactionStatus({ id, status }); };

  const filteredTransactions = useMemo(() => currentTab === 'all' ? transactions : transactions.filter(t => t.type === currentTab), [transactions, currentTab]);
  const totalPayable = useMemo(() => transactions.filter(t => t.type === 'payable' && t.status !== 'paid' && t.status !== 'cancelled').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalReceivable = useMemo(() => transactions.filter(t => t.type === 'receivable' && t.status !== 'received' && t.status !== 'cancelled').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const balance = useMemo(() => {
    const paid = transactions.filter(t => t.type === 'payable' && t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
    const received = transactions.filter(t => t.type === 'receivable' && t.status === 'received').reduce((sum, t) => sum + t.amount, 0);
    return received - paid;
  }, [transactions]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const renderList = () => (
    isLoading ? <div className="text-center py-12 text-muted-foreground">Carregando...</div>
    : filteredTransactions.length === 0 ? <div className="text-center py-12 text-muted-foreground"><Wallet className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Nenhum lançamento encontrado.</p></div>
    : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredTransactions.map(t => <BillingTransactionCard key={t.id} transaction={t} onEdit={handleEditTransaction} onDelete={handleDeleteTransaction} onUpdateStatus={handleUpdateTransactionStatus} />)}</div>
  );

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <PageHeader icon={<Wallet className="h-5 w-5" />} title="Contas a Pagar / Receber" subtitle="Controle financeiro do negócio">
          <Button onClick={() => handleNewTransaction('payable')}><Plus className="h-4 w-4 mr-2" />Novo Lançamento</Button>
        </PageHeader>

        <StatusCards
          className="grid-cols-1 sm:grid-cols-3"
          items={[
            { label: "A Pagar", value: fmt(totalPayable), icon: <ArrowDownCircle className="h-5 w-5" />, color: "red" },
            { label: "A Receber", value: fmt(totalReceivable), icon: <ArrowUpCircle className="h-5 w-5" />, color: "green" },
            { label: "Saldo Atual", value: fmt(balance), icon: <Wallet className="h-5 w-5" />, color: "blue" },
          ]}
        />

        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as TransactionType | 'all')} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="payable">A Pagar</TabsTrigger>
            <TabsTrigger value="receivable">A Receber</TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderList()}</TabsContent>
          <TabsContent value="payable">{renderList()}</TabsContent>
          <TabsContent value="receivable">{renderList()}</TabsContent>
        </Tabs>

        <BillingFormDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} editingTransaction={editingTransaction} saveTransaction={handleSaveTransaction} initialType={currentTab === 'payable' || currentTab === 'receivable' ? currentTab : 'payable'} />
      </div>
    </Layout>
  );
};

export default Billing;
