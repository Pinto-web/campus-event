import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Filter, User, ArrowRight, RefreshCw } from 'lucide-react';
import EventModal from './EventModal';
import TicketPassModal from './TicketPassModal';

const CATEGORIES = ['All', 'Hackathon', 'Workshop', 'Seminar', 'Cultural', 'Sports'];
const DEPARTMENTS = ['All', 'Computer Science', 'Business & Management', 'Engineering', 'Arts & Humanities', 'Science', 'Student Life'];

function categoryBadge(cat) {
  const map = {
    Hackathon: 'badge-hackathon',
    Workshop:  'badge-workshop',
    Seminar:   'badge-seminar',
    Cultural:  'badge-cultural',
    Sports:    'badge-sports',
  };
  return map[cat] || 'badge-default';
}

function categoryBanner(cat) {
  const map = {
    Hackathon: '#4f46e5',
    Workshop:  '#059669',
    Seminar:   '#d97706',
    Cultural:  '#db2777',
    Sports:    '#ea580c',
  };
  return map[cat] || '#1e3a5f';
}

export default function EventDiscovery({ showToast, currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [issuedPass, setIssuedPass] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [department, setDepartment] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [openOnly, setOpenOnly] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(category !== 'All' && { category }),
        ...(department !== 'All' && { department }),
        ...(dateFilter !== 'all' && { dateFilter }),
        ...(openOnly && { openOnly: 'true' }),
        ...(search.trim() && { search: search.trim() }),
      });
      const res = await fetch(`/api/events?${query.toString()}`);
      const data = await res.json();
      if (res.ok) setEvents(data.data || []);
      else showToast('Failed to load events', 'error');
    } catch {
      showToast('Network error fetching events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [category, department, dateFilter, openOnly]);

  const handleRegisterSuccess = (reg) => {
    setSelectedEvent(null);
    setIssuedPass(reg);
    fetchEvents();
  };

  const totalSeats = events.reduce((s, e) => s + (e.capacity - e.registeredCount), 0);

  return (
    <div className="space-y-6 animate-fadeUp">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <span className="section-label">Campus Event Discovery</span>
          <h1 className="text-3xl font-black text-[#1e3a5f] mt-1 leading-tight">
            Upcoming Events
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Explore and register for hackathons, workshops, seminars & more.
          </p>
        </div>
        <div className="flex items-center gap-5 text-sm shrink-0">
          <div className="text-center">
            <div className="text-2xl font-black text-stone-800">{events.length}</div>
            <div className="text-[11px] text-stone-400 font-medium">Events</div>
          </div>
          <div className="w-px h-10 bg-stone-200" />
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-600">{totalSeats}</div>
            <div className="text-[11px] text-stone-400 font-medium">Open Seats</div>
          </div>
          <div className="w-px h-10 bg-stone-200" />
          <div className="text-center">
            <div className="text-2xl font-black text-stone-800">6</div>
            <div className="text-[11px] text-stone-400 font-medium">Departments</div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="card-flat p-4 rounded-2xl space-y-3">
        {/* Search */}
        <form onSubmit={(e) => { e.preventDefault(); fetchEvents(); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by title, speaker, or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <button type="submit" className="btn-navy px-5 py-2 text-sm">Search</button>
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Type:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`filter-pill ${category === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Department + Date + Open Only */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="input-field py-1.5 text-xs w-auto pr-8"
              style={{paddingLeft:'10px'}}
            >
              {DEPARTMENTS.map((d) => <option key={d}>{d === 'All' ? 'All Departments' : d}</option>)}
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field py-1.5 text-xs w-auto pr-8"
              style={{paddingLeft:'10px'}}
            >
              <option value="all">Any Date</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <label className="flex items-center gap-2 text-xs font-medium text-stone-600 cursor-pointer bg-white border border-stone-200 px-3 py-1.5 rounded-lg hover:border-stone-300 transition-colors select-none">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="rounded border-stone-300 text-[#d95b2b] focus:ring-orange-400 focus:ring-1"
              />
              Open Seats Only
            </label>
          </div>
        </div>
      </div>

      {/* ── Events Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-7 h-7 text-stone-400 animate-spin" />
          <p className="text-stone-400 text-sm">Loading campus events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="card p-14 text-center space-y-3">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-700">No events match your filters</h3>
          <p className="text-stone-400 text-sm max-w-sm mx-auto">Try adjusting your search or clearing filters.</p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setDepartment('All'); setDateFilter('all'); setOpenOnly(false); }}
            className="btn-secondary mt-2 text-xs py-2 px-4 mx-auto"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => {
            const seatsLeft = event.capacity - event.registeredCount;
            const isSoldOut = seatsLeft <= 0 || event.status === 'Sold Out';
            const capacityPct = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
            const bannerColor = categoryBanner(event.category);

            return (
              <div key={event.id || event._id} className="event-card group">

                {/* Banner */}
                <div
                  className="p-5 relative"
                  style={{ background: bannerColor }}
                >
                  {/* Subtle texture overlay */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)'
                  }} />
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/20`}>
                        {event.category}
                      </span>
                      {isSoldOut ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-rose-600 border border-rose-100">Sold Out</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-100">{seatsLeft} Left</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:opacity-90 transition-opacity">
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${categoryBadge(event.category)}`}>
                      {event.department}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {event.description || 'Details to be announced.'}
                  </p>

                  <div className="space-y-1.5 text-xs text-stone-500 border-t border-stone-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{event.date} &middot; {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate font-medium text-stone-600">{event.speaker || 'Guest Speaker'}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-auto pt-1">
                    <div className="flex justify-between text-[10px] text-stone-400 mb-1.5">
                      <span>Capacity</span>
                      <span className="font-semibold">{event.registeredCount} / {event.capacity}</span>
                    </div>
                    <div className="capacity-bar-bg">
                      <div
                        className="capacity-bar"
                        style={{
                          width: `${capacityPct}%`,
                          background: capacityPct >= 90 ? '#f43f5e' : capacityPct >= 70 ? '#f59e0b' : '#10b981'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-4 pb-4">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isSoldOut
                        ? 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        : 'bg-[#d95b2b] text-white hover:bg-[#c04f24] shadow-sm hover:shadow-md'
                    }`}
                  >
                    {isSoldOut ? 'View Details' : 'View & Register'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegisterSuccess={handleRegisterSuccess}
          showToast={showToast}
          currentUser={currentUser}
        />
      )}
      {issuedPass && (
        <TicketPassModal
          registration={issuedPass}
          onClose={() => setIssuedPass(null)}
        />
      )}
    </div>
  );
}
