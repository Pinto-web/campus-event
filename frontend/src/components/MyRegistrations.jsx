import React, { useState, useEffect } from 'react';
import { Search, Ticket, Calendar, MapPin, Trash2, QrCode, AlertCircle, RefreshCw } from 'lucide-react';
import TicketPassModal from './TicketPassModal';

export default function MyRegistrations({ showToast, currentUser }) {
  const [studentId, setStudentId] = useState(currentUser?.studentId || 'STU-8821');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePass, setActivePass] = useState(null);

  const fetchUserRegistrations = async () => {
    if (!studentId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/registrations/user/${encodeURIComponent(studentId.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setRegistrations(data.data || []);
      } else {
        showToast('Could not fetch registrations', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error fetching registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRegistrations();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUserRegistrations();
  };

  const handleCancelRegistration = async (regId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to cancel your pass for "${eventTitle}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Registration cancelled. Seat restored.', 'info');
        fetchUserRegistrations();
      } else {
        showToast(data.message || 'Failed to cancel registration', 'error');
      }
    } catch (err) {
      showToast('Network error cancelling registration', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Ticket className="w-4 h-4" /> Student Portal
          </div>
          <h2 className="text-2xl font-extrabold text-white">My Registered Event Passes</h2>
          <p className="text-slate-400 text-xs mt-1">Manage active tickets, download entrance QR codes, or cancel reservations.</p>
        </div>

        {/* Student Lookup Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Student ID (e.g. STU-8821)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            Lookup Passes
          </button>
        </form>
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
          <span className="text-slate-400 text-xs">Retrieving your event history...</span>
        </div>
      ) : registrations.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center border border-slate-800 space-y-3">
          <Ticket className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Registrations Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            No active event passes registered under Student ID "{studentId}". Try discovering events from the main tab!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registrations.map((reg) => (
            <div
              key={reg.id || reg._id}
              className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {reg.department}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {reg.passCode}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 line-clamp-2">
                  {reg.eventTitle}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{reg.eventDate} ({reg.eventTime})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{reg.eventLocation}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setActivePass(reg)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <QrCode className="w-3.5 h-3.5" /> View Pass QR
                </button>

                <button
                  onClick={() => handleCancelRegistration(reg.id || reg._id, reg.eventTitle)}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Cancel Pass
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {activePass && (
        <TicketPassModal
          registration={activePass}
          onClose={() => setActivePass(null)}
        />
      )}

    </div>
  );
}
