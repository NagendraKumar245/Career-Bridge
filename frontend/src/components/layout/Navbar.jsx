import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" id="nav-logo" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight gradient-text">
                CareerBridge
              </span>
              <span className="text-[10px] tracking-widest uppercase text-dark-400 font-semibold">
                AI Career Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              id="nav-link-home"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'text-white' : 'text-dark-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <a
              href="/#features"
              id="nav-link-features"
              className="text-sm font-medium text-dark-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              id="nav-link-how-it-works"
              className="text-sm font-medium text-dark-300 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="/#stats"
              id="nav-link-stats"
              className="text-sm font-medium text-dark-300 hover:text-white transition-colors"
            >
              Impact
            </a>
          </div>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  id="nav-btn-dashboard"
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  id="nav-btn-logout"
                  className="btn-secondary text-sm !py-2.5 !px-4"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  id="nav-btn-login"
                  className={`text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${
                    location.pathname === '/login'
                      ? 'text-white bg-dark-800 border border-dark-700'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  id="nav-btn-register"
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <Sparkles className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="p-2 rounded-xl bg-dark-800 text-dark-200 hover:text-white hover:bg-dark-700 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-dark-800 bg-dark-950/95 backdrop-blur-2xl animate-fade-in px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            id="mobile-nav-home"
            className="block px-4 py-3 rounded-xl text-base font-medium text-dark-200 hover:bg-dark-800 hover:text-white"
          >
            Home
          </Link>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            id="mobile-nav-features"
            className="block px-4 py-3 rounded-xl text-base font-medium text-dark-200 hover:bg-dark-800 hover:text-white"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            id="mobile-nav-how-it-works"
            className="block px-4 py-3 rounded-xl text-base font-medium text-dark-200 hover:bg-dark-800 hover:text-white"
          >
            How It Works
          </a>

          <div className="pt-4 border-t border-dark-800/80 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  id="mobile-nav-dashboard"
                  className="btn-primary text-center"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  id="mobile-nav-logout"
                  className="btn-secondary w-full text-center"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  id="mobile-nav-login"
                  className="btn-secondary text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  id="mobile-nav-register"
                  className="btn-primary text-center"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
