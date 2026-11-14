import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email.trim(), password, fullName.trim());
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please check your information.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col selection:bg-primary-500/30 selection:text-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-primary-600/15 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fade-in my-8">
          {/* Glass Card */}
          <div className="glass-card p-8 sm:p-10 border-dark-700/80 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Create Account
              </h2>
              <p className="text-sm text-dark-400 mt-2">
                Join CareerBridge and jumpstart your career with AI
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                id="register-error-alert"
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm animate-fade-in"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="register-name-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

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
                    id="register-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-2">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    id="register-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    id="register-confirm-password-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="register-submit-btn"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <UserPlus className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Link to Login */}
            <div className="mt-6 text-center text-sm text-dark-400">
              Already have an account?{' '}
              <Link
                to="/login"
                id="register-login-link"
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
