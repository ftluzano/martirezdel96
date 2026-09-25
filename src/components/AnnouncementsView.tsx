import React, { useState } from 'react';
import { Announcement, ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Clock,
  X,
  BellOff
} from 'lucide-react';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onAddAnnouncement: (newAnn: Announcement) => void;
  onNavigateToDocs: () => void;
  onAddService: (newService: ServiceRequest) => void;
  onNavigateToTracker?: () => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  onAddAnnouncement,
  onNavigateToDocs,
  onAddService,
  onNavigateToTracker,
}) => {
  const { currentUser } = useAuth();

  // Use only real announcements from the Firebase database
  const displayAnnouncements = announcements;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);

  // New Announcement form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Announcement['category']>('Advisory');
  const [newContent, setNewContent] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newIsUrgent, setNewIsUrgent] = useState(false);

  const categories = ['All', 'Emergency', 'Health', 'Events', 'Youth', 'Advisory', 'General'];

  const filteredAnnouncements = displayAnnouncements.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreateAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: Announcement = {
      id: 'ann-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      date: new Date().toISOString().split('T')[0],
      author: currentUser?.displayName || (currentUser?.role === 'admin' ? 'Barangay Administrator' : 'Office of the Barangay Captain'),
      authorRole: currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role === 'official' ? 'Official' : 'Staff',
      isUrgent: newIsUrgent,
      eventDate: newEventDate ? newEventDate.trim() : undefined,
      location: newLocation ? newLocation.trim() : undefined,
    };

    onAddAnnouncement(created);
    setShowCreateModal(false);
    setNewTitle('');
    setNewContent('');
    setNewEventDate('');
    setNewLocation('');
    setNewIsUrgent(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* SERBISYONG MARTIREZ UPDATES SECTION */}
      <section className="space-y-6">
        
        {/* Clean, Professional Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Serbisyong Martirez Updates
            </h1>
          </div>

          {/* Post Advisory: for official and admin accounts */}
          {(currentUser?.role === 'official' || currentUser?.role === 'admin') && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Advisory</span>
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements, topics..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            />
          </div>
        </div>

        {/* Announcements Cards Grid */}
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BellOff className="w-6 h-6" />
            </div>
            {displayAnnouncements.length === 0 ? (
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">
                  Walang nakatalang anunsyo sa kasalukuyan
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Ang mga opisyal na patalastas at advisory ay lalabas dito kapag nai-publish ng Barangay Administration.
                </p>
              </div>
            ) : (
              <p className="text-xs">
                No announcements matched your search criteria. Try a different keyword or category.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAnnouncements.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3.5 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  
                  {/* Badge & Date */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        item.category === 'Emergency'
                          ? 'bg-red-100 text-red-800'
                          : item.category === 'Health'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.category === 'Youth'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.category}
                      </span>
                      {item.isUrgent && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full animate-pulse">
                          Urgent Notice
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {item.content}
                  </p>

                  {/* Metadata: Location & Event Date */}
                  {(item.eventDate || item.location) && (
                    <div className="pt-2 text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {item.eventDate && (
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Schedule: {item.eventDate}</span>
                        </div>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>Location: {item.location}</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Source: <strong className="text-slate-700">{item.author}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewingAnnouncement(item)}
                    className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Advisory</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>

      {/* FULL ANNOUNCEMENT DETAILS */}
      {viewingAnnouncement && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <span className="text-xs font-semibold uppercase text-blue-400 tracking-wide">
                Barangay Advisory Details
              </span>
              <button
                type="button"
                onClick={() => setViewingAnnouncement(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                  {viewingAnnouncement.category}
                </span>
                <span className="text-xs text-slate-500">
                  {viewingAnnouncement.date}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {viewingAnnouncement.title}
              </h2>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {viewingAnnouncement.content}
              </p>

              {(viewingAnnouncement.eventDate || viewingAnnouncement.location) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  {viewingAnnouncement.eventDate && (
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Date/Time: {viewingAnnouncement.eventDate}</span>
                    </div>
                  )}
                  {viewingAnnouncement.location && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>Venue: {viewingAnnouncement.location}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 text-xs text-slate-500">
                Authorized by: <strong className="text-slate-800">{viewingAnnouncement.author}</strong> ({viewingAnnouncement.authorRole})
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingAnnouncement(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE ANNOUNCEMENT */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                Create New Barangay Advisory
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncementSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Scheduled Water Interruption or Barangay Assembly"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Advisory">Advisory</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Health">Health</option>
                  <option value="Events">Events</option>
                  <option value="Youth">Youth</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Details / Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Full text of the announcement..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Date / Schedule (Optional)
                  </label>
                  <input
                    type="text"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    placeholder="e.g. Sept 28, 9:00 AM"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location / Venue (Optional)
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Covered Court"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsUrgent}
                    onChange={(e) => setNewIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-xs font-semibold text-red-700">
                    Mark as Urgent Priority Advisory
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Publish Advisory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
