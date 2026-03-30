import React from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { Avatar } from './Avatar';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
export function Navbar() {
    const { theme, toggleTheme } = useTheme();
    return <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b border-border flex items-center justify-between px-6 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-2 min-w-[220px]">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <span className="text-emerald-500 font-bold text-sm">M</span>
        </div>
        <span className="text-xl font-bold tracking-tight">
          <span className="text-emerald-500">Market</span>
          <span className="text-foreground">Pulse</span>
        </span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <input type="text" placeholder="Search products, trends..." className="w-full bg-secondary border border-border rounded-xl pl-10 pr-20 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"/>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded-md">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="relative p-2 rounded-xl hover:bg-secondary transition-colors" aria-label="Toggle theme">
          <AnimatePresence mode="wait" initial={false}>
            {theme === 'dark' ? <motion.div key="sun" initial={{
                rotate: -90,
                opacity: 0,
                scale: 0.5
            }} animate={{
                rotate: 0,
                opacity: 1,
                scale: 1
            }} exit={{
                rotate: 90,
                opacity: 0,
                scale: 0.5
            }} transition={{
                duration: 0.2
            }}>
                <Sun className="w-5 h-5 text-amber-400"/>
              </motion.div> : <motion.div key="moon" initial={{
                rotate: 90,
                opacity: 0,
                scale: 0.5
            }} animate={{
                rotate: 0,
                opacity: 1,
                scale: 1
            }} exit={{
                rotate: -90,
                opacity: 0,
                scale: 0.5
            }} transition={{
                duration: 0.2
            }}>
                <Moon className="w-5 h-5 text-indigo-500"/>
              </motion.div>}
          </AnimatePresence>
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground"/>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"/>
        </button>

        {/* User Avatar */}
        <Avatar size="sm">
          
          
        </Avatar>
      </div>
    </header>;
}
