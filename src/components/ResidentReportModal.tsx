import React, { useState, useRef } from 'react';
import { REPORT_CATEGORIES_DATA, ReportCategoryConfig } from '../data/reportCategories';
import { BARANGAY_AREAS } from '../data/mockData';
import { ServiceRequest, PriorityLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Send, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  Copy, 
  Check, 
  ArrowRight,
  Camera,
  UploadCloud,
  Trash2,
  FileImage,
  AlertTriangle,
  Info,
  Building,
  Shield,
  Home,
  Wrench,
  Trees,
  Layers
} from 'lucide-react';

interface ResidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string;
  initialSubIssue?: string;
  onAddService: (newService: ServiceRequest) => void;
  onNavigateToTracker?: () => void;
}

export const ResidentReportModal: React.FC<ResidentReportModalProps> = ({
  isOpen,
  onClose,
  initialCategoryId,
  initialSubIssue,
  onAddService,
  onNavigateToTracker,
}) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Category Choices as specified by the user
  const [selectedCatId, setSelectedCatId] = useState<string>(
    initialCategoryId || 'neighborhood-disputes'
  );
  const [selectedSubIssue, setSelectedSubIssue] = useState<string>(initialSubIssue || '');
  const [customTitle, setCustomTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [purok, setPurok] = useState<string>(BARANGAY_AREAS[0]);
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contactNumber, setContactNumber] = useState(currentUser?.phone || '');
  const [reporterName, setReporterName] = useState(currentUser?.displayName || '');
  
  // Photo / Evidentiary Proof state
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (initialCategoryId) {
      setSelectedCatId(initialCategoryId);
    }
    if (initialSubIssue) {
      setSelectedSubIssue(initialSubIssue);
      if (!customTitle) setCustomTitle(initialSubIssue);
    }
  }, [initialCategoryId, initialSubIssue]);

  if (!isOpen) return null;

  const currentCategoryConfig: ReportCategoryConfig = 
    REPORT_CATEGORIES_DATA.find(c => c.id === selectedCatId) || REPORT_CATEGORIES_DATA[0];

  // Handle Photo selection & conversion to base64
  const processImageFile = (file: File) => {
    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('Image file is too large. Please select a photo under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawUrl = e.target?.result as string;
      if (!rawUrl) return;

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.78);
            setPhotoProof(compressedUrl);
            setPhotoFileName(file.name);
          } else {
            setPhotoProof(rawUrl);
            setPhotoFileName(file.name);
          }
        } catch {
          setPhotoProof(rawUrl);
          setPhotoFileName(file.name);
        }
      };
      img.onerror = () => {
        setPhotoProof(rawUrl);
        setPhotoFileName(file.name);
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const removePhoto = () => {
    setPhotoProof(null);
    setPhotoFileName(null);
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location.trim()) return;

    const refNum = `BM96-REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalTitle = customTitle.trim() || selectedSubIssue || currentCategoryConfig.name;

    const newReport: ServiceRequest = {
      id: 'rep-' + Date.now(),
      referenceNumber: refNum,
      category: selectedCatId,
      title: finalTitle,
      description: description.trim(),
      location: location.trim(),
      purok,
      priority,
      status: 'pending',
      reportedBy: isAnonymous ? 'Confidential / Anonymous Resident' : (reporterName.trim() || currentUser?.displayName || 'Resident'),
      contactNumber: contactNumber.trim() || 'N/A',
      reporterEmail: isAnonymous ? 'confidential@martirez96.gov' : (currentUser?.email || 'citizen@martirez96.gov'),
      dateReported: new Date().toISOString().split('T')[0],
      photoProof: photoProof || undefined,
    };

    onAddService(newReport);
    setSubmittedRef(refNum);
  };

  const handleCopyRef = () => {
    if (submittedRef) {
      navigator.clipboard.writeText(submittedRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedRef(null);
    setSelectedSubIssue('');
    setCustomTitle('');
    setDescription('');
    setLocation('');
    removePhoto();
    onClose();
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'neighborhood-disputes': return <Home className="w-4 h-4 text-amber-600" />;
      case 'environment-sanitation': return <Trees className="w-4 h-4 text-emerald-600" />;
      case 'infrastructure-utilities': return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'peace-order-safety': return <Shield className="w-4 h-4 text-red-600" />;
      case 'other-frequent-reports': return <Layers className="w-4 h-4 text-purple-600" />;
      default: return <Building className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Professional Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                <span>Barangay Martirez del '96</span>
                <span>·</span>
                <span>Resident Citizen Desk</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Submit an Incident or Community Report
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {submittedRef ? (
          /* Confirmation Screen */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Official Report Logged Successfully
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your report has been entered into the Barangay Action Center registry and dispatched to the Barangay Tanod, Lupon, and corresponding council desk.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto space-y-2">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Official Tracking Reference</span>
              <div className="flex items-center justify-center gap-2">
                <code className="text-base font-extrabold text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-slate-300 tracking-wider">
                  {submittedRef}
                </code>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="p-2 text-slate-600 hover:text-blue-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Copy reference code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Keep this code to check real-time progress and notes under the Track Status tab.
              </p>
            </div>

            {photoProof && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl max-w-md mx-auto flex items-center gap-3 text-left">
                <img 
                  src={photoProof} 
                  alt="Proof preview" 
                  className="w-12 h-12 object-cover rounded-lg border border-blue-200 shrink-0" 
                />
                <div className="text-[11px]">
                  <span className="font-semibold text-blue-900 block">Photo Proof Attached</span>
                  <span className="text-blue-700 truncate block max-w-xs">{photoFileName || 'Image proof'}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  handleResetAndClose();
                  if (onNavigateToTracker) onNavigateToTracker();
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Track Status Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Professional Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Step 1: Category Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                1. Select Report Category <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {REPORT_CATEGORIES_DATA.map((cat) => {
                  const isSelected = selectedCatId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCatId(cat.id);
                        setSelectedSubIssue('');
                        setCustomTitle('');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/90 shadow-2xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200 shrink-0">
                        {getCategoryIcon(cat.id)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-bold block leading-snug truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                          {cat.tagline}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Specific Issue Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                2. Specific Issue / Violation under <span className="text-blue-700">{currentCategoryConfig.name}</span> <span className="text-red-500">*</span>
              </label>
              
              <select
                value={selectedSubIssue}
                onChange={(e) => {
                  setSelectedSubIssue(e.target.value);
                  if (e.target.value) {
                    setCustomTitle(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">-- Choose specific concern or select "Other / Custom" --</option>
                {currentCategoryConfig.subIssues.map((issue) => (
                  <option key={issue} value={issue}>
                    {issue}
                  </option>
                ))}
                <option value="Other / Custom Concern">Other / Custom Concern</option>
              </select>
            </div>

            {/* Step 3: Title / Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Report Title / Summary Headline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Uncollected garbage pile on Gomez St. or Noise disturbance from neighbor"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            {/* Step 4: PHOTO / EVIDENTIARY PROOF UPLOAD (Requested Feature) */}
            <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-700" />
                  <label className="text-xs font-bold text-slate-800">
                    Attach Photo / Proof of Incident (Optional)
                  </label>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">JPG, PNG, WebP up to 8MB</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Attaching a photo of the clogged drainage, blocked alley, garbage issue, or hazard helps our responding officers dispatch the right team faster.
              </p>

              {photoProof ? (
                /* Attached Photo Preview */
                <div className="relative p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={photoProof} 
                      alt="Proof preview" 
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0" 
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">
                        {photoFileName || 'Incident Photo'}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Check className="w-3 h-3" /> Photo Attached Successfully
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload Dropzone / Button */
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingPhoto(true); }}
                  onDragLeave={() => setIsDraggingPhoto(false)}
                  onDrop={handlePhotoDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDraggingPhoto 
                      ? 'border-blue-500 bg-blue-50/60' 
                      : 'border-slate-300 hover:border-blue-400 hover:bg-white bg-slate-100/60'
                  }`}
                >
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <span className="text-xs font-semibold text-slate-700 block">
                    Click to browse or drag & drop photo proof
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Clear snapshot of the location or incident
                  </span>
                </div>
              )}

              {photoError && (
                <p className="text-[11px] text-red-600 font-medium">
                  {photoError}
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Step 5: Location & Purok */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Specific Street / Landmark / Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Corner E. Gomez St. near Bakery / In front of House #42"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Area <span className="text-red-500">*</span>
                </label>
                <select
                  value={purok}
                  onChange={(e) => setPurok(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  {BARANGAY_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 6: Narrative & Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Detailed Narrative / Concern Details <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, how long the issue has persisted, individuals/vehicles involved, and any specific assistance needed..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            {/* Step 7: Priority Level & Confidentiality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Urgency / Priority Level
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as PriorityLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setPriority(lvl)}
                      className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg capitalize border transition-all cursor-pointer ${
                        priority === lvl
                          ? lvl === 'urgent'
                            ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                            : lvl === 'high'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Confidentiality Protection
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Submit as Confidential / Anonymous
                  </span>
                </label>
              </div>
            </div>

            {/* Step 8: Contact Info if not anonymous */}
            {!isAnonymous && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Resident Reporter Name:</span>
                  <div className="flex items-center gap-1.5 mt-0.5 font-semibold text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{reporterName || currentUser?.displayName || 'Resident'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Contact Phone:</span>
                  <div className="relative mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="e.g. 0917-XXX-XXXX"
                      className="w-full pl-7 pr-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer hover:shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Official Incident Report</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
