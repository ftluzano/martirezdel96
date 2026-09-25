import React, { useState } from 'react';
import { ServiceCategory, ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { ResidentReportModal } from './ResidentReportModal';
import { 
  Lightbulb, 
  Trash2, 
  Droplets, 
  Activity, 
  ShieldAlert, 
  Scissors, 
  Scale, 
  Home, 
  Wrench, 
  FileText, 
  AlertTriangle, 
  Camera, 
  X,
  Maximize2 
} from 'lucide-react';

interface ServiceRequestsViewProps {
  services: ServiceRequest[];
  onAddService: (newService: ServiceRequest) => void;
  onNavigateToTracker: () => void;
}

export const ServiceRequestsView: React.FC<ServiceRequestsViewProps> = ({
  services,
  onAddService,
  onNavigateToTracker
}) => {
  const { currentUser } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string; ref: string } | null>(null);

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 font-bold border-red-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 font-bold border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ready-pickup':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in-review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Community Service Requests & Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent tracking of citizen incident reports, infrastructure repairs, and barangay dispatches.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowReportModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm shadow-red-700/20 hover:shadow-md cursor-pointer self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>Submit a Report</span>
        </button>
      </div>

      {/* Modern Resident Report Modal with photo upload & category choices */}
      <ResidentReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onAddService={onAddService}
        onNavigateToTracker={onNavigateToTracker}
      />

      {/* Services List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Reported Community Issues ({services.length}):
          </h3>
          <span className="text-[11px] text-slate-500">
            Live real-time updates without page refresh
          </span>
        </div>

        {services.length === 0 ? (
          <div className="soft-panel bg-white/90 rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs animate-in-view">
            No active service requests reported yet. Click "Submit a Report" above to submit one with photo evidence.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="soft-card bg-white/90 rounded-xl border border-slate-200 p-4 space-y-3 text-xs shadow-2xs flex flex-col justify-between animate-in-view"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-mono font-bold text-blue-700">{srv.referenceNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getPriorityBadgeClass(srv.priority)}`}>
                      {srv.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {srv.title}
                  </h4>

                  <p className="text-slate-600 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>

                  {/* Photo Proof Preview if uploaded */}
                  {srv.photoProof && (
                    <div className="pt-1">
                      <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-h-36">
                        <img
                          src={srv.photoProof}
                          alt="Report photo proof"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          type="button"
                          onClick={() => setViewingPhoto({ url: srv.photoProof!, title: srv.title, ref: srv.referenceNumber })}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-semibold text-xs cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>View Full Photo</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <Camera className="w-3 h-3" />
                          <span>Photo evidence attached</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setViewingPhoto({ url: srv.photoProof!, title: srv.title, ref: srv.referenceNumber })}
                          className="text-blue-700 hover:text-blue-900 font-semibold cursor-pointer underline text-[10px]"
                        >
                          Enlarge
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 text-slate-500 flex items-center justify-between text-[11px]">
                  <span className="truncate max-w-[160px]">📍 {srv.location} ({srv.purok})</span>
                  <span className={`px-2 py-0.5 rounded font-bold capitalize border ${getStatusBadgeClass(srv.status)}`}>
                    {srv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Photo Modal */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-blue-400 font-bold block">{viewingPhoto.ref}</span>
                <span className="text-xs font-semibold text-slate-200 truncate block">{viewingPhoto.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingPhoto(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={viewingPhoto.url}
                alt="Resident Proof Full Resolution"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingPhoto(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
