import React from 'react';
import { QrCode, CheckCircle, Calendar, MapPin, Download, X, User, Ticket } from 'lucide-react';

export default function TicketPassModal({ registration, onClose }) {
  if (!registration) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden p-6 sm:p-8 text-center text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Badge Header */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-3 glow-effect">
          <CheckCircle className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-extrabold tracking-tight mb-1 text-slate-100">
          Registration Confirmed!
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Your digital campus pass is active. Present this QR code at venue entrance.
        </p>

        {/* Digital Ticket Card Graphic */}
        <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/80 border border-indigo-500/30 p-5 shadow-xl text-left overflow-hidden">
          
          {/* Decorative Corner Notch */}
          <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-[10px] font-extrabold uppercase tracking-widest text-white rounded-bl-xl shadow">
            OFFICIAL PASS
          </div>

          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Ticket className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{registration.department || 'CAMPUS EVENT'}</span>
          </div>

          <h4 className="text-lg font-bold text-slate-100 mb-3 leading-snug line-clamp-2">
            {registration.eventTitle}
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 mb-4 pb-4 border-b border-indigo-500/20">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Student Name</span>
              <span className="font-semibold text-slate-200">{registration.studentName}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Student ID</span>
              <span className="font-mono text-indigo-300 font-semibold">{registration.studentId}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Date & Time</span>
              <span className="text-slate-200">{registration.eventDate} ({registration.eventTime})</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Pass Code</span>
              <span className="font-mono text-emerald-400 font-bold">{registration.passCode}</span>
            </div>
          </div>

          {/* QR Code Mockup */}
          <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-inner">
                {/* SVG Simulated QR Code */}
                <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path stroke="#0f172a" fill="#0f172a" d="M2 2h8v8H2zM4 4h4v4H4zM14 2h8v8h-8zM16 4h4v4h-4zM2 14h8v8H2zM4 16h4v4H4zM14 14h2v2h-2zM18 14h4v2h-4zM14 18h4v4h-4zM20 18h2v4h-2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Scan for Entrance</div>
                <div className="text-xs font-mono font-bold text-slate-200">{registration.passCode}</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">● Status: Verified</div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            <Download className="w-4 h-4" /> Download / Print
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/25"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
