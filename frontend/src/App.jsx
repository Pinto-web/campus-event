import React, { useState, useEffect } from 'react';
import { Calendar, Ticket, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, Info, LogOut, ArrowLeft, LogIn } from 'lucide-react';
import EventDiscovery from './components/EventDiscovery';
import MyRegistrations from './components/MyRegistrations';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import LandingPortal from './components/LandingPortal';

export default function App() {
  const [activeTab, setActiveTab] = useState('discovery');
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRoleTarget, setAuthRoleTarget] = useState('student');

  useEffect(() => {
    const savedUser = sessionStorage.getItem('campus_user') || localStorage.getItem('campus_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setActiveTab(u.role === 'admin' ? 'admin' : 'discovery');
      } catch {
        sessionStorage.removeItem('campus_user');
        localStorage.removeItem('campus_user');
      }
    }
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('campus_token');
    sessionStorage.removeItem('campus_user');
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
    setCurrentUser(null);
    setGuestMode(false);
    setActiveTab('discovery');
    showToast('Logged out successfully', 'info');
  };

  const handleSelectTab = (tab) => {
    if (tab === 'admin') {
      if (!currentUser) {
        setAuthRoleTarget('admin');
        setShowAuthModal(true);
        showToast('Please sign in with an Admin account', 'info');
        return;
      } else if (currentUser.role !== 'admin') {
        showToast('Admin credentials required.', 'error');
        setAuthRoleTarget('admin');
        setShowAuthModal(true);
        return;
      }
    }
    setActiveTab(tab);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setGuestMode(false);
    setActiveTab(user.role === 'admin' ? 'admin' : 'discovery');
  };

  if (!currentUser && !guestMode) {
    return (
      <LandingPortal
        onAuthSuccess={handleAuthSuccess}
        onGuestBrowse={() => setGuestMode(true)}
        showToast={showToast}
      />
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F6F4EF]">

      {/* ── Header ── */}
      <header className="site-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => setActiveTab(isAdmin ? 'admin' : 'discovery')}
            className="flex items-center gap-2.5 group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm ${isAdmin ? 'bg-[#5b21b6]' : 'bg-[#1e3a5f]'}`}>
              <Calendar className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </div>
            <div className="text-left">
              <div className="text-base font-black tracking-tight text-stone-900 leading-none" style={{fontFamily:'Fraunces,Georgia,serif'}}>
                Campus<span className="text-[#d95b2b]">Pulse</span>
              </div>
              <div className="section-label leading-none mt-0.5">
                {isAdmin ? 'Organizer Suite' : 'Student Portal'}
              </div>
            </div>
          </button>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 bg-stone-100 border border-stone-200 p-1 rounded-xl shadow-sm">
            {isAdmin ? (
              <>
                <button
                  onClick={() => handleSelectTab('admin')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'admin'
                      ? 'bg-[#5b21b6] text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Organizer Suite
                </button>
                <button
                  onClick={() => handleSelectTab('discovery')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'discovery'
                      ? 'bg-[#1e3a5f] text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Events Preview
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSelectTab('discovery')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'discovery'
                      ? 'bg-[#1e3a5f] text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Discover Events
                </button>
                <button
                  onClick={() => handleSelectTab('my-passes')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'my-passes'
                      ? 'bg-[#1e3a5f] text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" /> My Passes
                </button>
              </>
            )}
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-1.5 shadow-sm transition-shadow hover:shadow-md">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-stone-800 leading-tight">{currentUser.name}</div>
                  <div className={`text-[10px] font-semibold uppercase tracking-wide leading-tight ${isAdmin ? 'text-violet-600' : 'text-[#d95b2b]'}`}>
                    {isAdmin ? '🛡️ Admin' : '🎓 Student'}
                  </div>
                </div>
                <div className="w-px h-7 bg-stone-200" />
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGuestMode(false)}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Portal
                </button>
                <button
                  onClick={() => { setAuthRoleTarget('student'); setShowAuthModal(true); }}
                  className="btn-primary py-1.5 px-4 text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin ? (
          <>
            {activeTab === 'admin' && <AdminDashboard showToast={showToast} currentUser={currentUser} />}
            {activeTab === 'discovery' && <EventDiscovery showToast={showToast} currentUser={currentUser} />}
          </>
        ) : (
          <>
            {activeTab === 'discovery' && <EventDiscovery showToast={showToast} currentUser={currentUser} />}
            {activeTab === 'my-passes' && <MyRegistrations showToast={showToast} currentUser={currentUser} />}
          </>
        )}
      </main>

      {/* ── Auth Modal ── */}
      {showAuthModal && (
        <AuthModal
          initialRole={authRoleTarget}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          showToast={showToast}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-slideUp">
          <div className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-sm font-semibold ${
            toast.type === 'success' ? 'toast-success'
            : toast.type === 'error' ? 'toast-error'
            : 'toast-info'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 bg-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-400">
          <div className="font-semibold text-stone-500">
            CampusPulse Portal &mdash; MERN Full-Stack Application
          </div>
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <>
                <span className="hover:text-stone-700 cursor-pointer transition-colors" onClick={() => handleSelectTab('admin')}>Organizer Suite</span>
                <span>·</span>
                <span className="hover:text-stone-700 cursor-pointer transition-colors" onClick={() => handleSelectTab('discovery')}>Event Preview</span>
              </>
            ) : (
              <>
                <span className="hover:text-stone-700 cursor-pointer transition-colors" onClick={() => handleSelectTab('discovery')}>Discover Events</span>
                <span>·</span>
                <span className="hover:text-stone-700 cursor-pointer transition-colors" onClick={() => handleSelectTab('my-passes')}>My Passes</span>
              </>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
