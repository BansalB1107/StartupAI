import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, ArrowRight, RefreshCw, LogIn } from 'lucide-react';
import API from './api';
import session from './session';

// Renders a dynamic animated gradient mesh background to enhance the visual authentication user experience.
function AuthBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[var(--bg)]" />
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #3B82F6, #1D4ED8 50%, transparent 70%)", filter: "blur(80px)" }}
        animate={{ x: [0, 60, -30, 0], y: [0, -50, 60, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #1D4ED8, #1E3A5F 50%, transparent 70%)", filter: "blur(100px)" }}
        animate={{ x: [0, -50, 30, 0], y: [0, 60, -40, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
}

// Renders the login OTP verification interface to validate codes and issue secure session tokens.
function VerifyLoginOTP() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const email     = location.state?.email || 'your email';

  const [otp,          setOtp]          = useState('');
  const [error,        setError]        = useState('');
  const [message,      setMessage]      = useState('');
  const [loading,      setLoading]      = useState(false);
  const [countdown,    setCountdown]    = useState(60);
  const [resendLoading,setResendLoading]= useState(false);
  const [toast,        setToast]        = useState({ show: false, message: '', type: 'success' });
  const [shake,        setShake]        = useState(false);

  const inputRef    = useRef(null);
  const isVerifying = useRef(false);

  // Displays a temporary floating toast notification providing visual feedback on authentication actions.
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Submits the provided OTP to securely authenticate the user and initialize their dashboard session.
  const handleVerify = useCallback(async (e, otpValue) => {
    if (e) e.preventDefault();
    const code = otpValue || otp;
    if (code.length !== 6 || isVerifying.current) return;
    isVerifying.current = true;
    setError(''); setMessage(''); setLoading(true);

    try {
      const res = await API.post('verify-login-otp/', { email, otp: code });
      const msg = res.data.message || 'Login successful! Redirecting...';
      setMessage(msg); showToast(msg, 'success');
      session.set('access',    res.data.access);
      session.set('refresh',   res.data.refresh);
      session.set('user_role', res.data.role);
      session.set('username',  res.data.username);
      setTimeout(() => {
        if (res.data.role === 'investor')    navigate('/investor-dashboard');
        else if (res.data.role === 'admin')  navigate('/admin-dashboard');
        else                                 navigate('/startup-dashboard');
      }, 1400);
    } catch (err) {
      const msg = err.response?.data?.error || 'OTP verification failed';
      setError(msg); showToast(msg, 'error');
      setShake(true); setTimeout(() => setShake(false), 500);
      setOtp(''); setTimeout(() => inputRef.current?.focus(), 50);
    } finally {
      setLoading(false); isVerifying.current = false;
    }
  }, [otp, email, navigate]);

  // Requests a fresh login OTP from the server if the previous code has expired.
  const handleResend = async () => {
    if (countdown > 0 || resendLoading) return;
    setResendLoading(true); setError(''); setMessage('');
    try {
      const res = await API.post('send-login-otp/', { email });
      const msg = res.data.message || 'Login OTP sent successfully';
      setMessage(msg); showToast(msg, 'success'); setCountdown(60);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to resend OTP';
      setError(msg); showToast(msg, 'error');
    } finally { setResendLoading(false); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AuthBackground />

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-[9999] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-semibold text-white text-sm"
            style={{
              background: toast.type === 'error' ? 'rgba(239,68,68,0.92)' : 'rgba(16,185,129,0.92)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
            }}
          >
            <span>{toast.type === 'error' ? '✕' : '✓'}</span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="relative rounded-3xl border overflow-hidden"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >

          <div className="p-8 md:p-10 space-y-7">
            {/* Header */}
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))",
                  border: "1px solid rgba(139,92,246,0.2)",
                  boxShadow: "0 0 30px rgba(139,92,246,0.15)",
                }}
              >
                <LogIn className="w-8 h-8 text-purple-400" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-black text-[var(--text)] tracking-tight">Security Check</h1>
                <p className="text-[var(--text-light)] text-sm mt-1">Enter your login code sent to</p>
                <p className="text-sm font-bold mt-0.5" style={{
                  backgroundImage: "linear-gradient(135deg, #60A5FA, #3B82F6)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>{email}</p>
              </div>
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {message && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-sm font-medium"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">✓</div>
                  {message}
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-red-400/10 border border-red-400/20 text-red-300 text-sm font-medium"
                >
                  <div className="w-5 h-5 rounded-full bg-red-400/20 flex items-center justify-center flex-shrink-0">!</div>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={(e) => handleVerify(e)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-widest">Login Code</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-lighter)] pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, '');
                      if (v.length > 6) return;
                      setOtp(v);
                      if (v.length === 6) handleVerify(null, v);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (otp.length === 6) handleVerify(null, otp); } }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const p = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
                      setOtp(p); if (p.length === 6) handleVerify(null, p);
                    }}
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    disabled={loading}
                    className="w-full pl-[110px] sm:pl-[130px] pr-4 py-3.5 rounded-xl text-[var(--text)] text-xl font-bold tracking-[0.4em] placeholder-[var(--text-lighter)] outline-none disabled:opacity-50 transition-all duration-200 text-left"
                    style={{
                      background: "var(--bg)",
                      border: `1px solid ${shake ? 'var(--error)' : 'var(--border)'}`,
                      animation: shake ? 'shake 0.5s ease-in-out' : 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                    onBlur={(e)  => { if (!shake) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                  />
                </div>
                {/* Digit indicator */}
                <div className="flex justify-center gap-2 pt-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full transition-all duration-200"
                      style={{ background: i < otp.length ? 'var(--grad)' : 'var(--border)' }}
                    />
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || otp.length !== 6}
                whileHover={!loading && otp.length === 6 ? { scale: 1.02, y: -1 } : {}}
                whileTap={!loading && otp.length === 6 ? { scale: 0.98 } : {}}
                className="relative w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-white text-sm overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--grad)",
                  boxShadow: loading || otp.length !== 6 ? "none" : "0 8px 20px rgba(139,92,246,0.25)",
                }}
              >
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)" }} />
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</>
                  : <><LogIn className="w-4 h-4" /> Verify & Sign In <ArrowRight className="w-4 h-4" /></>
                }
              </motion.button>
            </form>

            {/* Resend */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-[var(--text-light)] text-sm">
                  Resend code in <span className="font-bold text-[var(--text)]">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="flex items-center gap-1.5 mx-auto text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundImage: "linear-gradient(135deg, #60A5FA, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                >
                  {resendLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> : <RefreshCw className="w-3.5 h-3.5 text-purple-400" />}
                  {resendLoading ? 'Resending...' : 'Resend Code'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 55%, 85% { transform: translateX(-5px); }
          35%, 70% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default VerifyLoginOTP;