import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
const sparklineData = [{
        v: 30
    }, {
        v: 45
    }, {
        v: 35
    }, {
        v: 50
    }, {
        v: 42
    }, {
        v: 58
    }, {
        v: 52
    }, {
        v: 65
    }, {
        v: 60
    }, {
        v: 72
    }, {
        v: 68
    }, {
        v: 80
    }];
export function KPICards() {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Sales */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4,
            delay: 0.1
        }} className="bg-card backdrop-blur border border-border rounded-2xl p-5 transition-colors duration-300">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Total Sales (Today)
            </p>
            <p className="text-3xl font-bold text-foreground mt-1">$12,426</p>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2 py-1 rounded-lg">
            <TrendingUp className="w-3 h-3"/>
            +12.5%
          </div>
        </div>
        <div className="h-[50px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id="sparkGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#sparkGreen)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Profit Margin */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4,
            delay: 0.2
        }} className="bg-card backdrop-blur border border-border rounded-2xl p-5 transition-colors duration-300">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Profit Margin
        </p>
        <div className="flex items-end gap-3 mt-1">
          <p className="text-3xl font-bold text-foreground">23.5%</p>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-1">
            <TrendingUp className="w-4 h-4"/>
            <span>+2.1%</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" style={{
            width: '72%'
        }}/>
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
            <span>Target: 25%</span>
            <span>72% achieved</span>
          </div>
        </div>
      </motion.div>

      {/* Dead Stock Warning */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4,
            delay: 0.3
        }} className="bg-card backdrop-blur border border-border rounded-2xl p-5 transition-colors duration-300">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Dead Stock Warning
            </p>
            <p className="text-3xl font-bold text-orange-500 dark:text-orange-400 mt-1">
              $3,200
            </p>
          </div>
          <div className="p-2 bg-orange-500/15 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400"/>
          </div>
        </div>
        <p className="text-muted-foreground text-xs mt-3">
          14 items haven't sold in 30+ days
        </p>
        <div className="flex gap-2 mt-4">
          <div className="flex-1 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2 text-center">
            <p className="text-orange-500 dark:text-orange-400 text-sm font-bold">
              8
            </p>
            <p className="text-muted-foreground text-[10px]">Critical</p>
          </div>
          <div className="flex-1 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 text-center">
            <p className="text-yellow-600 dark:text-yellow-400 text-sm font-bold">
              6
            </p>
            <p className="text-muted-foreground text-[10px]">Warning</p>
          </div>
        </div>
      </motion.div>
    </div>;
}
