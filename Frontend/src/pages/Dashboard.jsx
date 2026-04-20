import React from 'react';
import { KPICards } from '../components/KPICards';
import { SalesChart } from '../components/SalesChart';
export function DashBoard() {
    return <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dash board</h1>
        <p className="text-muted-foreground text-sm mt-1">
            Extract the data visualizations for our key performance indicators (KPIs).
        </p>
      </div>
      <KPICards />
      <SalesChart />
    </div>;
}
