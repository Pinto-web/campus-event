import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Tag, CheckCircle2, AlertCircle, X, Users, Sparkles } from 'lucide-react';

export default function EventModal({ event, onClose, onRegisterSuccess, showToast, currentUser }) {
  const [formData, setFormData] = useState({
    studentName: currentUser?.name || '',
    studentEmail: currentUser?.email || '',
    studentId: currentUser?.studentId || 'STU-' + Math.floor(1000 + Math.random() * 9000),
    department: currentUser?.department || 'Computer Science'
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!event) return null;

  const seatsLeft = event.capacity - event.registeredCount;
  const isSoldOut = seatsLeft <= 0 || event.status === 'Sold Out';
  const capacityPct = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.studentEmail || !formData.studentId) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id || event._id,
          ...formData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      showToast('Registration successful! Pass issued.', 'success');
      onRegisterSuccess(data.data);
    } catch (err) {
      setErrorMsg(err.message);
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl glass-panel rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden my-8">
        
        {/* Modal Banner Header */}
        <div className={`p-6 sm:p-8 bg-gradient-to-r ${event.bannerGradient || 'from-indigo-600 to-purple-600'} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/40 text-white/90 hover:bg-slate-900/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-md border border-white/20 uppercase tracking-wider">
              {event.category}
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-900/40 text-slate-200">
              {event.department}
            </span>
            {isSoldOut ? (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/90 text-white">
                Sold Out
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/90 text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {seatsLeft} Seats Remaining
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            {event.title}
          </h2>

          <div className="flex flex-wrap gap-4 text-sm text-slate-100 mt-4">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-indigo-200" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-indigo-200" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <MapPin className="w-4 h-4 text-indigo-200" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-200">
          
          {/* Capacity Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-indigo-400" /> Capacity Tracker
              </span>
              <span className="font-semibold text-slate-200">
                {event.registeredCount} / {event.capacity} Registered ({capacityPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  capacityPct >= 90 ? 'bg-rose-500' : capacityPct >= 75 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>

          {/* Description & Speaker */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">About Event</h4>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Featured Speaker</div>
                  <div className="font-semibold text-slate-100">{event.speaker || 'Guest Speaker'}</div>
                  <div className="text-xs text-indigo-400">{event.speakerRole || 'Keynote Host'}</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Tags & Topics</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {event.tags && event.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Event Agenda</h4>
              <div className="space-y-2">
                {event.agenda.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-slate-800/50 text-xs sm:text-sm">
                    <span className="font-mono text-indigo-400 font-semibold">{item.time}</span>
                    <span className="text-slate-200 font-medium">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Form */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-lg font-bold text-slate-100 mb-1">Reserve Your Spot</h3>
            <p className="text-xs text-slate-400 mb-4">Enter your student information to generate an instant digital event pass.</p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. maya.lin@campus.edu"
                    value={formData.studentEmail}
                    onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-9942"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
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

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || isSoldOut}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center gap-2 ${
                    isSoldOut
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25 active:scale-95'
                  }`}
                >
                  {submitting ? (
                    <span>Issuing Pass...</span>
                  ) : isSoldOut ? (
                    <span>Sold Out</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Register & Issue Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
