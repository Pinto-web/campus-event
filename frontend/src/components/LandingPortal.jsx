import React, { useState } from 'react';
import { Calendar, GraduationCap, ShieldCheck, User, Mail, Lock, KeyRound, Building, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

const FEATURES = [
  { icon: '🗓️', title: 'Live Event Feed', desc: 'Hackathons, workshops, cultural fests & seminars — all in one place.' },
  { icon: '🎟️', title: 'Digital Passes', desc: 'Instant QR ticket issued on registration. No printing needed.' },
  { icon: '📊', title: 'Real-Time Seats', desc: 'Capacity tracker updates live so you never miss an open spot.' },
  { icon: '🛡️', title: 'Organizer Tools', desc: 'Admin dashboard with roster management, check-in & CSV export.' },
];

const DEPT_OPTIONS = [
  'Computer Science', 'Business & Management', 'Engineering',
  'Arts & Humanities', 'Science', 'Student Life'
];

export default function LandingPortal({ onAuthSuccess, onGuestBrowse, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    department: 'Computer Science', studentId: '', adminPasscode: 'ADMIN123'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const set = (k) => (e) => setFormData({ ...formData, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { ...formData, role };
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');
      sessionStorage.setItem('campus_token', data.token);
      sessionStorage.setItem('campus_user', JSON.stringify(data.user));
      showToast(data.message || 'Welcome to CampusPulse!', 'success');
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EF] flex flex-col">

      {/* ── Header ── */}
      <header className="site-header sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 h-15 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1e3a5f] flex items-center justify-center shadow-lg shadow-slate-900/15">
              <Calendar className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <div className="text-base font-black leading-none text-stone-900" style={{fontFamily:'Fraunces,Georgia,serif'}}>
                Campus<span className="text-[#d95b2b]">Pulse</span>
              </div>
              <div className="section-label mt-0.5 leading-none">Events & Registration Portal</div>
            </div>
          </div>
          <button onClick={onGuestBrowse} className="btn-secondary text-xs py-2">
            Browse as Guest <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Hero + Auth ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-10 sm:py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* Left — Hero */}
        <div className="space-y-8 pt-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-widest border border-orange-200 mb-5">
              Campus Event Hub
            </span>
            <h1 className="text-5xl sm:text-6xl font-black text-[#1e3a5f] leading-[1.05] tracking-tight">
              Discover &<br />Register for<br />
              <span className="text-[#d95b2b]">Campus Events</span>
            </h1>
            <p className="mt-4 text-stone-500 text-base leading-relaxed max-w-md">
              The central portal for students to explore hackathons, workshops, and cultural fests — with digital QR passes and real-time seat tracking.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-flat p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-2xl mb-1.5">{f.icon}</div>
                <div className="text-sm font-bold text-stone-800 mb-0.5">{f.title}</div>
                <div className="text-xs text-stone-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Auth Card */}
        <div className="card rounded-2xl p-7 sm:p-8 shadow-xl sticky top-24 border-stone-200/90">

          {/* Role Toggle */}
          <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 p-1 rounded-xl mb-6">
            {['student', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  role === r
                    ? r === 'admin'
                      ? 'bg-[#5b21b6] text-white shadow-sm'
                      : 'bg-[#1e3a5f] text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {r === 'student' ? <GraduationCap className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                {r === 'student' ? 'Student' : 'Organizer Admin'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h2 className="text-2xl font-black text-stone-900" style={{fontFamily:'Fraunces,Georgia,serif'}}>
              {isLogin
                ? `${role === 'admin' ? 'Organizer' : 'Student'} Sign In`
                : `Create ${role === 'admin' ? 'Organizer' : 'Student'} Account`}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {isLogin ? 'Access your passes and campus tools.' : 'Register to participate in upcoming events.'}
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <label className="block">
                <span className="text-xs font-semibold text-stone-600 mb-1 block">Full Name *</span>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input type="text" required placeholder="e.g. Alex Rivera" value={formData.name} onChange={set('name')}
                    className="input-field pl-9" />
                </div>
              </label>
            )}

            <label className="block">
              <span className="text-xs font-semibold text-stone-600 mb-1 block">Campus Email or Name *</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="text" required placeholder="alex.rivera@campus.edu" value={formData.email} onChange={set('email')}
                  className="input-field pl-9" />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-stone-600 mb-1 block">Password *</span>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type={showPassword ? 'text' : 'password'} required minLength={6} placeholder="••••••••" value={formData.password} onChange={set('password')}
                  className="input-field pl-9 pr-10" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            {!isLogin && (
              <>
                <label className="block">
                  <span className="text-xs font-semibold text-stone-600 mb-1 block">Department</span>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <select value={formData.department} onChange={set('department')} className="input-field pl-9">
                      {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </label>

                {role === 'student' && (
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-600 mb-1 block">Student ID (Optional)</span>
                    <input type="text" placeholder="e.g. STU-8821" value={formData.studentId} onChange={set('studentId')}
                      className="input-field" />
                  </label>
                )}

                {role === 'admin' && (
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-600 mb-1 block">Admin Security Passcode *</span>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                      <input type="password" required placeholder="Default: ADMIN123" value={formData.adminPasscode} onChange={set('adminPasscode')}
                        className="input-field pl-9 border-amber-300 focus:border-amber-400" />
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">Default passcode: <code className="text-amber-600 font-mono">ADMIN123</code></p>
                  </label>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 mt-1 flex items-center justify-center gap-2 text-sm font-bold text-white rounded-xl transition-all shadow-sm ${
                role === 'admin'
                  ? 'bg-[#5b21b6] hover:bg-[#4c1d95]'
                  : 'bg-[#d95b2b] hover:bg-[#c04f24]'
              }`}
            >
              {loading ? 'Please wait...' : (
                <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-5 text-center text-xs text-stone-400 border-t border-stone-100 pt-4">
            {isLogin ? "Don't have an account?" : 'Already registered?'}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
              className="font-bold text-[#d95b2b] hover:underline ml-1">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 bg-white py-5 text-center text-xs text-stone-400">
        CampusPulse Portal &mdash; Powered by MongoDB Atlas &amp; React
      </footer>
    </div>
  );
}
