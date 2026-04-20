import React from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, Package, Brain, ShoppingCart, PanelLeftClose, PanelLeftOpen , LayoutDashboard} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSidebar } from './SidebarContext';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import { useAuthStore } from '../store/UserInfo';

const navItems = [
  {
    label : 'DashBoard',
    path : '/dashboard',
    icon : LayoutDashboard
  },
  {
    label: 'Trend Command',
    path: '/trend-command',
    icon: TrendingUp,
  },
  {
    label: 'Stock Intelligence',
    path: '/stock-intelligence',
    icon: Package,
  },
  {
    label: 'Procurement Hub',
    path: '/procurement',
    icon: ShoppingCart,
  },
  {
    label: 'Business Copilot',
    path: '/business-copilot',
    icon: Brain,
  },
];

const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'MP';

export function Sidebar() {
  const { collapsed, toggleSidebar } = useSidebar();
  const currentUser = useAuthStore((state) => state.user);
  const business = useAuthStore((state) => state.business);
  const isLoadingProfile = useAuthStore((state) => state.isLoading);

  const profilePicture = business?.profilePicture || '';
  const userName = currentUser?.fullName || (isLoadingProfile ? 'Loading profile...' : 'Profile');
  const userEmail = currentUser?.email || (isLoadingProfile ? 'Loading...' : 'Email not available');
  const userInitials = getInitials(currentUser?.fullName);

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 bg-background border-r border-border z-40 flex flex-col py-4 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[68px] px-2' : 'w-[240px] px-3'
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center w-full p-2 mb-4 transition-colors rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <PanelLeftOpen className="w-5 h-5" />
        ) : (
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Menu
            </span>
            <PanelLeftClose className="w-4 h-4" />
          </div>
        )}
      </button>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? 'justify-center px-0' : 'px-4'
              } ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-500 shadow-lg shadow-emerald-500/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`
            }
          >
            <item.icon className="flex-shrink-0 w-5 h-5" />
            {!collapsed ? (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <NavLink to="/profile" className="mt-auto" title={collapsed ? userName : undefined}>
        {!collapsed ? (
          <div className="mx-1 rounded-2xl bg-secondary/50 border border-border p-3 flex items-center gap-3 hover:bg-secondary transition-colors">
            <Avatar size="lg">
              {/* Dynamically set the image source */}
              <AvatarImage src={profilePicture} alt={userName} />
              {/* Fallback now uses dynamic initials instead of hardcoded 'U' */}
              <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-xs font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-medium truncate">
                {userName}
              </p>
              <p className="text-muted-foreground text-[11px] truncate">
                {userEmail}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar size="lg">
              <AvatarImage src={profilePicture} alt={userName} />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-xs font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </NavLink>
    </aside>
  );
}
