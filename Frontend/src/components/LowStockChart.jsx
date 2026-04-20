import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useTheme } from './ThemeContext';

const getBarColor = (value, theme) => {
  if (value <= 2) {
    return theme === 'dark' ? '#f87171' : '#dc2626';
  }

  if (value <= 5) {
    return theme === 'dark' ? '#fbbf24' : '#d97706';
  }

  return theme === 'dark' ? '#10b981' : '#059669';
};

export function LowStockChart({ data = [], isLoading = false }) {
  const { theme } = useTheme();
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';
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
          <h3 className="text-lg font-semibold text-foreground">Low Stock Watchlist</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Bottom 5 products by remaining quantity, ready for a quick refill check.
          </p>
        </div>
        <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-500 dark:text-orange-400">
          Reorder Focus
        </span>
      </div>

      {isLoading ? (
        <div className="mt-6 flex-1 min-h-[320px] animate-pulse rounded-3xl bg-muted/60" />
      ) : data.length === 0 ? (
        <div className="mt-6 flex flex-1 min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-border bg-background/60 px-6 text-center">
          <div>
            <p className="text-base font-semibold text-foreground">No low-stock pressure right now</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Once products are added, this chart will highlight the items closest to running out.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex-1 min-h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 12, bottom: 8 }}
            >
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: tickColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fill: tickColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value} units`, 'Stock Left']}
                contentStyle={tooltipStyles}
                itemStyle={{ color: tooltipStyles.color }}
                cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' }}
              />
              <Bar dataKey="stockQuantity" radius={[0, 12, 12, 0]} barSize={22}>
                {data.map((item) => (
                  <Cell key={item.name} fill={getBarColor(item.stockQuantity, theme)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
