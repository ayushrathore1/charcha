import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Sidebar } from './components/layout/Sidebar';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { People } from './pages/People';
import { PersonDetail } from './pages/PersonDetail';
import { Nudges } from './pages/Nudges';

const ProtectedRoute = () => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [checking, setChecking] = React.useState(true);

  useEffect(() => {
    checkAuth().then(() => setChecking(false));
  }, [checkAuth]);

  if (checking) return null; // or a tiny loader
  
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return (
    <div className="flex bg-[#0a0a0f] min-h-screen text-[#f0eee8] font-sans">
      <Sidebar />
      <div className="flex-1 sm:ml-[60px] lg:ml-[220px] pb-20 sm:pb-0">
        <Outlet />
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/people" element={<People />} />
          <Route path="/people/:id" element={<PersonDetail />} />
          <Route path="/nudges" element={<Nudges />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
