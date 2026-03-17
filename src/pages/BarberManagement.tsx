import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import Layout from '@/components/Layout';
import { Plus, Power, PowerOff, Clock, Calendar, AlertTriangle, Users } from 'lucide-react';
import { useBarbers } from '@/hooks/useBarbers';
import { useBlockedSlots } from '@/hooks/useBlockedSlots';
import { useBarberAbsences } from '@/hooks/useBarberAbsences';
import { Barber } from '@/types/appointments';
import BlockedSlotsManager from '@/components/barbers/BlockedSlotsManager';
import BarberAbsencesManager from '@/components/barbers/BarberAbsencesManager';
import { format } from 'date-fns';
import { formatPhoneBR } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { StatusCards } from '@/components/ui/status-cards';

interface BarberFormData {
  full_name: string; email: string; phone: string; specializations: string; active: boolean;
}

const BarberManagement = () => {
  const { barbers, isLoading, addBarber, updateBarber, toggleBarberStatus } = useBarbers();
  const { blockedSlots, getBlockedSlotsForBarber } = useBlockedSlots();
  const { absences, getAbsencesForBarber, isBarberAbsent } = useBarberAbsences();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [blockedSlotsDialogOpen, setBlockedSlotsDialogOpen] = useState(false);
  const [absencesDialogOpen, setAbsencesDialogOpen] = useState(false);
  const [selectedBarberForManager, setSelectedBarberForManager] = useState<Barber | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  const openBlockedSlotsManager = (barber: Barber) => { setSelectedBarberForManager(barber); setBlockedSlotsDialogOpen(true); };
  const openAbsencesManager = (barber: Barber) => { setSelectedBarberForManager(barber); setAbsencesDialogOpen(true); };
  const getNextAbsence = (barberId: string) => { const ba = getAbsencesForBarber(barberId).filter(a => a.start_date >= today).sort((a, b) => a.start_date.localeCompare(b.start_date)); return ba[0] || null; };

  const [formData, setFormData] = useState<BarberFormData>({ full_name: "", email: "", phone: "", specializations: "", active: true });

  useEffect(() => {
    if (editingBarber) setFormData({ full_name: editingBarber.full_name, email: editingBarber.email || "", phone: editingBarber.phone || "", specializations: editingBarber.specialties?.join(', ') || "", active: editingBarber.active || true });
    else setFormData({ full_name: "", email: "", phone: "", specializations: "", active: true });
  }, [editingBarber, dialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) return;
    setSubmitting(true);
    try { if (editingBarber) await updateBarber({ id: editingBarber.id, formData }); else await addBarber(formData); setDialogOpen(false); setEditingBarber(null); } catch {} finally { setSubmitting(false); }
  };

  const activeCount = barbers.filter(b => b.active).length;
  const absentTodayCount = barbers.filter(b => isBarberAbsent(b.id, today)).length;

  if (isLoading) return <Layout><div className="flex items-center justify-center min-h-[400px] text-muted-foreground">Carregando profissionais...</div></Layout>;

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <PageHeader icon={<Users className="h-5 w-5" />} title="Profissionais" subtitle="Gerencie sua equipe">
          <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Novo Profissional</Button>
        </PageHeader>

        <StatusCards
          className="grid-cols-1 sm:grid-cols-3"
          items={[
            { label: "Total", value: barbers.length, icon: <Users className="h-5 w-5" />, color: "blue" },
            { label: "Ativos", value: activeCount, icon: <Power className="h-5 w-5" />, color: "green" },
            { label: "Ausentes Hoje", value: absentTodayCount, icon: <AlertTriangle className="h-5 w-5" />, color: "amber" },
          ]}
        />

        <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{barbers.length}</span> profissional(is)</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {barbers.map((barber) => {
            const barberBlockedSlots = getBlockedSlotsForBarber(barber.id);
            const isAbsentToday = isBarberAbsent(barber.id, today);
            const nextAbsence = getNextAbsence(barber.id);
            return (
              <div key={barber.id} className={`rounded-xl border border-border/40 bg-card p-5 shadow-sm transition-all hover:shadow-md ${isAbsentToday ? 'border-l-4 border-l-amber-500' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div><h3 className="font-semibold text-base">{barber.full_name}</h3><p className="text-sm text-muted-foreground">{barber.email}</p></div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant={barber.active ? "default" : "secondary"}>{barber.active ? "Ativo" : "Inativo"}</Badge>
                    {isAbsentToday && <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Ausente</Badge>}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Telefone:</span> {barber.phone || 'Não informado'}</div>
                  <div className="flex flex-wrap gap-1">{barber.specialties?.map((spec, i) => <Badge key={i} variant="outline" className="text-xs">{spec}</Badge>) || <span className="text-muted-foreground">Sem especializações</span>}</div>
                  <div className="flex gap-2 mt-1">
                    {barberBlockedSlots.length > 0 && <Badge variant="secondary" className="text-xs"><Clock className="h-3 w-3 mr-1" />{barberBlockedSlots.length} bloqueio(s)</Badge>}
                    {nextAbsence && <Badge variant="secondary" className="text-xs"><Calendar className="h-3 w-3 mr-1" />Ausência: {format(new Date(nextAbsence.start_date), 'dd/MM')}</Badge>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/40">
                  <Button variant="outline" size="sm" onClick={() => { setEditingBarber(barber); setDialogOpen(true); }}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => openBlockedSlotsManager(barber)}><Clock className="h-4 w-4 mr-1" />Bloqueios</Button>
                  <Button variant="outline" size="sm" onClick={() => openAbsencesManager(barber)}><Calendar className="h-4 w-4 mr-1" />Ausências</Button>
                  <Button variant={barber.active ? "secondary" : "default"} size="sm" onClick={() => toggleBarberStatus({ id: barber.id, currentStatus: barber.active || false })}>{barber.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}</Button>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingBarber(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{editingBarber ? "Editar Profissional" : "Novo Profissional"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label htmlFor="full_name">Nome Completo</Label><Input id="full_name" value={formData.full_name} onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))} required /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required /></div>
              <div><Label htmlFor="phone">Telefone</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhoneBR(e.target.value) }))} inputMode="tel" maxLength={14} /></div>
              <div><Label htmlFor="specializations">Especializações (vírgula)</Label><Input id="specializations" value={formData.specializations} onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))} /></div>
              <div className="flex items-center space-x-2"><Switch id="active" checked={formData.active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))} /><Label htmlFor="active">Ativo</Label></div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={submitting}>{submitting ? "Salvando..." : (editingBarber ? "Atualizar" : "Cadastrar")}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {selectedBarberForManager && <BlockedSlotsManager isOpen={blockedSlotsDialogOpen} onClose={() => { setBlockedSlotsDialogOpen(false); setSelectedBarberForManager(null); }} barberId={selectedBarberForManager.id} barberName={selectedBarberForManager.full_name} />}
        {selectedBarberForManager && <BarberAbsencesManager isOpen={absencesDialogOpen} onClose={() => { setAbsencesDialogOpen(false); setSelectedBarberForManager(null); }} barberId={selectedBarberForManager.id} barberName={selectedBarberForManager.full_name} />}
      </div>
    </Layout>
  );
};

export default BarberManagement;
