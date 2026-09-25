import React, { useState } from 'react';
import { DocumentApplication, ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { Search, Download, FileText, Wrench, Camera, X, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';

interface TrackerViewProps {
  documents: DocumentApplication[];
  services: ServiceRequest[];
  onNavigateToDocs: () => void;
  onNavigateToServices: () => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  documents,
  services,
  onNavigateToDocs,
  onNavigateToServices
}) => {
  const { currentUser } = useAuth();
  const [searchRef, setSearchRef] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'documents' | 'services'>('all');
  const [viewingPhotoProof, setViewingPhotoProof] = useState<{ url: string; title: string; ref: string } | null>(null);

  const cleanSearch = searchRef.trim().toLowerCase();
  const userEmail = (currentUser?.email || '').toLowerCase().trim();
  const userName = (currentUser?.displayName || '').toLowerCase().trim();

  // Filter based on tab & search
  const isMineDoc = (d: DocumentApplication) => {
    if (!userEmail) return false;
    return (
      (d.applicantEmail && d.applicantEmail.toLowerCase().trim() === userEmail) ||
      (userName && d.applicantName.toLowerCase().trim() === userName)
    );
  };

  const isMineService = (s: ServiceRequest) => {
    if (!userEmail) return false;
    return (
      (s.reporterEmail && s.reporterEmail.toLowerCase().trim() === userEmail) ||
      (userName && s.reportedBy.toLowerCase().trim() === userName)
    );
  };

  const myDocsCount = documents.filter(isMineDoc).length;
  const myServicesCount = services.filter(isMineService).length;

  const matchedDocs = documents.filter(d => {
    if (activeTab === 'mine' && !isMineDoc(d)) return false;
    if (activeTab === 'services') return false;

    if (!cleanSearch) return true;
    return (
      d.referenceNumber.toLowerCase().includes(cleanSearch) ||
      d.applicantName.toLowerCase().includes(cleanSearch) ||
      d.documentType.toLowerCase().includes(cleanSearch)
    );
  });

  const matchedServices = services.filter(s => {
    if (activeTab === 'mine' && !isMineService(s)) return false;
    if (activeTab === 'documents') return false;

    if (!cleanSearch) return true;
    return (
      s.referenceNumber.toLowerCase().includes(cleanSearch) ||
      s.title.toLowerCase().includes(cleanSearch) ||
      s.category.toLowerCase().includes(cleanSearch) ||
      s.reportedBy.toLowerCase().includes(cleanSearch)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
            <CheckCircle className="w-3 h-3" />
            <span>Completed / Resolved</span>
          </span>
        );
      case 'ready-pickup':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
            <Clock className="w-3 h-3" />
            <span>Ready for Pickup / Action Taken</span>
          </span>
        );
      case 'in-review':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
            <Clock className="w-3 h-3" />
            <span>In-Review by Officials</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
            <AlertCircle className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Application & Service Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status tracking for document requests and community service reports.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            placeholder="Search by Reference (BM96-...) or Name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono shadow-2xs"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Community Requests ({documents.length + services.length})
        </button>

        {currentUser && (
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mine'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Account Submissions ({myDocsCount + myServicesCount})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Certificates & Clearances ({documents.length})
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'services'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Community Incident Reports ({services.length})
        </button>
      </div>

      {activeTab === 'mine' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 flex items-center justify-between">
          <span>
            Showing requests tied to your account (<strong>{currentUser?.email}</strong>). Live official updates appear instantly without page refresh.
          </span>
          <span className="text-[11px] font-semibold text-blue-600">
            {myDocsCount + myServicesCount} Total Record(s)
          </span>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {/* Documents */}
        {matchedDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-mono font-bold text-blue-700">{doc.referenceNumber}</span>
                <span>·</span>
                <span className="font-bold text-slate-900 capitalize">{doc.documentType.replace(/-/g, ' ')}</span>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(doc.status)}
                {doc.providedFileData ? (
                  <a
                    href={doc.providedFileData}
                    download={doc.providedFileName || 'barangay-document'}
                    className="px-2.5 py-1 text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download file</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Waiting for official file</span>
                )}
              </div>
            </div>

            <div className="text-slate-600 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px]">
              <span>Applicant: <strong className="text-slate-800">{doc.applicantName}</strong></span>
              <span>Area: <strong className="text-slate-800">{doc.purok}</strong></span>
              <span>Purpose: <strong className="text-slate-800">{doc.purpose}</strong></span>
              <span>Submitted: <strong className="text-slate-800">{doc.dateSubmitted}</strong></span>
              {doc.notes && (
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Officer Note: {doc.notes}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Services */}
        {matchedServices.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span className="font-mono font-bold text-blue-700">{srv.referenceNumber}</span>
                <span>·</span>
                <span className="font-bold text-slate-900">{srv.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {srv.photoProof && (
                  <button
                    type="button"
                    onClick={() => setViewingPhotoProof({ url: srv.photoProof!, title: srv.title, ref: srv.referenceNumber })}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer text-[11px]"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Photo Proof</span>
                  </button>
                )}
                {getStatusBadge(srv.status)}
              </div>
            </div>
            
            <p className="text-slate-700 leading-relaxed">
              {srv.description}
            </p>

            {/* Photo Proof Thumbnail if attached */}
            {srv.photoProof && (
              <div className="pt-1 flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingPhotoProof({ url: srv.photoProof!, title: srv.title, ref: srv.referenceNumber })}
                  className="group relative cursor-pointer flex-shrink-0"
                >
                  <img
                    src={srv.photoProof}
                    alt="Proof thumbnail"
                    className="w-20 h-14 object-cover rounded-md border border-slate-300 group-hover:opacity-90 transition-opacity"
                  />
                  <span className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                    Zoom
                  </span>
                </button>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Attached Evidence Photo</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Uploaded as verified base64 string on Firebase and accessible to barangay dispatch officers.
                  </p>
                </div>
              </div>
            )}

            <div className="text-slate-600 flex flex-wrap gap-x-5 gap-y-1 text-[11px] pt-1">
              <span>Location: <strong className="text-slate-800">{srv.location}</strong> ({srv.purok})</span>
              <span className="capitalize">Priority: <strong className="text-slate-800">{srv.priority}</strong></span>
              <span>Reported: <strong className="text-slate-800">{srv.dateReported}</strong></span>
              {srv.reportedBy && <span>Reported by: <strong className="text-slate-800">{srv.reportedBy}</strong></span>}
            </div>

            {srv.resolutionNotes && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px]">
                <strong>Official Resolution Update:</strong> {srv.resolutionNotes}
                {srv.dateResolved && <span className="block text-[10px] text-emerald-600 mt-0.5">Resolved on: {srv.dateResolved}</span>}
              </div>
            )}
          </div>
        ))}

        {matchedDocs.length === 0 && matchedServices.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            {activeTab === 'mine' ? (
              <div className="space-y-2">
                <p className="font-semibold text-slate-700">No submissions found for your account yet.</p>
                <p className="text-[11px] text-slate-400">
                  When you submit a service incident report or document clearance request, it will appear here with live updates.
                </p>
              </div>
            ) : (
              'No matching requests found.'
            )}
          </div>
        )}
      </div>


      {/* Photo Proof Fullscreen Modal */}
      {viewingPhotoProof && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-blue-400 font-bold block">{viewingPhotoProof.ref}</span>
                <span className="text-xs font-semibold text-slate-200 truncate block">{viewingPhotoProof.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingPhotoProof(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={viewingPhotoProof.url}
                alt="Proof Full Resolution"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingPhotoProof(null)}
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
