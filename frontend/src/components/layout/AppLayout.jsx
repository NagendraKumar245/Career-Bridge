import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Sparkles, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Helper to format route titles for mobile header
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/profile':
        return 'My Profile';
      case '/jobs':
        return 'Job Opportunities';
      case '/applications':
        return 'Applications';
      case '/skills':
        return 'Skill Gap & Learning';
      case '/admin':
        return 'Admin Portal';
      default:
        return 'CareerBridge';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col lg:flex-row text-dark-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 bg-dark-900/90 backdrop-blur-xl border-b border-dark-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              id="mobile-sidebar-open-btn"
              className="p-2 rounded-xl bg-dark-800 text-dark-200 hover:text-white hover:bg-dark-700 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-white text-base">
              {getPageTitle(location.pathname)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center font-bold text-xs text-white">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
