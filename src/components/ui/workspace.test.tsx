import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PageContainer, PageHeader, WorkspaceEmpty } from './workspace-page';
import { SectionTabsLayout } from './workspace-sections';
import { StatusCards } from './workspace-stats';
import { Tabs, TabsContent } from './tabs';
import { Users } from 'lucide-react';

afterEach(cleanup);
describe('Workspace design system', () => {
  it('isolates the new visual scope and keeps a single page heading', () => {
    const { container } = render(<PageContainer><PageHeader title="Clientes" subtitle="Seu relacionamento" /><p>Conteúdo</p></PageContainer>);
    expect(container.firstChild).toHaveClass('workspace-page');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Clientes');
  });
  it('keeps tab selection and panel associations accessible', () => {
    render(<Tabs defaultValue="one"><SectionTabsLayout items={[{ value: 'one', label: 'Equipe', description: 'Dados', icon: Users }, { value: 'two', label: 'Avaliações', description: 'Opiniões', icon: Users }]}><TabsContent value="one">Profissionais</TabsContent><TabsContent value="two">Comentários</TabsContent></SectionTabsLayout></Tabs>);
    const tab = screen.getByRole('tab', { name: /Avaliações/ });
    fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Comentários');
  });
  it('shows real zero values and explanatory metric context', () => {
    render(<StatusCards items={[{ label: 'Receita', value: 0, suffix: 'Mês atual' }]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Mês atual')).toBeInTheDocument();
  });
  it('provides an actionable empty state', () => {
    const click = vi.fn();
    render(<WorkspaceEmpty icon={<Users />} title="Comece aqui" description="Cadastre um cliente"><button onClick={click}>Adicionar</button></WorkspaceEmpty>);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(click).toHaveBeenCalledOnce();
  });
});
