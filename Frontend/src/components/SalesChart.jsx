import React from 'react';
import { motion } from 'framer-motion';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from './Chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from './ThemeContext';
const chartData = [{
        month: 'Jan',
        sales: 4200,
        demand: 4800
    }, {
        month: 'Feb',
        sales: 4800,
        demand: 5200
    }, {
        month: 'Mar',
        sales: 5600,
        demand: 5800
    }, {
        month: 'Apr',
        sales: 5200,
        demand: 6200
    }, {
        month: 'May',
        sales: 6800,
        demand: 7100
    }, {
        month: 'Jun',
        sales: 7200,
        demand: 7600
    }, {
        month: 'Jul',
        sales: 6900,
        demand: 8200
    }, {
        month: 'Aug',
        sales: 7800,
        demand: 8800
    }, {
        month: 'Sep',
        sales: 8400,
        demand: 9200
    }, {
        month: 'Oct',
        sales: 9100,
        demand: 9800
    }, {
        month: 'Nov',
        sales: 10200,
        demand: 10600
    }, {
        month: 'Dec',
        sales: 11400,
        demand: 11800
    }];
const chartConfig = {
    sales: {
        label: 'Sales',
        color: '#06b6d4'
    },
    demand: {
        label: 'Market Demand',
        color: '#8b5cf6'
    }
};
export function SalesChart() {
    const { theme } = useTheme();
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    const tickColor = theme === 'dark' ? '#64748b' : '#94a3b8';
    const cursorColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const dotStroke = theme === 'dark' ? '#020617' : '#ffffff';
    return <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.5,
            delay: 0.3
        }} className="bg-card backdrop-blur border border-border rounded-2xl p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Sales vs. Market Demand Forecast
          </h3>
          <p className="text-muted-foreground text-sm mt-0.5">
            12-month performance overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted border border-border rounded-lg hover:text-foreground transition-colors">
            Monthly
          </button>
          <button className="px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 rounded-lg">
            Yearly
          </button>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[350px] w-full">
        <AreaChart data={chartData} margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0
        }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{
            fill: tickColor,
            fontSize: 12
        }}/>
          <YAxis axisLine={false} tickLine={false} tick={{
            fill: tickColor,
            fontSize: 12
        }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}/>
          <Tooltip content={<ChartTooltipContent indicator="line"/>} cursor={{
            stroke: cursorColor
        }}/>
          <Legend content={<ChartLegendContent />}/>
          <Area type="monotone" dataKey="sales" stroke="#06b6d4" strokeWidth={2.5} fill="url(#salesGradient)" filter="url(#glow)" dot={false} activeDot={{
            r: 5,
            fill: '#06b6d4',
            stroke: dotStroke,
            strokeWidth: 2
        }}/>
          <Area type="monotone" dataKey="demand" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#demandGradient)" filter="url(#glow)" dot={false} activeDot={{
            r: 5,
            fill: '#8b5cf6',
            stroke: dotStroke,
            strokeWidth: 2
        }}/>
        </AreaChart>
      </ChartContainer>
    </motion.div>;
}
