import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart, Package, RefreshCw } from 'lucide-react';
import { ProfitDonut } from '../components/ProfitDonut';
import { LowStockChart } from '../components/LowStockChart';

const SALES_API_URL = 'http://localhost:3000/api/v1/sales';

const EMPTY_STATS = {
  todaysRevenue: 0,
  profitByCategory: [],
  lowStockItems: [],
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export function DashBoard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchDashboardStats = async () => {
    setLoadError('');
    setIsLoading(true);

    try {
      const response = await axios.get(`${SALES_API_URL}/dashboard-stats`, {
        withCredentials: true,
      });

      const payload = response?.data?.data ?? EMPTY_STATS;

      setStats({
        todaysRevenue: Number(payload.todaysRevenue ?? 0),
        profitByCategory: Array.isArray(payload.profitByCategory) ? payload.profitByCategory : [],
        lowStockItems: Array.isArray(payload.lowStockItems) ? payload.lowStockItems : [],
      });
    } catch (error) {
      setLoadError(error?.response?.data?.message || 'Unable to load dashboard insights right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const totalProfitPotential = stats.profitByCategory.reduce(
    (sum, item) => sum + Number(item?.value ?? 0),
    0
  );
  const topCategory = stats.profitByCategory[0]?.name || 'No category data yet';
  const urgentRestockCount = stats.lowStockItems.filter((item) => Number(item?.stockQuantity ?? 0) <= 5).length;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track live POS revenue, inventory profit potential, and low-stock pressure in one view.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardStats}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Insights
        </button>
      </motion.div>

      {loadError ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {loadError}
        </motion.div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-3xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Today&apos;s Revenue
              </p>
              {isLoading ? (
                <div className="mt-3 h-9 w-36 animate-pulse rounded-xl bg-muted/70" />
              ) : (
                <p className="mt-3 text-3xl font-bold text-foreground">{formatCurrency(stats.todaysRevenue)}</p>
              )}
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Revenue captured from midnight until the latest recorded sale.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-3xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Profit Opportunity
              </p>
              {isLoading ? (
                <div className="mt-3 h-9 w-40 animate-pulse rounded-xl bg-muted/70" />
              ) : (
                <p className="mt-3 text-3xl font-bold text-foreground">
                  {formatCurrency(totalProfitPotential)}
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-500 dark:text-cyan-400">
              <PieChart className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Strongest category right now: <span className="font-semibold text-foreground">{topCategory}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="rounded-3xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Low Stock Alerts
              </p>
              {isLoading ? (
                <div className="mt-3 h-9 w-24 animate-pulse rounded-xl bg-muted/70" />
              ) : (
                <p className="mt-3 text-3xl font-bold text-foreground">{stats.lowStockItems.length}</p>
              )}
            </div>
            <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-500 dark:text-orange-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {urgentRestockCount} item(s) in the watchlist have 5 or fewer units remaining.
          </p>
        </motion.div>
      </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="h-full"
        >
          <ProfitDonut data={stats.profitByCategory} isLoading={isLoading} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="h-full"
        >
          <LowStockChart data={stats.lowStockItems} isLoading={isLoading} />
        </motion.div>
      </div>
    </div>
  );
}
