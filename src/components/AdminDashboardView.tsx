import React, { useState } from 'react';
import { Announcement, DocumentApplication, ServiceRequest, RequestStatus, UserProfile, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Wrench, 
  Search, 
  Camera, 
  X, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  UserPlus,
  Mail,
  Phone,
  AlertTriangle,
  Bell,
  Megaphone,
  Send
} from 'lucide-react';

interface AdminDashboardViewProps {
  documents: DocumentApplication[];
  services: ServiceRequest[];
  users: UserProfile[];
  announcements: Announcement[];
  onAddAnnouncement: (newAnn: Announcement) => void;
  onUpdateDocStatus: (
    id: string,
    status: RequestStatus,
    notes?: string,
    providedFile?: Pick<DocumentApplication, 'providedFileName' | 'providedFileType' | 'providedFileData' | 'providedFileSize' | 'providedAt'>
  ) => Promise<void>;
  onUpdateServiceStatus: (id: string, status: RequestStatus, resolutionNotes?: string) => void;
  onUpdateUserRole: (uidOrEmail: string, newRole: UserRole) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  documents,
  services,
  users,
  announcements,
  onAddAnnouncement,
  onUpdateDocStatus,
  onUpdateServiceStatus,
  onUpdateUserRole
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const isOfficial = currentUser?.role === 'official';

