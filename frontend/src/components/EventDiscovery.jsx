import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Filter, Sparkles, User, Tag, ArrowRight, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import EventModal from './EventModal';
import TicketPassModal from './TicketPassModal';

export default function EventDiscovery({ showToast, currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [issuedPass, setIssuedPass] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [department, setDepartment] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [openOnly, setOpenOnly] = useState(false);

  const categories = ['All', 'Hackathon', 'Workshop', 'Seminar', 'Cultural', 'Sports'];
  const departments = [
    'All',
    'Computer Science',
    'Business & Management',
    'Engineering',
    'Arts & Humanities',
    'Science',
    'Student Life'
  ];

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(category !== 'All' && { category }),
        ...(department !== 'All' && { department }),
        ...(dateFilter !== 'all' && { dateFilter }),
        ...(openOnly && { openOnly: 'true' }),
        ...(search.trim() && { search: search.trim() })
      });

      const res = await fetch(`/api/events?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setEvents(data.data || []);
      } else {
        showToast('Failed to load events', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error fetching events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, department, dateFilter, openOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleRegisterSuccess = (registrationData) => {
    setSelectedEvent(null);
    setIssuedPass(registrationData);
    fetchEvents(); // Refresh capacity counter
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900 border border-indigo-500/20 p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Campus Event Discovery Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Discover & Connect at <span className="gradient-text">Campus Events</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Filter upcoming hackathons, guest lectures, design masterclasses, and sports tournaments. Register instantly with real-time seat tracking and digital mobile passes.
          </p>

          {/* Quick Stats Ticker */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 max-w-lg">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-100">{events.length}</div>
              <div className="text-xs text-slate-400 font-medium">Available Listings</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">
                {events.reduce((sum, e) => sum + (e.capacity - e.registeredCount), 0)}
              </div>
              <div className="text-xs text-slate-400 font-medium">Open Seats</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-purple-400">6</div>
              <div className="text-xs text-slate-400 font-medium">Departments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, speaker, keyword, or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-500/20"
          >
            Search
          </button>
        </form>

        {/* Category Pills & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  category === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Department Select & Date Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'All' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Any Date</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Open Seats Only</span>
            </label>
          </div>

        </div>

      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading campus events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Events Match Your Filter Criteria</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Try adjusting your search query, clearing date filters, or switching departments.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('All');
              setDepartment('All');
              setDateFilter('all');
              setOpenOnly(false);
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-indigo-300 text-xs font-semibold hover:bg-slate-700"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const seatsLeft = event.capacity - event.registeredCount;
            const isSoldOut = seatsLeft <= 0 || event.status === 'Sold Out';
            const capacityPct = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

            return (
              <div
                key={event.id || event._id}
                className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Event Banner */}
                  <div className={`p-5 bg-gradient-to-r ${event.bannerGradient || 'from-indigo-600 to-purple-600'} text-white relative`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/30 backdrop-blur-sm border border-white/10">
                        {event.category}
                      </span>
                      {isSoldOut ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow">
                          Sold Out
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow">
                          {seatsLeft} Left
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-100 transition-colors line-clamp-2 mt-1">
                      {event.title}
                    </h3>
                  </div>

                  {/* Details Body */}
                  <div className="p-5 space-y-4">
                    <div className="text-xs font-semibold text-indigo-400">
                      🏢 {event.department}
                    </div>

                    <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{event.date} • {event.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate font-medium">{event.speaker || 'Guest Speaker'}</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                        <span>Capacity</span>
                        <span className="font-semibold">{event.registeredCount}/{event.capacity} registered</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            capacityPct >= 90 ? 'bg-rose-500' : capacityPct >= 75 ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${capacityPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isSoldOut
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    }`}
                  >
                    <span>{isSoldOut ? 'View Event Details' : 'View & Register'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Event Details & Registration Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegisterSuccess={handleRegisterSuccess}
          showToast={showToast}
          currentUser={currentUser}
        />
      )}

      {/* Ticket Pass Modal */}
      {issuedPass && (
        <TicketPassModal
          registration={issuedPass}
          onClose={() => setIssuedPass(null)}
        />
      )}

    </div>
  );
}
