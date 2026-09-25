import React from 'react';
import { BarangayLogo } from './BarangayLogo';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <BarangayLogo size="sm" />
          <span className="font-semibold text-white">
            Serbisyong Martirez del '96 · Pateros
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <button onClick={() => onNavigate('announcements')} className="hover:text-white cursor-pointer">Patalastas</button>
          <button onClick={() => onNavigate('documents')} className="hover:text-white cursor-pointer">Dokumento</button>
          <button onClick={() => onNavigate('services')} className="hover:text-white cursor-pointer">Serbisyo</button>
          <button onClick={() => onNavigate('tracker')} className="hover:text-white cursor-pointer">Tracker</button>
          <button onClick={() => onNavigate('directory')} className="hover:text-white cursor-pointer">Direktoryo</button>
        </div>

        <p className="text-[11px] text-slate-500">
          © {new Date().getFullYear()} Barangay Martirez del '96, Pateros, Metro Manila.
        </p>
      </div>
    </footer>
  );
};
