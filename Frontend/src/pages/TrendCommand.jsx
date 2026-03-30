import React from 'react';
import { TrendingSection } from '../components/TrendingSection';
import { KPICards } from '../components/KPICards';
import { SalesChart } from '../components/SalesChart';
export function TrendCommand() {
    return <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trend Command</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor market trends and optimize your inventory in real-time
        </p>
      </div>
      <TrendingSection />
      <KPICards />
      <SalesChart />
    </div>;
}
