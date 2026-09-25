import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PhoneCall } from 'lucide-react';

interface HeroSectionProps {
  onNavigate?: (tab: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const { currentUser } = useAuth();

  return (
    <div className="bg-slate-950 text-white border-b border-slate-800/80 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-40 bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-60 h-32 bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Greeting & Location Badge */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-900/50 border border-blue-400/25 rounded-full text-[10px] font-semibold text-blue-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Barangay Martirez del '96 · Pateros, Metro Manila</span>
              </div>
            </div>

            <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white leading-tight truncate">
              {currentUser?.displayName ? `Mabuhay, ${currentUser.displayName}!` : "Serbisyong Martirez del '96"}
            </h1>
          </div>

          {/* Compact Quick Emergency Numbers Bar */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 text-[9px] text-slate-400 shrink-0 max-w-[52%]">
            <span className="flex items-center gap-1 font-semibold text-slate-300 whitespace-nowrap">
              <PhoneCall className="w-3 h-3 text-red-400" />
              Hotlines:
            </span>
            <a
              href="tel:0286388421"
              className="bg-slate-900/90 hover:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
              title="Call Barangay Hall"
            >
              <span className="text-slate-400">Hall: </span>
              <strong className="text-white font-mono">(02) 8638-8421</strong>
            </a>
            <a
              href="tel:09985987934"
              className="bg-slate-900/90 hover:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
              title="Call Pateros PNP"
            >
              <span className="text-slate-400">PNP: </span>
              <strong className="text-white font-mono">0998-598-7934</strong>
            </a>
            <a
              href="tel:0286411365"
              className="bg-slate-900/90 hover:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap"
              title="Call Pateros BFP Fire Station"
            >
              <span className="text-slate-400">BFP: </span>
              <strong className="text-white font-mono">(02) 8641-1365</strong>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
