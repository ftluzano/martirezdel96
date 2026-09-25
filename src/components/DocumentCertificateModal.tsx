import React from 'react';
import { DocumentApplication } from '../types';
import { BarangayLogo } from './BarangayLogo';
import { X, Printer, ShieldCheck } from 'lucide-react';

interface DocumentCertificateModalProps {
  doc: DocumentApplication | null;
  onClose: () => void;
}

export const DocumentCertificateModal: React.FC<DocumentCertificateModalProps> = ({
  doc,
  onClose
}) => {
  if (!doc) return null;

  const handlePrint = () => {
    window.print();
  };

  const getDocTitle = () => {
    switch (doc.documentType) {
      case 'barangay-clearance': return 'BARANGAY CLEARANCE';
      case 'certificate-of-indigency': return 'CERTIFICATE OF INDIGENCY';
      case 'certificate-of-residency': return 'CERTIFICATE OF RESIDENCY';
      case 'business-clearance': return 'BARANGAY BUSINESS CLEARANCE';
      case 'first-time-jobseeker': return 'FIRST-TIME JOBSEEKER CERTIFICATION (RA 11261)';
      case 'barangay-id': return 'BARANGAY RESIDENT CERTIFICATION & ID CARD';
      default: return 'BARANGAY CERTIFICATION';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Official Document Verification</span>
            <span className="text-slate-400">· Ref: <code className="font-mono text-amber-300">{doc.referenceNumber}</code></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Certificate Paper Document */}
        <div className="p-8 sm:p-12 bg-white text-slate-900 relative font-serif print:p-0">
          
          {/* Subtle Watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <BarangayLogo size="xl" />
          </div>

          {/* Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center relative">
            <div className="flex items-center justify-center gap-4 mb-2">
              <BarangayLogo size="md" />
              <div className="text-center font-sans">
                <p className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Republic of the Philippines</p>
                <p className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold">National Capital Region · Municipality of Pateros</p>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-0.5">
                  BARANGAY MARTIREZ DEL '96
                </h1>
                <p className="text-xs font-bold text-red-700 tracking-wider uppercase mt-0.5">
                  Office of the Punong Barangay
                </p>
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="my-8 text-center">
            <h2 className="text-xl sm:text-2xl font-black tracking-wider text-slate-900 uppercase font-sans border-b-2 border-red-700 inline-block px-4 pb-1">
              {getDocTitle()}
            </h2>
          </div>

          {/* Salutation */}
          <div className="mb-6 font-sans">
            <p className="text-xs font-bold tracking-widest text-slate-800 uppercase">
              TO WHOM IT MAY CONCERN:
            </p>
          </div>

          {/* Certificate Body Text */}
          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-justify text-slate-800 font-serif">
            <p className="indent-8">
              This is to certify that <strong className="font-sans font-bold underline text-slate-950 uppercase">{doc.applicantName}</strong>, of legal age, Filipino citizen, is a bonafide resident of <strong className="font-sans font-bold text-slate-950">{doc.address}</strong>, Barangay Martirez del '96, Pateros, Metro Manila, and has been residing within this Barangay jurisdiction.
            </p>

            <p className="indent-8">
              Based on official records available in this office, the aforementioned individual is known to be a law-abiding citizen of good moral character, with <strong className="font-sans font-semibold">NO DEROGATORY RECORD</strong> or pending complaint filed before the Lupong Tagapamayapa of this Barangay as of this date.
            </p>

            <p className="indent-8">
              This certification is hereby issued upon the request of the interested party for the purpose of: <strong className="font-sans font-bold text-blue-900 uppercase bg-blue-50 px-1 py-0.5 rounded">{doc.purpose}</strong> and for any legal intent it may serve.
            </p>

            <p className="indent-8 pt-2">
              Given this <span className="font-bold underline">{new Date().getDate()}</span> day of{' '}
              <span className="font-bold underline">{new Date().toLocaleString('en-US', { month: 'long' })}</span>,{' '}
              <span className="font-bold underline">{new Date().getFullYear()}</span> at Barangay Martirez del '96, Pateros, Metro Manila, Philippines.
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-14 pt-6 grid grid-cols-2 gap-8 font-sans items-end">
            <div className="space-y-3">
              <div className="border border-slate-300 w-28 h-20 rounded flex items-center justify-center text-[10px] text-slate-400 text-center p-1 bg-slate-50">
                Applicant Signature / Thumbmark
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase">{doc.applicantName}</p>
                <p className="text-[11px] text-slate-500">Applicant</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <p className="text-xs font-semibold text-slate-500">Certified by:</p>
              <div className="pt-6">
                <p className="text-sm font-extrabold text-slate-950 uppercase underline">
                  HON. PUNONG BARANGAY
                </p>
                <p className="text-xs font-bold text-red-700">
                  Punong Barangay
                </p>
                <p className="text-[10px] text-slate-500">
                  Barangay Martirez del '96, Pateros
                </p>
              </div>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="mt-10 pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-sans text-slate-500">
            <div>
              <span className="block font-bold text-slate-700">Reference No:</span>
              <span className="font-mono text-slate-900">{doc.referenceNumber}</span>
            </div>
            <div>
              <span className="block font-bold text-slate-700">Issued Date:</span>
              <span className="font-mono">{doc.dateSubmitted}</span>
            </div>
            <div>
              <span className="block font-bold text-slate-700">Official Receipt:</span>
              <span className="font-mono">{doc.fee === 0 ? 'FREE (Exempted)' : `₱${doc.fee}.00 Paid`}</span>
            </div>
            <div>
              <span className="block font-bold text-slate-700">Dry Seal:</span>
              <span className="text-emerald-700 font-semibold">VALID WHEN SEALED</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
