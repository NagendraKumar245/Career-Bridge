import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Briefcase,
  ClipboardList,
  BarChart3,
  Shield,
  LogOut,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      id: 'sidebar-link-dashboard',
    },
    {
      name: 'Profile',
      to: '/profile',
      icon: User,
      id: 'sidebar-link-profile',
    },
    {
      name: 'Jobs',
      to: '/jobs',
      icon: Briefcase,
      id: 'sidebar-link-jobs',
    },
    {
      name: 'Applications',
      to: '/applications',
      icon: ClipboardList,
      id: 'sidebar-link-applications',
    },
    {
      name: 'Skill Analysis',
      to: '/skills',
      icon: BarChart3,
      id: 'sidebar-link-skills',
    },
  ];

  if (isAdmin) {
    navItems.push({
      name: 'Admin Dashboard',
      to: '/admin',
      icon: Shield,
      id: 'sidebar-link-admin',
      adminOnly: true,
    });
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-dark-900 border-r border-dark-800/80">
      {/* Top Header / Logo */}
      <div className="p-6 flex items-center justify-between border-b border-dark-800/80">
        <div
          onClick={() => navigate('/dashboard')}
          id="sidebar-logo-brand"
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>CareerBridge</span>
            </h1>
            <span className="text-[11px] text-dark-400 font-medium tracking-wide">
              AI Career Engine
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          id="sidebar-close-btn"
          className="lg:hidden p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-dark-400 uppercase">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={item.id}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'sidebar-link-active text-white shadow-md shadow-primary-500/10'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.adminOnly && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Admin
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User profile card & Logout */}
      <div className="p-4 border-t border-dark-800/80 bg-dark-950/40">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-800/40 border border-dark-700/40 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center font-bold text-white shadow-md shadow-primary-500/20">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.full_name || 'Student User'}
            </p>
            <p className="text-xs text-dark-400 truncate">
              {user?.email || 'student@university.edu'}
            </p>
          </div>
          {isAdmin && (
            <span className="badge-warning text-[10px] !px-1.5 !py-0.5">
              Admin
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          id="sidebar-logout-btn"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-red-500/20 hover:border-red-500/30"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (fixed width 280px) */}
      <aside className="hidden lg:block w-[280px] h-screen sticky top-0 shrink-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer with Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative w-[280px] max-w-[85vw] h-full shadow-2xl z-10 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
