import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Authentication failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoStudent = () => {
    setEmail('john@example.com');
    setPassword('password123');
    setError('');
  };

  const handleQuickDemoAdmin = () => {
    setEmail('admin@careerbridge.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col selection:bg-primary-500/30 selection:text-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          {/* Glass Card */}
          <div className="glass-card p-8 sm:p-10 border-dark-700/80 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-sm text-dark-400 mt-2">
                Sign in to manage your career matches and profile
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                id="login-error-alert"
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm animate-fade-in"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    id="login-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    id="login-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Panel */}
            <div className="mt-8 pt-6 border-t border-dark-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                  Demo Accounts
                </span>
                <span className="text-[11px] text-dark-400">Click to autofill</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  id="login-demo-student-btn"
                  onClick={handleQuickDemoStudent}
                  className="p-2.5 rounded-xl bg-dark-800/60 hover:bg-dark-800 text-left border border-dark-700/60 hover:border-primary-500/40 transition-all group"
                >
                  <p className="font-semibold text-white group-hover:text-primary-300">Student Demo</p>
                  <p className="text-[10px] text-dark-400 truncate">john@example.com</p>
                </button>
                <button
                  type="button"
                  id="login-demo-admin-btn"
                  onClick={handleQuickDemoAdmin}
                  className="p-2.5 rounded-xl bg-dark-800/60 hover:bg-dark-800 text-left border border-dark-700/60 hover:border-primary-500/40 transition-all group"
                >
                  <p className="font-semibold text-white group-hover:text-primary-300">Admin Demo</p>
                  <p className="text-[10px] text-dark-400 truncate">admin@careerbridge.com</p>
                </button>
              </div>
            </div>

            {/* Link to Register */}
            <div className="mt-6 text-center text-sm text-dark-400">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                id="login-register-link"
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
