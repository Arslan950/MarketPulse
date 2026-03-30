import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import { SidebarProvider, useSidebar } from './components/SidebarContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TrendCommand } from './pages/TrendCommand';
import { StockIntelligence } from './pages/StockIntelligence';
import { BusinessCopilot } from './pages/BusinessCopilot';
import { Profile } from './pages/Profile';
function AppLayout() {
    const { collapsed } = useSidebar();
    return <div className="min-h-screen bg-background font-sans transition-colors duration-300">
      <Navbar />
      <Sidebar />

      <main className="pt-16 min-h-screen transition-all duration-300 ease-in-out" style={{
            marginLeft: collapsed ? 68 : 240
        }}>
        <div className="p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/trend-command" replace/>}/>
            <Route path="/trend-command" element={<TrendCommand />}/>
            <Route path="/stock-intelligence" element={<StockIntelligence />}/>
            <Route path="/business-copilot" element={<BusinessCopilot />}/>
            <Route path="/profile" element={<Profile />}/>
          </Routes>
        </div>
      </main>
    </div>;
}
export function App() {
    return <ThemeProvider>
      <SidebarProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>;
}
