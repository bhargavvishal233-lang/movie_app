import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Apple, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginWithGoogle, loginWithApple } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setError(null);
  };

  const handleLogin = async (providerName, loginFunction) => {
    setError(null);
    setLoading(true);
    try {
      await loginFunction();
      handleClose();
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for authentication. Check Firebase Console.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-900/10 overflow-hidden"
        >
          {/* Accent Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                Welcome Back
              </h2>
              <p className="text-sm text-slate-400">
                Sign in to save your watchlist and get better AI recommendations.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-950/50 border border-red-900/50 rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-red-300 font-medium">{error}</span>
              </div>
            )}

            {/* Auth Buttons */}
            <div className="space-y-3.5">
              
              {/* Google Button */}
              <button
                onClick={() => handleLogin('Google', loginWithGoogle)}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none group"
              >
                {/* Custom Google SVG Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Apple Button */}
              <button
                onClick={() => handleLogin('Apple', loginWithApple)}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 bg-slate-950 hover:bg-black text-white rounded-xl border border-slate-800 hover:border-slate-700 font-bold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none group"
              >
                <Apple className="w-5 h-5 fill-white" />
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-[11px] text-slate-500 mt-6 leading-relaxed">
              By continuing, you agree to our <br/>
              <a href="#" className="text-slate-400 hover:text-white underline underline-offset-2">Terms of Service</a> and <a href="#" className="text-slate-400 hover:text-white underline underline-offset-2">Privacy Policy</a>.
            </p>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
