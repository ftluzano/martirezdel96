import React, { useState } from 'react';
import { BarangayOfficial } from '../types';
import { Plus, X } from 'lucide-react';

interface DirectoryViewProps {
  officials: BarangayOfficial[];
  onAddOfficial: (official: BarangayOfficial) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  officials,
  onAddOfficial
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [contact, setContact] = useState('');
  const [term, setTerm] = useState('2023 - 2026');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !position.trim()) return;

    const newOff: BarangayOfficial = {
      id: 'off-' + Date.now(),
      name: name.trim(),
      position: position.trim(),
      contact: contact.trim() || undefined,
      term,
      category: 'kagawad'
    };

    onAddOfficial(newOff);
    setShowAddModal(false);
    setName('');
    setPosition('');
    setContact('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Barangay Directory
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Official</span>
        </button>
      </div>

      {/* Quick Emergency Contacts Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs border border-slate-800">
        <div>
          <span className="text-slate-400 block font-medium">Barangay Hall Hotline</span>
          <a href="tel:0286388421" className="text-sm font-bold font-mono text-white hover:text-blue-400 transition-colors">
            (02) 8638-8421
          </a>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Pateros PNP Police</span>
          <a href="tel:09985987934" className="text-sm font-bold font-mono text-white hover:text-blue-400 transition-colors">
            0998-598-7934 / (02) 8875-8596
          </a>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Pateros BFP Fire Station</span>
          <a href="tel:0286411365" className="text-sm font-bold font-mono text-white hover:text-red-400 transition-colors">
            (02) 8641-1365
          </a>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Location</span>
          <span className="text-xs font-semibold text-slate-200">Martirez del '96, Pateros, Metro Manila</span>
        </div>
      </div>

      {/* Officials List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Officials Roster ({officials.length}):
        </h3>

        {officials.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            No officials listed yet. Click "Add Official" to add a member.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {officials.map((off) => (
              <div
                key={off.id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>{off.term}</span>
                  <span className="font-semibold text-blue-700">{off.position}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{off.name}</h4>
                {off.contact && (
                  <p className="text-slate-500 font-mono text-[11px] pt-1">
                    Contact: {off.contact}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Official Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add Official</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Position *
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800"
                >
                  Save Official
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
