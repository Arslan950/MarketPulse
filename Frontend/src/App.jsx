import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import { SidebarProvider, useSidebar } from './components/SidebarContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TrendCommand } from './pages/TrendCommand';
import { StockIntelligence } from './pages/StockIntelligence';
import { BusinessCopilot } from './pages/BusinessCopilot';
import { ProcurementHub } from './pages/ProcurementHub';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { GetStarted } from './pages/GetStarted';
import EmailVerification from './pages/EmailVerification'
import { useLoggedInStatus } from './store/LoginStatus';

function AppLayout() {
  const isLoggedIn = useLoggedInStatus((state) => state.isLoggedIn);
  const { collapsed } = useSidebar();
  return <div className="min-h-screen font-sans transition-colors duration-300 bg-background">
    <Navbar />
    <Sidebar />

    <main className="min-h-screen pt-16 transition-all duration-300 ease-in-out" style={{
      marginLeft: collapsed ? 68 : 240
    }}>
      <div className="p-8">
        <Routes>
          {isLoggedIn ? (
            <>
              <Route path="/trend-command" element={<TrendCommand />} />
              <Route path="/stock-intelligence" element={<StockIntelligence />} />
              <Route path="/procurement" element={<ProcurementHub />} />
              <Route path="/business-copilot" element={<BusinessCopilot />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/trend-command" replace />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </div>
    </main>
  </div>;
}

function AppRouter() {
  return <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgotPassword" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />
    <Route path="/verify-email/:emailVerificationToken" element={<EmailVerification />} />
    <Route path="/get-started/:userID" element={<GetStarted />} />
    <Route path="/*" element={<AppLayout />} />
  </Routes>;
}

export function App() {
  return <ThemeProvider>
    <SidebarProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </SidebarProvider>
  </ThemeProvider>;
}
