import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, LogOutIcon } from 'lucide-react';
import { Avatar } from './Avatar';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';

export function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

        setIsLoggingOut(true);

        try {
            await axios.post('http://localhost:3000/api/v1/auth/logout', {}, {
                withCredentials: true,
                headers: accessToken ? {
                    Authorization: `Bearer ${accessToken}`
                } : {},
            });
        } finally {
            window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
            navigate('/login');
        }
    };

    return <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 transition-colors duration-300 border-b bg-background border-border">
      {/* Logo */}
      <div className="flex items-center gap-2 min-w-[220px]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20">
          <span className="text-sm font-bold text-emerald-500">M</span>
        </div>
        <span className="text-xl font-bold tracking-tight">
          <span className="text-emerald-500">Market</span>
          <span className="text-foreground">Pulse</span>
        </span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"/>
          <input type="text" placeholder="Search products, trends..." className="w-full bg-secondary border border-border rounded-xl pl-10 pr-20 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"/>
          <div className="absolute flex items-center gap-1 -translate-y-1/2 right-3 top-1/2">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded-md">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="relative p-2 transition-colors rounded-xl hover:bg-secondary" aria-label="Toggle theme">
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
        <button className="relative p-2 transition-colors rounded-xl hover:bg-secondary">
          <Bell className="w-5 h-5 text-muted-foreground"/>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"/>
        </button>
        <button title = "Logout" onClick={handleLogout} disabled={isLoggingOut} className='flex items-center gap-x-1 bg-[#10b981] px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed'>
          <LogOutIcon size={19}/>
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </header>;
}
