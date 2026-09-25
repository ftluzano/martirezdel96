import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AnnouncementsView } from './components/AnnouncementsView';
import { DocumentProcessingView } from './components/DocumentProcessingView';
import { ServiceRequestsView } from './components/ServiceRequestsView';
import { TrackerView } from './components/TrackerView';
import { DirectoryView } from './components/DirectoryView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { Footer } from './components/Footer';
import { ThemeSongPlayer } from './components/ThemeSongPlayer';
import { ResidentReportModal } from './components/ResidentReportModal';
import { Announcement, DocumentApplication, ServiceRequest, BarangayOfficial, RequestStatus, UserProfile, UserRole } from './types';
import {
  subscribeAnnouncements,
  saveAnnouncementToDb,
  subscribeDocuments,
  saveDocumentToDb,
  updateDocumentStatusInDb,
  subscribeServices,
  saveServiceToDb,
  updateServiceStatusInDb,
  subscribeOfficials,
  saveOfficialToDb,
  subscribeUsers,
  updateUserRoleInDb
} from './firebase/firestoreService';

function MainPortal() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('announcements');

  // Pure Database States (No local fake data)
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<DocumentApplication[]>([]);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [officials, setOfficials] = useState<BarangayOfficial[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Real-time Firestore Listeners
  useEffect(() => {
    const unsubAnn = subscribeAnnouncements((data) => {
      setAnnouncements(data);
    });

    const unsubDocs = subscribeDocuments((data) => {
      setDocuments(data);
    });

    const unsubServices = subscribeServices((data) => {
      setServices(data);
    });

    const unsubOfficials = subscribeOfficials((data) => {
      setOfficials(data);
    });

    const unsubUsers = subscribeUsers((data) => {
      setUsers(data);
    });

    return () => {
      unsubAnn();
      unsubDocs();
      unsubServices();
      unsubOfficials();
      unsubUsers();
    };
  }, []);

  // If not signed in, show the AuthScreen before entering the main screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  // Database Handlers
  const handleAddAnnouncement = async (newAnn: Announcement) => {
    // Optimistic update
    setAnnouncements(prev => [newAnn, ...prev.filter(a => a.id !== newAnn.id)]);
    try {
      await saveAnnouncementToDb(newAnn);
    } catch (err) {
      console.warn('Failed to save announcement to Firestore:', err);
    }
  };

  const handleAddDocument = async (newDoc: DocumentApplication) => {
    setDocuments(prev => [newDoc, ...prev.filter(d => d.id !== newDoc.id)]);
    try {
      await saveDocumentToDb(newDoc);
    } catch (err) {
      console.warn('Failed to save document application to Firestore:', err);
    }
  };

  const handleAddService = async (newSrv: ServiceRequest) => {
    setServices(prev => [newSrv, ...prev.filter(s => s.id !== newSrv.id)]);
    try {
      await saveServiceToDb(newSrv);
    } catch (err) {
      console.warn('Failed to save service report to Firestore:', err);
    }
  };

  const handleAddOfficial = async (newOff: BarangayOfficial) => {
    setOfficials(prev => [...prev.filter(o => o.id !== newOff.id), newOff]);
    try {
      await saveOfficialToDb(newOff);
    } catch (err) {
      console.warn('Failed to save official to Firestore:', err);
    }
  };

  const handleUpdateDocStatus = async (id: string, status: RequestStatus, notes?: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status,
          notes: notes !== undefined ? notes : d.notes,
          dateProcessed: status === 'completed' || status === 'ready-pickup' ? new Date().toISOString().split('T')[0] : d.dateProcessed
        };
      }
      return d;
    }));
    try {
      await updateDocumentStatusInDb(id, status, notes);
    } catch (err) {
      console.warn('Failed to update document in Firestore:', err);
    }
  };

  const handleUpdateServiceStatus = async (id: string, status: RequestStatus, resolutionNotes?: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status,
          resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : s.resolutionNotes,
          dateResolved: status === 'completed' || status === 'ready-pickup' ? new Date().toISOString().split('T')[0] : s.dateResolved
        };
      }
      return s;
    }));
    try {
      await updateServiceStatusInDb(id, status, resolutionNotes);
    } catch (err) {
      console.warn('Failed to update service in Firestore:', err);
    }
  };

  const handleUpdateUserRole = async (uidOrEmail: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => {
      if (u.uid === uidOrEmail || u.email.toLowerCase() === uidOrEmail.toLowerCase()) {
        return { ...u, role: newRole, assignedBy: currentUser?.email || 'Admin' };
      }
      return u;
    }));
    try {
      await updateUserRoleInDb(uidOrEmail, newRole, currentUser?.email);
    } catch (err) {
      console.warn('Failed to update user role in database:', err);
    }
  };

  return (
    <div className="app-shell relative min-h-screen flex flex-col text-slate-900 overflow-hidden">
      <div className="floating-orb left-[-80px] top-28 h-64 w-64 bg-blue-400/40" />
      <div className="floating-orb right-[-40px] top-20 h-72 w-72 bg-violet-400/30" />
      <div className="floating-orb left-1/3 bottom-8 h-64 w-64 bg-cyan-400/25" />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Hero section only on Announcements tab */}
      {activeTab === 'announcements' && (
        <HeroSection 
          onNavigate={(tab) => setActiveTab(tab)} 
        />
      )}

      {/* Main Content */}
      <main className="relative flex-1 z-10">
        {activeTab === 'announcements' && (
          <AnnouncementsView
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onNavigateToDocs={() => setActiveTab('documents')}
            onAddService={handleAddService}
            onNavigateToTracker={() => setActiveTab('tracker')}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentProcessingView
            onAddDocument={handleAddDocument}
            userDocuments={documents}
            onNavigateToTracker={() => setActiveTab('tracker')}
          />
        )}

        {activeTab === 'services' && (
          <ServiceRequestsView
            services={services}
            onAddService={handleAddService}
            onNavigateToTracker={() => setActiveTab('tracker')}
          />
        )}

        {activeTab === 'tracker' && (
          <TrackerView
            documents={documents}
            services={services}
            onNavigateToDocs={() => setActiveTab('documents')}
            onNavigateToServices={() => setActiveTab('services')}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView
            officials={officials}
            onAddOfficial={handleAddOfficial}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView
            documents={documents}
            services={services}
            users={users}
            onUpdateDocStatus={handleUpdateDocStatus}
            onUpdateServiceStatus={handleUpdateServiceStatus}
            onUpdateUserRole={handleUpdateUserRole}
          />
        )}
      </main>

      {/* Theme Song Player */}
      <ThemeSongPlayer />

      {/* Global Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainPortal />
    </AuthProvider>
  );
}
