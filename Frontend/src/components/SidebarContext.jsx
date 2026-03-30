import React, { useState, createContext, useContext } from 'react';
const SidebarContext = createContext({
    collapsed: false,
    toggleSidebar: () => { }
});
export function useSidebar() {
    return useContext(SidebarContext);
}
export function SidebarProvider({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const toggleSidebar = () => setCollapsed((prev) => !prev);
    return <SidebarContext.Provider value={{
            collapsed,
            toggleSidebar
        }}>
      {children}
    </SidebarContext.Provider>;
}
