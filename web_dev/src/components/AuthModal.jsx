import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Apple, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { CINEMATIC_EASE } from '../utils/animations';

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
        setError('Sign-in cancelled.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized in Firebase Console.');
      } else {
        setError(err.message || 'Authentication failed.');
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
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
          className="relative w-full max-w-sm bg-black border border-white/20 rounded-2xl p-8 shadow-2xl z-10 text-center"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-[#8a8a8a] hover:text-white p-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="default" />
          </div>

          <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
            SIGN IN TO ARCHIVE
          </h3>
          <p className="text-xs text-[#8a8a8a] mt-1.5 mb-6">
            Access your curated watchlist and synchronize taste profile across devices.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[#181818] border border-white/10 rounded-lg flex items-center space-x-2 text-xs text-[#d4d4d4] text-left">
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleLogin('Google', loginWithGoogle)}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-white/90 text-black text-xs font-black tracking-widest uppercase rounded-full flex items-center justify-center space-x-3 transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#000" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#000" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>CONTINUE WITH GOOGLE</span>
            </button>

            <button
              onClick={() => handleLogin('Apple', loginWithApple)}
              disabled={loading}
              className="w-full py-3 px-4 bg-[#121212] hover:bg-[#1c1c1c] text-white border border-white/20 text-xs font-black tracking-widest uppercase rounded-full flex items-center justify-center space-x-3 transition-all duration-200 disabled:opacity-50"
            >
              <Apple className="w-4 h-4 fill-current" />
              <span>CONTINUE WITH APPLE</span>
            </button>
          </div>

          <p className="text-[10px] text-[#555555] mt-6 tracking-wide uppercase">
            BY CONTINUING YOU ACCEPT TERMS OF SERVICE & PRIVACY POLICY.
          </p>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
