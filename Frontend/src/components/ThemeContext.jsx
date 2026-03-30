import React, { useEffect, useState, createContext, useContext } from 'react';
const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => { }
});
export function useTheme() {
    return useContext(ThemeContext);
}
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem('marketpulse-theme');
        return stored || 'dark';
    });
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        }
        else {
            root.classList.remove('dark');
        }
        localStorage.setItem('marketpulse-theme', theme);
    }, [theme]);
    const toggleTheme = () => {
        setTheme((prev) => prev === 'dark' ? 'light' : 'dark');
    };
    return <ThemeContext.Provider value={{
            theme,
            toggleTheme
        }}>
      {children}
    </ThemeContext.Provider>;
}
