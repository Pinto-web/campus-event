import React, { useState, useEffect } from 'react';
import { Calendar, Ticket, ShieldCheck, Moon, Sun, Sparkles, CheckCircle2, AlertCircle, Info, User, LogOut, LogIn, ArrowLeft } from 'lucide-react';
import EventDiscovery from './components/EventDiscovery';
import MyRegistrations from './components/MyRegistrations';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import LandingPortal from './components/LandingPortal';

export default function App() {
  const [activeTab, setActiveTab] = useState('discovery'); // 'discovery' | 'my-passes' | 'admin'
  const [darkMode, setDarkMode] = useState(true);
  const [toast, setToast] = useState(null);

  // Auth & View States
  const [currentUser, setCurrentUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRoleTarget, setAuthRoleTarget] = useState('student');

  useEffect(() => {
    // Load tab-isolated session first, fallback to localStorage
    const savedUser = sessionStorage.getItem('campus_user') || localStorage.getItem('campus_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        if (u.role === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('discovery');
        }
      } catch (e) {
        sessionStorage.removeItem('campus_user');
        localStorage.removeItem('campus_user');
      }
    }
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
        showToast('Please sign in with an Admin account to access Organizer Suite', 'info');
        return;
      } else if (currentUser.role !== 'admin') {
        showToast('Your account is registered as Student. Admin credentials required.', 'error');
        setAuthRoleTarget('admin');
        setShowAuthModal(true);
        return;
      }
    }
    setActiveTab(tab);
  };

  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    setGuestMode(false);
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('discovery');
    }
  };

  // Unauthenticated & Not Guest -> Show Initial Landing Sign In / Signup View
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
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab(isAdmin ? 'admin' : 'discovery')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${isAdmin ? 'from-purple-600 to-indigo-600' : 'from-indigo-600 to-pink-500'} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight font-sans">
                Campus<span className="gradient-text">Pulse</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                {isAdmin ? 'Organizer Control Center' : 'Student Portal'}
              </span>
            </div>
          </div>

          {/* Dynamic Navigation Tabs based on Role */}
          <nav className="flex items-center p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            {isAdmin ? (
              // ADMIN INTERFACE NAVIGATION
              <>
                <button
                  onClick={() => handleSelectTab('admin')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'admin'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Organizer Suite</span>
                </button>

                <button
                  onClick={() => handleSelectTab('discovery')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'discovery'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Events Preview</span>
                </button>
              </>
            ) : (
              // STUDENT INTERFACE NAVIGATION
              <>
                <button
                  onClick={() => handleSelectTab('discovery')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'discovery'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discover Events</span>
                </button>

                <button
                  onClick={() => handleSelectTab('my-passes')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'my-passes'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>My Passes</span>
                </button>
              </>
            )}
          </nav>

          {/* User Controls & Session Badge */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 pl-3.5">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-100">{currentUser.name}</div>
                  <div className={`text-[10px] font-semibold uppercase ${isAdmin ? 'text-purple-400' : 'text-indigo-400'}`}>
                    {isAdmin ? '🛡️ Admin Organizer' : '🎓 Student'}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGuestMode(false)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:border-slate-700 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Portal
                </button>
                <button
                  onClick={() => { setAuthRoleTarget('student'); setShowAuthModal(true); }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>

        </div>
      </header>

      {/* Interface Rendering */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin ? (
          // ADMIN ROLE INTERFACE VIEWS
          <>
            {activeTab === 'admin' && <AdminDashboard showToast={showToast} currentUser={currentUser} />}
            {activeTab === 'discovery' && <EventDiscovery showToast={showToast} currentUser={currentUser} />}
          </>
        ) : (
          // STUDENT ROLE INTERFACE VIEWS
          <>
            {activeTab === 'discovery' && <EventDiscovery showToast={showToast} currentUser={currentUser} />}
            {activeTab === 'my-passes' && <MyRegistrations showToast={showToast} currentUser={currentUser} />}
          </>
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          initialRole={authRoleTarget}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          showToast={showToast}
        />
      )}

      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div
            className={`px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-300'
                : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-300'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-16 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-semibold text-slate-300">CampusPulse Portal</span> • MERN Full-Stack Application
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            {isAdmin ? (
              <>
                <span className="hover:text-slate-200 cursor-pointer" onClick={() => handleSelectTab('admin')}>Organizer Suite</span>
                <span>•</span>
                <span className="hover:text-slate-200 cursor-pointer" onClick={() => handleSelectTab('discovery')}>Event Preview</span>
              </>
            ) : (
              <>
                <span className="hover:text-slate-200 cursor-pointer" onClick={() => handleSelectTab('discovery')}>Discover Events</span>
                <span>•</span>
                <span className="hover:text-slate-200 cursor-pointer" onClick={() => handleSelectTab('my-passes')}>My Passes</span>
              </>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