  // Default tab: if admin, show users or services; if official, show services
  const [activeTab, setActiveTab] = useState<'services' | 'documents' | 'users'>('services');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);
  const [viewingProof, setViewingProof] = useState<{ url: string; title: string; ref: string } | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState<Announcement['category']>('Advisory');
  const [announcementUrgent, setAnnouncementUrgent] = useState(false);

  // Metrics
  const pendingDocs = documents.filter(d => d.status === 'pending').length;
  const readyDocs = documents.filter(d => d.status === 'ready-pickup').length;
  const pendingServices = services.filter(s => s.status === 'pending' || s.status === 'in-review').length;
  const resolvedServices = services.filter(s => s.status === 'ready-pickup' || s.status === 'completed').length;
  
  const totalUsersCount = users.length;
  const officialsCount = users.filter(u => u.role === 'official').length;
  const residentsCount = users.filter(u => u.role === 'resident').length;

  const showToast = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => {
      setActionSuccessNotice(null);
    }, 4000);
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementText.trim()) return;

    const newAnnouncement: Announcement = {
      id: 'ann-' + Date.now(),
      title: announcementTitle.trim(),
      category: announcementCategory,
      content: announcementText.trim(),
      date: new Date().toISOString().split('T')[0],
      author: currentUser?.displayName || 'Barangay Team',
      authorRole: currentUser?.role === 'admin' ? 'Administrator' : 'Official',
      isUrgent: announcementUrgent,
    };

    onAddAnnouncement(newAnnouncement);
    setAnnouncementTitle('');
    setAnnouncementText('');
    setAnnouncementCategory('Advisory');
    setAnnouncementUrgent(false);
    showToast('Announcement published live to the community updates feed.');
  };

  const handleRoleChange = (targetUser: UserProfile, newRole: UserRole) => {
    onUpdateUserRole(targetUser.uid || targetUser.email, newRole);
    showToast(`Role for ${targetUser.displayName} updated to "${newRole.toUpperCase()}".`);
  };

  const handleQuickStatusUpdate = (srv: ServiceRequest, newStatus: RequestStatus) => {
    onUpdateServiceStatus(srv.id, newStatus);
    setSelectedService({ ...srv, status: newStatus });
    showToast(`Updated ticket ${srv.referenceNumber} to ${newStatus}`);
  };

  const handleDocumentFileUpload = async (doc: DocumentApplication, file: File | undefined) => {
    if (!file) return;
    if (file.size > 700 * 1024) {
      showToast('File is too large. Please upload a PDF or image under 700 KB.');
      return;
    }
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only PDF, JPG, PNG, and WebP files can be provided.');
      return;
    }

    setUploadingDocumentId(doc.id);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await onUpdateDocStatus(doc.id, doc.status, undefined, {
          providedFileName: file.name,
          providedFileType: file.type,
          providedFileData: reader.result as string,
          providedFileSize: file.size,
          providedAt: new Date().toISOString()
        });
        showToast(`Provided file attached to ${doc.referenceNumber}.`);
      } catch (error: any) {
        showToast(error?.message || 'The file could not be saved. Please try again.');
      } finally {
        setUploadingDocumentId(null);
      }
    };
    reader.onerror = () => {
      setUploadingDocumentId(null);
      showToast('The file could not be read. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    if (!services.length) {
      setSelectedService(null);
      return;
    }

    if (!selectedService || !services.some(s => s.id === selectedService.id)) {
      setSelectedService(services[0]);
    }
  }, [services, selectedService]);

  // Filtered Services
  const filteredServices = services.filter(s => {
    const matchesSearch = !search ||
      s.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Documents
  const filteredDocs = documents.filter(d => {
    const matchesSearch = !search || 
      d.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.applicantName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = !search ||
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      (u.purok && u.purok.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return 'Active recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast Notification */}
      {actionSuccessNotice && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top-4 text-xs font-semibold border border-emerald-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {isAdmin ? 'Barangay Response & Administration Desk' : 'Barangay Report Monitoring Desk'}
            </h1>
            {isAdmin ? (
              <span className="px-2.5 py-0.5 bg-purple-100 border border-purple-300 text-purple-800 text-[10px] font-bold rounded-full uppercase">
                Admin Panel
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                Official Access
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin 
              ? 'Track citizen reports, assign response actions, and publish live barangay advisories in real time.'
              : 'Review resident concerns, update case statuses, and publish official announcements without refreshing the portal.'}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Resident Reports</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-2xl font-black font-mono text-rose-600 mt-1">{pendingServices}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{resolvedServices} resolved to date</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Document Requests</span>
            <FileText className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-2xl font-black font-mono text-blue-700 mt-1">{pendingDocs}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{readyDocs} ready for release</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Portal Users Logged In</span>
            <Users className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-2xl font-black font-mono text-indigo-600 mt-1">{totalUsersCount}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{residentsCount} active citizens</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Assigned Officials</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-600 mt-1">{officialsCount}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Authorized barangay team</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold">Live Operations Summary</h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wide text-slate-400">Realtime</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <div className="text-rose-700 font-bold text-xl">{pendingServices}</div>
              <div className="text-rose-600 font-medium">Pending Reports</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-amber-700 font-bold text-xl">{services.filter(s => s.status === 'in-review').length}</div>
              <div className="text-amber-600 font-medium">In Review</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-emerald-700 font-bold text-xl">{resolvedServices}</div>
              <div className="text-emerald-600 font-medium">Resolved</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="text-blue-700 font-bold text-xl">{announcements.length}</div>
              <div className="text-blue-600 font-medium">Announcements</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleAnnouncementSubmit} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Megaphone className="w-4 h-4 text-violet-600" />
              <h3 className="text-sm font-bold">Publish an Advisory</h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <input
              type="text"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder="Announcement title"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />

            <select
              value={announcementCategory}
              onChange={(e) => setAnnouncementCategory(e.target.value as Announcement['category'])}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="Advisory">Advisory</option>
              <option value="Emergency">Emergency</option>
              <option value="Health">Health</option>
              <option value="Events">Events</option>
              <option value="Youth">Youth</option>
              <option value="General">General</option>
            </select>

            <textarea
              rows={3}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Share update, reminder, or alert for residents..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />

            <label className="flex items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={announcementUrgent}
                onChange={(e) => setAnnouncementUrgent(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              Mark as urgent
            </label>

            <button
              type="submit"
              className="w-full px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Publish live update
            </button>
          </div>
        </form>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => { setActiveTab('services'); setStatusFilter('all'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'services'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Citizen Reports ({services.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('documents'); setStatusFilter('all'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents ({documents.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('users'); setRoleFilter('all'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Directory & Roles ({users.length})</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'users' ? 'Search by name, email...' : 'Search by title, ref...'}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
            />
          </div>

          {activeTab === 'users' ? (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-700"
            >
              <option value="all">All Roles</option>
              <option value="official">Officials</option>
              <option value="resident">Residents</option>
              <option value="admin">Admins</option>
            </select>
          ) : (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-review">In-Review</option>
              <option value="ready-pickup">Resolved</option>
              <option value="completed">Completed / Closed</option>
            </select>
          )}
        </div>

      </div>

      {/* ======================================================== */}
      {/* TAB 1: SERVICES & RESIDENT REPORTS (OFFICIALS & ADMIN) */}
      {/* ======================================================== */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.9fr] gap-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-rose-400" />
                  <span>Resident Reports & Community Concerns</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Officials and Admin can review reports submitted by residents, check uploaded evidence photos, and update action progress.
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded text-slate-300">
                Showing {filteredServices.length} reports
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="w-[20%] py-2.5 px-2 sm:px-3">Ticket Ref</th>
                    <th className="hidden 2xl:table-cell w-[13%] py-2.5 px-3">Category</th>
                    <th className="w-[31%] py-2.5 px-2 sm:px-3">Report Details</th>
                    <th className="hidden 2xl:table-cell w-[14%] py-2.5 px-3">Photo Proof</th>
                    <th className="w-[21%] py-2.5 px-2 sm:px-3">Reported By / Area</th>
                    <th className="hidden 2xl:table-cell w-[10%] py-2.5 px-3">Priority</th>
                    <th className="w-[18%] py-2.5 px-2 sm:px-3">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map((srv) => (
                    <tr
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedService?.id === srv.id ? 'bg-blue-50/60' : ''}`}
                    >
                      <td className="py-3 px-2 sm:px-3 font-mono font-bold text-blue-700 align-top break-words">
                        {srv.referenceNumber}
                        <span className="block text-[10px] text-slate-400 font-normal">{srv.dateReported}</span>
                      </td>
                      <td className="hidden 2xl:table-cell py-3 px-3 capitalize font-medium whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-semibold text-[11px]">
                          {srv.category.replace(/-/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-3 align-top break-words">
                        <div className="font-bold text-slate-900 leading-snug">{srv.title}</div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{srv.description}</p>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">📍 {srv.location}</div>
                      </td>
                      <td className="hidden 2xl:table-cell py-3 px-3 whitespace-nowrap">
                        {srv.photoProof ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingProof({ url: srv.photoProof!, title: srv.title, ref: srv.referenceNumber });
                              }}
                              className="relative group rounded-lg overflow-hidden border border-slate-300 hover:border-blue-500 shadow-2xs transition-all cursor-pointer block flex-shrink-0"
                              title="Click to view full photo evidence"
                            >
                              <img
                                src={srv.photoProof}
                                alt="Proof preview"
                                className="w-12 h-10 object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Camera className="w-3.5 h-3.5" />
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingProof({ url: srv.photoProof!, title: srv.title, ref: srv.referenceNumber });
                              }}
                              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                            >
                              View Photo
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No image</span>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-3 align-top break-words">
                        <div className="font-semibold text-slate-800">{srv.reportedBy}</div>
                        <div className="text-[11px] text-slate-500">{srv.purok}</div>
                        <div className="text-[10px] text-slate-400">{srv.contactNumber}</div>
                      </td>
                      <td className="hidden 2xl:table-cell py-3 px-3 capitalize whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          srv.priority === 'urgent'
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : srv.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {srv.priority}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-3 align-top" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={srv.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as RequestStatus;
                            onUpdateServiceStatus(srv.id, newStatus);
                            setSelectedService({ ...srv, status: newStatus });
                            showToast(`Updated ticket ${srv.referenceNumber} to ${newStatus}`);
                          }}
                          className={`w-full min-w-0 text-[10px] sm:text-xs font-bold py-1 px-1 sm:px-2 rounded-lg border cursor-pointer ${
                            srv.status === 'completed'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : srv.status === 'ready-pickup'
                              ? 'bg-blue-50 border-blue-300 text-blue-800'
                              : srv.status === 'in-review'
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-review">In-Review</option>
                          <option value="ready-pickup">Resolved</option>
                          <option value="completed">Completed / Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredServices.length === 0 && (
              <div className="p-12 text-center text-slate-500 text-xs">
                No matching community reports found.
              </div>
            )}
          </div>

          <aside className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-2xs h-fit xl:sticky xl:top-24">
            {selectedService ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">Selected report</div>
                    <div className="font-mono text-sm font-black text-blue-700">{selectedService.referenceNumber}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    selectedService.status === 'completed'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : selectedService.status === 'ready-pickup'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : selectedService.status === 'in-review'
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    {selectedService.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-black text-slate-900 leading-snug">{selectedService.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{selectedService.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <div className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Area</div>
                    <div className="mt-1 font-semibold text-slate-800">{selectedService.purok}</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <div className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Priority</div>
                    <div className="mt-1 font-semibold capitalize text-slate-800">{selectedService.priority}</div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 space-y-1.5">
                  <div><strong className="text-slate-800">Resident:</strong> {selectedService.reportedBy}</div>
                  <div><strong className="text-slate-800">Contact:</strong> {selectedService.contactNumber}</div>
                  <div><strong className="text-slate-800">Location:</strong> {selectedService.location}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={selectedService.contactNumber && selectedService.contactNumber !== 'N/A' ? `tel:${selectedService.contactNumber}` : undefined}
                    aria-disabled={!selectedService.contactNumber || selectedService.contactNumber === 'N/A'}
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-bold ${
                      selectedService.contactNumber && selectedService.contactNumber !== 'N/A'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-200 text-slate-400 pointer-events-none'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call resident
                  </a>
                  <a
                    href={selectedService.reporterEmail && !selectedService.reporterEmail.startsWith('confidential@') ? `mailto:${selectedService.reporterEmail}?subject=${encodeURIComponent(`Regarding report ${selectedService.referenceNumber}`)}` : undefined}
                    aria-disabled={!selectedService.reporterEmail || selectedService.reporterEmail.startsWith('confidential@')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-bold ${
                      selectedService.reporterEmail && !selectedService.reporterEmail.startsWith('confidential@')
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-200 text-slate-400 pointer-events-none'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email resident
                  </a>
                </div>

                {selectedService.photoProof && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Evidence</div>
                    <img
                      src={selectedService.photoProof}
                      alt="Selected report evidence"
                      className="w-full h-36 object-cover rounded-xl border border-slate-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setViewingProof({ url: selectedService.photoProof!, title: selectedService.title, ref: selectedService.referenceNumber })}
                      className="w-full px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg cursor-pointer"
                    >
                      View full photo
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Quick response</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['pending','in-review','ready-pickup','completed'] as RequestStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleQuickStatusUpdate(selectedService, status)}
                        className={`px-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          selectedService.status === status
                            ? 'bg-slate-900 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {status === 'ready-pickup' ? 'Resolved' : status === 'completed' ? 'Closed' : status === 'in-review' ? 'In Review' : 'Pending'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Select a report to review case details.</div>
            )}
          </aside>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DOCUMENT PROCESSING DESK */}
      {/* ======================================================== */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Document Applications & Certification Desk</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Process Barangay Clearances, Certificates of Residency, Indigency, and preview official print certificates.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded text-slate-300">
              Showing {filteredDocs.length} applications
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Reference No.</th>
                  <th className="py-2.5 px-3">Document</th>
                  <th className="py-2.5 px-3">Applicant Name</th>
                  <th className="py-2.5 px-3">Fee</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Provide File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {doc.referenceNumber}
                      <span className="block text-[10px] text-slate-400 font-normal">{doc.dateSubmitted}</span>
                    </td>
                    <td className="py-3 px-3 capitalize font-semibold whitespace-nowrap text-slate-900">
                      {doc.documentType.replace(/-/g, ' ')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{doc.applicantName}</div>
                      <div className="text-[11px] text-slate-400">{doc.purok} · {doc.applicantPhone}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold whitespace-nowrap">
                      {doc.fee === 0 ? 'Free' : `₱${doc.fee}`}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <select
                        value={doc.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as RequestStatus;
                          onUpdateDocStatus(doc.id, newStatus);
                          showToast(`Updated document application ${doc.referenceNumber}`);
                        }}
                        className="text-xs font-semibold py-1 px-2.5 rounded border border-slate-300 bg-white cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-review">In-Review</option>
                        <option value="ready-pickup">Ready for Pick-up</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.providedFileData && (
                          <a
                            href={doc.providedFileData}
                            download={doc.providedFileName || 'barangay-document'}
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 whitespace-nowrap"
                          >
                            File attached
                          </a>
                        )}
                        <label className={`px-3 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition-colors ${uploadingDocumentId === doc.id ? 'opacity-60 pointer-events-none' : ''}`}>
                          {uploadingDocumentId === doc.id ? 'Reading file...' : doc.providedFileData ? 'Replace file' : 'Upload file'}
                          <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              handleDocumentFileUpload(doc, e.target.files?.[0]);
                              e.currentTarget.value = '';
                            }}
                          />
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDocs.length === 0 && (
            <div className="p-12 text-center text-slate-500 text-xs">
              No matching document applications found.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: USER DIRECTORY & ROLE ASSIGNMENT (ADMIN FRANKLIN) */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 rounded-2xl p-5 text-white border border-purple-800/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-400/30">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  User Accounts & Official Role Management
                </h3>
              </div>
              <p className="text-xs text-purple-200/80 max-w-2xl leading-relaxed">
                As Administrator, you can view everyone who logged in to the portal and promote residents to <strong>Official</strong>. 
                Assigned Officials immediately gain access to the <strong>Official Desk</strong> to review citizen reports and publish <strong>Announcements/Advisories</strong>.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-purple-900/60 border border-purple-400/20 px-3 py-2 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="block font-bold text-white text-[11px]">Primary Admin Account:</span>
                <span className="text-[11px] font-mono text-purple-200">franklinkyleluzano@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Citizen / User</th>
                    <th className="py-2.5 px-3">Current Role</th>
                    <th className="py-2.5 px-3">Last Active Login</th>
                    <th className="py-2.5 px-3">Contact & Area</th>
                    <th className="py-2.5 px-3 text-right">Role Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const isFranklin = user.email.toLowerCase() === 'franklinkyleluzano@gmail.com';

                    return (
                      <tr key={user.uid || user.email} className="hover:bg-slate-50 transition-colors">
                        
                        {/* User Identity */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              user.role === 'admin'
                                ? 'bg-purple-600 text-white'
                                : user.role === 'official'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span className="truncate">{user.displayName || 'Resident User'}</span>
                                {isFranklin && (
                                  <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[9px] font-extrabold rounded">
                                    YOU / ADMIN
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono truncate block flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                              👑 Administrator
                            </span>
                          ) : user.role === 'official' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                              🛡️ Official Staff
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                              👤 Resident
                            </span>
                          )}
                          {user.assignedBy && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Assigned by admin
                            </span>
                          )}
                        </td>

                        {/* Last Login */}
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatTimestamp(user.lastLogin)}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Registered: {user.createdAt || 'Active'}
                          </span>
                        </td>

                        {/* Contact info */}
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                          <div>{user.purok || 'Purok 1'}</div>
                          <div className="text-[11px] text-slate-400">{user.phone || 'No phone recorded'}</div>
                        </td>

                        {/* Role Assignment Actions */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {isFranklin ? (
                            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                              Superuser (Permanent)
                            </span>
                          ) : isAdmin ? (
                            <div className="inline-flex items-center gap-1.5">
                              {user.role === 'resident' ? (
                                <button
                                  type="button"
                                  onClick={() => handleRoleChange(user, 'official')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                  title="Grant Official role to this user"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Assign Official</span>
                                </button>
                              ) : user.role === 'official' ? (
                                <button
                                  type="button"
                                  onClick={() => handleRoleChange(user, 'resident')}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors border border-slate-300 cursor-pointer"
                                  title="Reset this user to regular Resident role"
                                >
                                  <span>Revoke to Resident</span>
                                </button>
                              ) : null}

                              {/* Dropdown for explicit role assignment */}
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium cursor-pointer"
                              >
                                <option value="resident">Resident</option>
                                <option value="official">Official</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              View only
                            </span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-slate-500 text-xs space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No registered users in live database yet.</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  When residents or staff sign in or register through Firebase Authentication, their live accounts will appear here automatically.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Certificate Modal */}

      {/* Resident Proof Modal */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-blue-400 font-bold block">{viewingProof.ref}</span>
                <span className="text-xs font-semibold text-slate-200 truncate block">{viewingProof.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingProof(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={viewingProof.url}
                alt="Resident Proof Full Resolution"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingProof(null)}
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
