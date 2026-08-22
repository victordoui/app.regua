import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ServiceDistribution } from "@/hooks/useRealtimeDashboard";

const COLORS = ["#3478f6", "#28b982", "#9b63db", "#f5b51b", "#38a4d8"];

const ServiceDistributionChart = ({ data, periodLabel }: { data: ServiceDistribution[]; periodLabel: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="dashboard-surface h-full p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-bold text-foreground">Agendamentos por serviço</h2>
        <span className="rounded-lg border bg-background px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">{periodLabel}</span>
      </div>
      {data.length === 0 ? (
        <div className="flex h-[230px] items-center justify-center text-sm text-muted-foreground">Nenhum atendimento no período</div>
      ) : (
        <div className="mt-2 grid items-center gap-3 sm:grid-cols-[190px_1fr]">
          <div className="relative h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={1.5} stroke="transparent">
                  {data.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${value} agendamentos`, name]} contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-semibold text-muted-foreground">Total</span>
              <strong className="text-2xl font-black text-foreground">{total}</strong>
            </div>
          </div>
          <div className="space-y-3">
            {data.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center gap-3 text-xs">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="min-w-0 flex-1 truncate font-medium text-muted-foreground">{item.name}</span>
                <strong className="whitespace-nowrap text-foreground">{item.value} ({item.percentage.toFixed(1).replace(".", ",")}%)</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ServiceDistributionChart;
