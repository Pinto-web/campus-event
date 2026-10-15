import React, { useState } from 'react';
import { Sparkles, Calendar, GraduationCap, ShieldCheck, User, Mail, Lock, KeyRound, Building, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LandingPortal({ onAuthSuccess, onGuestBrowse, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student'); // 'student' | 'admin'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science',
    studentId: '',
    adminPasscode: 'ADMIN123'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      sessionStorage.setItem('campus_token', data.token);
      sessionStorage.setItem('campus_user', JSON.stringify(data.user));

      showToast(data.message || 'Welcome to CampusPulse!', 'success');
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setErrorMsg(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-900/30 via-purple-900/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-24 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight font-sans">
              Campus<span className="gradient-text">Pulse</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              Events & Registration Portal
            </span>
          </div>
        </div>

        <button
          onClick={onGuestBrowse}
          className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2"
        >
          <span>Browse as Guest</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Hero & Authentication Card */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
        
        {/* Left Column: Hero Showcase */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Campus Event Discovery Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Discover, Register & Host <span className="gradient-text">Campus Events</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            The central portal for students to explore hackathons, workshops, and cultural fests with digital QR entrance passes and real-time seat capacity tracking.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 max-w-md">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-indigo-400 font-bold text-lg mb-0.5">🎓 For Students</div>
              <div className="text-xs text-slate-400">Register in one click & manage digital ticket passes</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-purple-400 font-bold text-lg mb-0.5">🛡️ For Organizers</div>
              <div className="text-xs text-slate-400">Track rosters, mark check-ins & export CSVs</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login / Signup Portal Card */}
        <div className="lg:col-span-6">
          <div className="glass-panel rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Role Selector Header */}
            <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => { setRole('student'); setErrorMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'student'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Student Account
              </button>

              <button
                type="button"
                onClick={() => { setRole('admin'); setErrorMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'admin'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Organizer Admin
              </button>
            </div>

            {/* Portal Heading */}
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-white">
                {isLogin
                  ? `${role === 'admin' ? 'Organizer Admin' : 'Student'} Sign In`
                  : `Create ${role === 'admin' ? 'Organizer Admin' : 'Student'} Account`}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isLogin
                  ? 'Sign in to access your digital passes and organizer tools.'
                  : 'Register your campus account to participate in upcoming events.'}
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Email or Name *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. alex.rivera@campus.edu or Alex Rivera"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Business & Management">Business & Management</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Arts & Humanities">Arts & Humanities</option>
                        <option value="Science">Science</option>
                        <option value="Student Life">Student Life</option>
                      </select>
                    </div>
                  </div>

                  {role === 'student' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Student ID (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. STU-8821"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {role === 'admin' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Security Passcode *</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-amber-400" />
                        <input
                          type="password"
                          required
                          placeholder="Default: ADMIN123"
                          value={formData.adminPasscode}
                          onChange={(e) => setFormData({ ...formData, adminPasscode: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Default admin passcode: <code className="text-amber-300">ADMIN123</code></span>
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 mt-6 ${
                  role === 'admin'
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/25'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25'
                }`}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to Portal' : 'Register Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign In / Sign Up */}
            <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
              {isLogin ? "Need a new account?" : 'Already registered?'}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
                className="ml-1.5 font-bold text-indigo-400 hover:text-indigo-300 underline"
              >
                {isLogin ? 'Sign Up Now' : 'Sign In'}
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-6 text-center text-xs text-slate-400">
        <div>CampusPulse Portal • MERN Stack Powered by MongoDB Atlas</div>
      </footer>

    </div>
  );
}
