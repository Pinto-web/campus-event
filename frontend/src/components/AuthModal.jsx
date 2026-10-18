import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, GraduationCap, ArrowRight, AlertCircle, KeyRound, Building, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ onClose, onAuthSuccess, showToast, initialRole = 'student' }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(initialRole); // 'student' | 'admin'

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
  const [showPassword, setShowPassword] = useState(false);

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

      // Save token and user in sessionStorage (tab-isolated for multi-tab support)
      sessionStorage.setItem('campus_token', data.token);
      sessionStorage.setItem('campus_user', JSON.stringify(data.user));

      showToast(data.message || 'Authenticated successfully!', 'success');
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Role Toggle Header */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setRole('student'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              role === 'student'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Student Portal
          </button>

          <button
            type="button"
            onClick={() => { setRole('admin'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              role === 'admin'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin Organizer
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-extrabold tracking-tight text-white">
            {isLogin
              ? `${role === 'admin' ? 'Organizer Admin' : 'Student'} Sign In`
              : `Create ${role === 'admin' ? 'Organizer Admin' : 'Student'} Account`}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isLogin
              ? 'Access your registered event passes and dashboard'
              : 'Sign up with your campus credentials to get started'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Email or Name *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. alex.rivera@campus.edu or Alex Rivera"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
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
                    <KeyRound className="absolute left-3 top-3 w-4 h-4 text-amber-400" />
                    <input
                      type="password"
                      required
                      placeholder="Default: ADMIN123"
                      value={formData.adminPasscode}
                      onChange={(e) => setFormData({ ...formData, adminPasscode: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
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
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Login vs Signup */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
          {isLogin ? "Don't have an account?" : 'Already registered?'}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            className="ml-1.5 font-bold text-indigo-400 hover:text-indigo-300 underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

      </div>
    </div>
  );
}
