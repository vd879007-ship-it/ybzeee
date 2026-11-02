'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import toast from 'react-hot-toast';

export function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(authModalMode || 'login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  React.useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setForgotSent(false);
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    try {
      await login(email, password);
    } catch {
      // Error handled in AuthProvider toast
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      await register({ name, email, phone, password });
    } catch {
      // Error handled in AuthProvider toast
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your registered email address');
      return;
    }
    setForgotSent(true);
    toast.success('Password reset instructions sent to your email!');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[var(--color-champagne)] overflow-hidden z-10 my-8"
        >
          <div className="bg-gradient-to-r from-[var(--color-dark)] via-[#2a2a2a] to-[var(--color-dark)] text-white p-6 relative">
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-[var(--color-primary-gold)]" />
              <span className="text-xs uppercase tracking-widest text-[var(--color-primary-gold)] font-medium">
                YEZ BEE FASHION
              </span>
            </div>

            <h3 className="font-playfair text-2xl text-white font-medium">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Join YEZ BEE Privilege'}
              {mode === 'forgot-password' && 'Reset Password'}
            </h3>
            <p className="text-xs text-white/70 mt-1">
              {mode === 'login' && 'Sign in to access your orders, wishlist, and rewards.'}
              {mode === 'register' && 'Create your account for personalized luxury shopping.'}
              {mode === 'forgot-password' && 'Enter your email to receive a password reset link.'}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {mode !== 'forgot-password' && (
              <div className="flex border-b border-gray-100 mb-6">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 pb-3 text-sm font-medium text-center border-b-2 transition-all ${
                    mode === 'login'
                      ? 'border-[var(--color-primary-gold)] text-[var(--color-dark)] font-semibold'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 pb-3 text-sm font-medium text-center border-b-2 transition-all ${
                    mode === 'register'
                      ? 'border-[var(--color-primary-gold)] text-[var(--color-dark)] font-semibold'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[var(--color-primary-gold)] focus:ring-1 focus:ring-[var(--color-primary-gold)] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-xs text-[var(--color-gold-dark)] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[var(--color-primary-gold)] focus:ring-1 focus:ring-[var(--color-primary-gold)] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-6 bg-[var(--color-dark)] text-white hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] rounded-xl font-medium text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Priya Sharma"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[var(--color-primary-gold)] focus:ring-1 focus:ring-[var(--color-primary-gold)] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[var(--color-primary-gold)] focus:ring-1 focus:ring-[var(--color-primary-gold)] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[var(--color-primary-gold)] focus:ring-1 focus:ring-[var(--color-primary-gold)] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Password * (Min. 8 characters)
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[var(--color-primary-gold)] focus:ring-1 focus:ring-[var(--color-primary-gold)] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-6 bg-[var(--color-dark)] text-white hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] rounded-xl font-medium text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {mode === 'forgot-password' && (
              <div>
                {forgotSent ? (
                  <div className="text-center py-6 space-y-4">
                    <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                    <h4 className="font-playfair text-lg text-gray-900 font-medium">Check Your Email</h4>
                    <p className="text-xs text-gray-600">
                      We have sent reset instructions to <strong>{email}</strong>.
                    </p>
                    <button
                      onClick={() => setMode('login')}
                      className="mt-4 text-xs text-[var(--color-gold-dark)] hover:underline font-medium"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                        Your Email Address
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[var(--color-primary-gold)] focus:ring-1 focus:ring-[var(--color-primary-gold)] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-6 bg-[var(--color-dark)] text-white hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      Send Reset Link
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-xs text-gray-500 hover:text-gray-800"
                      >
                        Cancel & Return to Sign In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
