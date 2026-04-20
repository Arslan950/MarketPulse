import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from './ThemeContext';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const LIGHT_COLORS = ['#059669', '#0891b2', '#d97706', '#7c3aed', '#dc2626', '#0f766e'];
const DARK_COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#f87171', '#2dd4bf'];

export function ProfitDonut({ data = [], isLoading = false }) {
  const { theme } = useTheme();
  const chartColors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const totalProfit = data.reduce((sum, item) => sum + Number(item?.value ?? 0), 0);
  const tooltipStyles = {
    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    borderRadius: '16px',
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Profit Potential by Category</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Expected inventory profit based on current stock and margins.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 dark:text-emerald-400">
          Live Mix
        </span>
      </div>

      {isLoading ? (
        <div className="mt-6 grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
          <div className="h-72 animate-pulse rounded-3xl bg-muted/60" />
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="mt-6 flex flex-1 min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-border bg-background/60 px-6 text-center">
          <div>
            <p className="text-base font-semibold text-foreground">No category profit data yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add products with stock to see where your strongest margins are sitting.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
          <div className="relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={78}
                  outerRadius={110}
                  paddingAngle={3}
                  stroke="transparent"
                >
                  {data.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Expected Profit']}
                  contentStyle={tooltipStyles}
                  itemStyle={{ color: tooltipStyles.color }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Total Potential
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(totalProfit)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {data.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Estimated category profit</p>
                  </div>
                </div>
                <p className="ml-3 text-sm font-semibold text-foreground">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}