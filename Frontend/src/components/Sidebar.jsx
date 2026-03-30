import React from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, Package, Brain, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import { motion } from 'framer-motion';
const navItems = [{
        label: 'Trend Command',
        path: '/trend-command',
        icon: TrendingUp
    }, {
        label: 'Stock Intelligence',
        path: '/stock-intelligence',
        icon: Package
    }, {
        label: 'Business Copilot',
        path: '/business-copilot',
        icon: Brain
    }];
export function Sidebar() {
    const { collapsed, toggleSidebar } = useSidebar();
    return <aside className={`fixed left-0 top-16 bottom-0 bg-background border-r border-border z-40 flex flex-col py-4 transition-all duration-300 ease-in-out ${collapsed ? 'w-[68px] px-2' : 'w-[240px] px-3'}`}>
      {/* Toggle Button */}
      <button onClick={toggleSidebar} className="flex items-center justify-center w-full mb-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <PanelLeftOpen className="w-5 h-5"/> : <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Menu
            </span>
            <PanelLeftClose className="w-4 h-4"/>
          </div>}
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => <NavLink key={item.path} to={item.path} title={collapsed ? item.label : undefined} className={({ isActive }) => `flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${collapsed ? 'justify-center px-0' : 'px-4'} ${isActive ? 'bg-emerald-500/15 text-emerald-500 shadow-lg shadow-emerald-500/5' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
            <item.icon className="w-5 h-5 flex-shrink-0"/>
            {!collapsed && <motion.span initial={{
                    opacity: 0,
                    width: 0
                }} animate={{
                    opacity: 1,
                    width: 'auto'
                }} exit={{
                    opacity: 0,
                    width: 0
                }} className="whitespace-nowrap overflow-hidden">
                {item.label}
              </motion.span>}
          </NavLink>)}
      </nav>

      {/* Profile Mini Section */}
      <NavLink to="/profile" className="mt-auto" title={collapsed ? 'Alex Morgan' : undefined}>
        {!collapsed ? <div className="mx-1 rounded-2xl bg-secondary/50 border border-border p-3 flex items-center gap-3 hover:bg-secondary transition-colors">
            <Avatar size="sm">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" alt="Alex Morgan"/>
              <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-xs font-semibold">
                AM
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-medium truncate">
                Alex Morgan
              </p>
              <p className="text-muted-foreground text-[11px] truncate">
                alex@marketpulse.io
              </p>
            </div>
          </div> : <div className="flex justify-center">
            <Avatar size="sm">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" alt="Alex Morgan"/>
              <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-xs font-semibold">
                AM
              </AvatarFallback>
            </Avatar>
          </div>}
      </NavLink>
    </aside>;
}
