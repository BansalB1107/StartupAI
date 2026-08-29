import React, { useState } from 'react';
import API from './api';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Loader2, ArrowRight, Rocket, Building2, BrainCircuit } from 'lucide-react';

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
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-8"
        style={{ background: "radial-gradient(circle, #2563EB, #0F172A 60%, transparent 70%)", filter: "blur(120px)" }}
        animate={{ scale: [1, 1.3, 0.8, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
    </div>
  );
}

// Renders the user registration interface capturing role selection and initial account creation details.
function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', role: 'startup' });
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // Updates component state dynamically as the user types their registration details into the inputs.
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Submits registration details to the backend to create an account and dispatch verification emails.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    try {
      const res = await API.post('register/', formData);
      setMessage(res.data.message || 'OTP sent! Check your inbox.');
      setTimeout(() => navigate('/verify-otp', { state: { email: formData.email } }), 800);
    } catch (err) {
      setError(
        typeof err.response?.data === 'object'
          ? Object.values(err.response.data).flat().join(', ')
          : err.response?.data?.error || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'startup', icon: Rocket, label: 'Founder / Startup', desc: 'Build & get funded' },
    { value: 'investor', icon: Building2, label: 'Investor', desc: 'Discover & invest' },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
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
                <BrainCircuit className="w-8 h-8 text-purple-400" />
              </motion.div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="font-black text-[var(--text)] text-xl">Startup</span>
                  <span className="font-black text-xl" style={{
                    backgroundImage: "linear-gradient(135deg, #60A5FA, #3B82F6)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                  }}>AI</span>
                </div>
                <h1 className="text-3xl font-black text-[var(--text)] tracking-tight">Create Account</h1>
                <p className="text-[var(--text-light)] text-sm mt-1">Join 3,400+ founders and investors</p>
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
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-widest">I am joining as</label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: opt.value })}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 ${
                        formData.role === opt.value
                          ? 'border-[var(--primary)] bg-[var(--primary-glow)] text-[var(--primary)]'
                          : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-light)] hover:bg-[var(--primary-light)]'
                      }`}
                    >
                      <opt.icon className={`w-5 h-5 ${formData.role === opt.value ? 'text-[var(--primary)]' : ''}`} />
                      <div className="text-center">
                        <p className="text-xs font-bold text-[var(--text)]">{opt.label}</p>
                        <p className="text-[10px] opacity-80 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-widest">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-lighter)] pointer-events-none" />
                  <input type="text" name="username" placeholder="yourname" value={formData.username}
                    onChange={handleChange} required disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[var(--text)] text-sm placeholder-[var(--text-lighter)] outline-none disabled:opacity-50 transition-all duration-200"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-lighter)] pointer-events-none" />
                  <input type="email" name="email" placeholder="name@company.com" value={formData.email}
                    onChange={handleChange} required disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[var(--text)] text-sm placeholder-[var(--text-lighter)] outline-none disabled:opacity-50 transition-all duration-200"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="relative w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-white text-sm overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "var(--grad)",
                  boxShadow: loading ? "none" : "0 8px 20px rgba(139,92,246,0.25)",
                }}
              >
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)" }} />
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                  : <><BrainCircuit className="w-4 h-4" /> Join StartupAI <ArrowRight className="w-4 h-4" /></>
                }
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-[var(--text-lighter)] text-xs">secure · encrypted</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
          </div>
        </div>

        {/* Sign in link */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-center text-[var(--text-light)] text-sm mt-5"
        >
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:opacity-80 transition-opacity"
            style={{ backgroundImage: "linear-gradient(135deg, #60A5FA, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
          >
            Sign in here
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Register;