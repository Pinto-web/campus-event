import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, BarChart3, CheckCircle2, Download, Trash2, Edit3, X, RefreshCw, AlertCircle, Eye, Sparkles } from 'lucide-react';

export default function AdminDashboard({ showToast }) {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedRosterEvent, setSelectedRosterEvent] = useState(null);
  const [rosterData, setRosterData] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  // New Event Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    department: 'Computer Science',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 01:00 PM',
    location: 'Main Auditorium, Building A',
    speaker: '',
    speakerRole: 'Guest Speaker',
    capacity: 50,
    status: 'Published',
    bannerGradient: 'from-indigo-600 via-purple-600 to-pink-600',
    tags: 'Hackathon, Tech, Student'
  });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [eventsRes, statsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/events/stats')
      ]);

      const eventsJson = await eventsRes.json();
      const statsJson = await statsRes.json();

      if (eventsRes.ok) setEvents(eventsJson.data || []);
      if (statsRes.ok) setStats(statsJson.data || null);
    } catch (err) {
      console.error(err);
      showToast('Error loading dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Event status updated to ${newStatus}`, 'success');
        loadDashboard();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Network error updating status', 'error');
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Event deleted successfully', 'info');
        loadDashboard();
      } else {
        showToast('Failed to delete event', 'error');
      }
    } catch (err) {
      showToast('Network error deleting event', 'error');
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const url = editingEvent ? `/api/events/${editingEvent.id || editingEvent._id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventForm,
          capacity: Number(eventForm.capacity),
          tags: typeof eventForm.tags === 'string' ? eventForm.tags.split(',').map(t => t.trim()) : eventForm.tags
        })
      });

      if (res.ok) {
        showToast(`Event ${editingEvent ? 'updated' : 'created'} successfully!`, 'success');
        setShowCreateModal(false);
        setEditingEvent(null);
        loadDashboard();
      } else {
        showToast('Failed to save event', 'error');
      }
    } catch (err) {
      showToast('Network error saving event', 'error');
    }
  };

  const openRoster = async (event) => {
    setSelectedRosterEvent(event);
    setLoadingRoster(true);
    try {
      const res = await fetch(`/api/registrations/event/${event.id || event._id}`);
      const data = await res.json();
      if (res.ok) {
        setRosterData(data.data || []);
      } else {
        showToast('Failed to fetch roster', 'error');
      }
    } catch (err) {
      showToast('Error loading roster', 'error');
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleToggleCheckIn = async (regId) => {
    try {
      const res = await fetch(`/api/registrations/${regId}/checkin`, { method: 'PUT' });
      const data = await res.json();
      if (res.ok) {
        setRosterData(prev => prev.map(r => r.id === regId || r._id === regId ? data.data : r));
        showToast('Check-in status updated', 'success');
        loadDashboard(); // Refresh stats
      }
    } catch (err) {
      showToast('Check-in update failed', 'error');
    }
  };

  const exportRosterCSV = () => {
    if (!rosterData.length || !selectedRosterEvent) return;
    
    const headers = ['Student Name', 'Campus Email', 'Student ID', 'Department', 'Pass Code', 'Checked In', 'Registered At'];
    const rows = rosterData.map(r => [
      `"${r.studentName}"`,
      `"${r.studentEmail}"`,
      `"${r.studentId}"`,
      `"${r.department}"`,
      `"${r.passCode}"`,
      r.checkedIn ? 'YES' : 'NO',
      `"${r.registeredAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedRosterEvent.title.replace(/[^a-zA-Z0-9]/g, '_')}_Attendee_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      category: 'Workshop',
      department: 'Computer Science',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM - 01:00 PM',
      location: 'Main Auditorium, Building A',
      speaker: '',
      speakerRole: 'Guest Speaker',
      capacity: 50,
      status: 'Published',
      bannerGradient: 'from-indigo-600 via-purple-600 to-pink-600',
      tags: 'Hackathon, Tech, Student'
    });
    setShowCreateModal(true);
  };

  const openEditModal = (evt) => {
    setEditingEvent(evt);
    setEventForm({
      title: evt.title,
      description: evt.description || '',
      category: evt.category || 'Workshop',
      department: evt.department || 'Computer Science',
      date: evt.date,
      time: evt.time || '10:00 AM',
      location: evt.location || 'Main Auditorium',
      speaker: evt.speaker || '',
      speakerRole: evt.speakerRole || 'Speaker',
      capacity: evt.capacity || 50,
      status: evt.status || 'Published',
      bannerGradient: evt.bannerGradient || 'from-indigo-600 to-purple-600',
      tags: Array.isArray(evt.tags) ? evt.tags.join(', ') : (evt.tags || '')
    });
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" /> Organizer Admin Suite
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Event Listings & Roster Control</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage listings, track capacity utilization, review registrations, and handle check-ins.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Campus Event
        </button>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Total Events</div>
            <div className="text-2xl font-extrabold text-white">{stats.totalEvents}</div>
            <div className="text-[10px] text-indigo-400">Active across campus</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Registrations</div>
            <div className="text-2xl font-extrabold text-emerald-400">{stats.totalRegistrations}</div>
            <div className="text-[10px] text-emerald-300">Issued student passes</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Avg Capacity Util.</div>
            <div className="text-2xl font-extrabold text-purple-400">{stats.avgCapacityUtil}%</div>
            <div className="text-[10px] text-purple-300">Seat fill rate</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Check-in Rate</div>
            <div className="text-2xl font-extrabold text-amber-400">{stats.checkInRate}%</div>
            <div className="text-[10px] text-amber-300">{stats.checkedInCount} checked in</div>
          </div>
        </div>
      )}

      {/* Event Listings Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Active Campus Event Listings
          </h3>
          <button
            onClick={loadDashboard}
            className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading event roster database...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 uppercase font-semibold text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Department & Category</th>
                  <th className="py-3 px-4">Date & Location</th>
                  <th className="py-3 px-4">Capacity / Registered</th>
                  <th className="py-3 px-4">Status State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {events.map((evt) => (
                  <tr key={evt.id || evt._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100 text-sm">{evt.title}</div>
                      <div className="text-[11px] text-slate-400">Speaker: {evt.speaker || 'TBA'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200 block">{evt.department}</span>
                      <span className="text-[10px] text-indigo-400 font-semibold uppercase">{evt.category}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>{evt.date}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{evt.location}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200">
                        {evt.registeredCount} / {evt.capacity}
                      </div>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${Math.min(100, (evt.registeredCount / evt.capacity) * 100)}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={evt.status}
                        onChange={(e) => handleStatusChange(evt.id || evt._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold focus:outline-none border border-slate-700 ${
                          evt.status === 'Published'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : evt.status === 'Sold Out'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : evt.status === 'Cancelled'
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        <option value="Published" className="bg-slate-900 text-emerald-400">Published</option>
                        <option value="Sold Out" className="bg-slate-900 text-rose-400">Sold Out</option>
                        <option value="Draft" className="bg-slate-900 text-amber-400">Draft</option>
                        <option value="Completed" className="bg-slate-900 text-blue-400">Completed</option>
                        <option value="Cancelled" className="bg-slate-900 text-slate-400">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openRoster(evt)}
                        title="View Attendee Roster"
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white font-semibold text-[11px] inline-flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" /> Roster
                      </button>

                      <button
                        onClick={() => openEditModal(evt)}
                        title="Edit Event"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(evt.id || evt._id, evt.title)}
                        title="Delete Event"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl glass-panel rounded-3xl border border-slate-700 p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-xl font-extrabold text-white">
                {editingEvent ? 'Edit Event Details' : 'Create New Campus Event'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={eventForm.department}
                    onChange={(e) => setEventForm({ ...eventForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Venue *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Speaker / Host</label>
                  <input
                    type="text"
                    value={eventForm.speaker}
                    onChange={(e) => setEventForm({ ...eventForm, speaker: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg"
                >
                  {editingEvent ? 'Save Changes' : 'Publish Campus Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendee Roster Modal */}
      {selectedRosterEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl glass-panel rounded-3xl border border-slate-700 p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Attendee Roster</span>
                <h3 className="text-xl font-extrabold text-white">{selectedRosterEvent.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total Registrations: {rosterData.length} / {selectedRosterEvent.capacity}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={exportRosterCSV}
                  disabled={!rosterData.length}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>

                <button
                  onClick={() => setSelectedRosterEvent(null)}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingRoster ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading attendee list...</div>
            ) : rosterData.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">No students registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 uppercase font-semibold text-[10px] text-slate-400">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Email & ID</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Pass Code</th>
                      <th className="p-3">Check-in Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {rosterData.map((reg) => (
                      <tr key={reg.id || reg._id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-semibold text-slate-100">{reg.studentName}</td>
                        <td className="p-3">
                          <div>{reg.studentEmail}</div>
                          <div className="text-[10px] text-indigo-400 font-mono">{reg.studentId}</div>
                        </td>
                        <td className="p-3 text-slate-300">{reg.department}</td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">{reg.passCode}</td>
                        <td className="p-3">
                          {reg.checkedIn ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Checked In
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleCheckIn(reg.id || reg._id)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              reg.checkedIn
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            }`}
                          >
                            {reg.checkedIn ? 'Undo Check-in' : 'Mark Checked In'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
