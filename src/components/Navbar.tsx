import React, { useState } from 'react';
import { BarangayLogo } from './BarangayLogo';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronDown, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab
}) => {
  const { currentUser, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'announcements', label: 'Updates' },
    { id: 'documents', label: 'Documents' },
    { id: 'services', label: 'Services' },
    { id: 'tracker', label: 'Track Status' },
  ];

  if (currentUser?.role === 'admin') {
    navLinks.push({ id: 'admin', label: 'Admin Desk' });
  } else if (currentUser?.role === 'official') {
    navLinks.push({ id: 'admin', label: 'Official Desk' });
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single Brand element with Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('announcements')}
              className="flex items-center gap-2.5 text-left group"
            >
              <BarangayLogo size="sm" />
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                Serbisyong Martirez del '96
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`text-xs font-semibold transition-colors py-1 relative ${
                    isActive
                      ? 'text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: User Profile / Logout */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 pr-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span className="max-w-[130px] truncate">{currentUser.displayName}</span>
                  {currentUser.role === 'admin' && (
                    <span className="px-1.5 py-0.5 bg-purple-100 border border-purple-300 text-purple-800 text-[10px] font-bold rounded">
                      Admin
                    </span>
                  )}
                  {currentUser.role === 'official' && (
                    <span className="px-1.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold rounded">
                      Official
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Profile Menu */}
                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 text-xs space-y-1">
                      <p className="font-bold text-slate-900 truncate">{currentUser.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="pt-1">
                        {currentUser.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                            👑 System Administrator
                          </span>
                        ) : currentUser.role === 'official' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                            🛡️ Barangay Official
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            👤 Resident Citizen
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-2 pt-1">
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold ${
                activeTab === link.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          {currentUser && (
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="w-full mt-2 py-2 px-3 text-red-600 font-semibold text-xs text-left"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
};
