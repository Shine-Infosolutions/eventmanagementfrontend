import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppContextProvider from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/admin/Dashboard';
import SellPass from './pages/sales/SellPass';
import SellPassList from './pages/sales/SellPassList';
import BookingList from './pages/booking/BookingList';
import GateEntry from './pages/gate/GateEntry';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <AppContextProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-100">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="lg:hidden">
                    <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                  </div>
                  <main className="flex-1 overflow-y-auto lg:ml-64">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/sell-pass" element={<SellPass />} />
                      <Route path="/sell-pass-list" element={<SellPassList />} />
                      <Route path="/bookings" element={<BookingList />} />
                      <Route path="/gate-entry" element={<GateEntry />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppContextProvider>
  );
};

export default App;
