import React, { useState } from 'react';
import { DOCUMENT_CATALOG, BARANGAY_AREAS } from '../data/mockData';
import { DocumentApplication, DocumentType } from '../types';
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';
import { DocumentCertificateModal } from './DocumentCertificateModal';

interface DocumentProcessingViewProps {
  onAddDocument: (doc: DocumentApplication) => void;
  userDocuments: DocumentApplication[];
  onNavigateToTracker: () => void;
}

export const DocumentProcessingView: React.FC<DocumentProcessingViewProps> = ({
  onAddDocument,
  userDocuments,
  onNavigateToTracker
}) => {
  const { currentUser } = useAuth();
  const [selectedType, setSelectedType] = useState<DocumentType>('barangay-clearance');
  const [isApplying, setIsApplying] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [applicantName, setApplicantName] = useState(currentUser?.displayName || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('');
  const [purok, setPurok] = useState<string>(BARANGAY_AREAS[0]);
  const [yearsOfResidency, setYearsOfResidency] = useState<number>(1);
  const [purpose, setPurpose] = useState('');
  const [createdDoc, setCreatedDoc] = useState<DocumentApplication | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentApplication | null>(null);

  const selectedDocConfig = DOCUMENT_CATALOG.find(d => d.type === selectedType) || DOCUMENT_CATALOG[0];

  const handleStartApply = (docType: DocumentType) => {
    setSelectedType(docType);
    setIsApplying(true);
    setStep(1);
    setCreatedDoc(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !purpose.trim() || !address.trim()) return;

    const refNum = `BM96-DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp: DocumentApplication = {
      id: 'doc-' + Date.now(),
      referenceNumber: refNum,
      documentType: selectedType,
      applicantName: applicantName.trim(),
      applicantEmail: currentUser?.email || 'citizen@martirez96.gov',
      applicantPhone: applicantPhone.trim() || 'N/A',
      address: address.trim(),
      purok,
      yearsOfResidency,
      purpose: purpose.trim(),
      status: 'pending',
      dateSubmitted: new Date().toISOString().split('T')[0],
      fee: selectedDocConfig.fee
    };

    onAddDocument(newApp);
    setCreatedDoc(newApp);
    setStep(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Document Processing Services
          </h2>
        </div>

        <button
          onClick={onNavigateToTracker}
          className="px-3.5 py-1.5 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Track Applications</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {!isApplying ? (
        <div className="space-y-6">
          {/* Document Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOCUMENT_CATALOG.map((doc) => (
              <div
                key={doc.type}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-blue-400 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {doc.fee === 0 ? 'Free' : `₱${doc.fee}`}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {doc.title}
                  </h3>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleStartApply(doc.type)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* User's recent document requests */}
          {userDocuments.length > 0 && (
            <div className="pt-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Your Document Applications ({userDocuments.length}):
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {userDocuments.map((app) => (
                  <div key={app.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700">{app.referenceNumber}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-800 capitalize">{app.documentType.replace(/-/g, ' ')}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        Purpose: {app.purpose} · Submitted: {app.dateSubmitted}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        app.status === 'ready-pickup' ? 'bg-amber-100 text-amber-800' :
                        app.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-50 text-blue-800'
                      }`}>
                        {app.status === 'ready-pickup' ? 'Ready for Pick-up' : app.status}
                      </span>

                      <button
                        onClick={() => setPreviewDoc(app)}
                        className="px-2 py-1 text-slate-600 hover:text-blue-700 border border-slate-200 rounded text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Certificate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Form */
        <div className="bg-white rounded-xl border border-slate-200 max-w-2xl mx-auto overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="text-sm font-bold">
              {selectedDocConfig.title}
            </h3>
            <button
              onClick={() => setIsApplying(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Area *
                  </label>
                  <select
                    value={purok}
                    onChange={(e) => setPurok(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    {BARANGAY_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Purpose of Request *
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Submit Application
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-slate-900">Application Submitted</h4>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Reference: <strong>{createdDoc?.referenceNumber}</strong>
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                {createdDoc && (
                  <button
                    onClick={() => setPreviewDoc(createdDoc)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                  >
                    View Certificate
                  </button>
                )}
                <button
                  onClick={() => setIsApplying(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {previewDoc && (
        <DocumentCertificateModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}

    </div>
  );
};
