import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  onSnapshot, 
  query, 
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Announcement, DocumentApplication, ServiceRequest, BarangayOfficial, RequestStatus, UserProfile, UserRole } from '../types';

// Cache keys for resilient persistent storage
const CACHE_KEYS = {
  ANNOUNCEMENTS: 'martirez_db_announcements',
  DOCUMENTS: 'martirez_db_documents',
  SERVICES: 'martirez_db_services',
  OFFICIALS: 'martirez_db_officials',
  USERS: 'martirez_db_users'
};

const getCache = <T>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setCache = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

export const generateServiceReferenceNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BM96-REP-${year}-${random}`;
};

// ==========================================
// ANNOUNCEMENTS
// ==========================================
export const subscribeAnnouncements = (
  onData: (announcements: Announcement[]) => void
): Unsubscribe => {
  let isListening = true;

  try {
    const unsub = onSnapshot(
      collection(db, 'announcements'),
      (snapshot) => {
        if (!isListening) return;
        const list: Announcement[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Announcement);
        });
        // Sort newest first
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setCache(CACHE_KEYS.ANNOUNCEMENTS, list);
        onData(list);
      },
      (err) => {
        console.warn('[Firestore Announcements] Realtime listener notice:', err.message);
        onData(getCache<Announcement>(CACHE_KEYS.ANNOUNCEMENTS));
      }
    );

    return () => {
      isListening = false;
      try { unsub(); } catch {}
    };
  } catch (err: any) {
    console.warn('[Firestore Announcements] Error setting up listener:', err?.message);
    onData(getCache<Announcement>(CACHE_KEYS.ANNOUNCEMENTS));
    return () => {};
  }
};

export const saveAnnouncementToDb = async (announcement: Announcement): Promise<void> => {
  // Always update local database state immediately
  const current = getCache<Announcement>(CACHE_KEYS.ANNOUNCEMENTS);
  const updated = [announcement, ...current.filter(a => a.id !== announcement.id)];
  setCache(CACHE_KEYS.ANNOUNCEMENTS, updated);

  try {
    const docRef = doc(db, 'announcements', announcement.id);
    await setDoc(docRef, announcement, { merge: true });
  } catch (error: any) {
    console.warn('[Firestore Announcements] Cloud sync notice (saved locally):', error?.message);
  }
};

// ==========================================
// DOCUMENTS (APPLICATIONS)
// ==========================================
export const subscribeDocuments = (
  onData: (docs: DocumentApplication[]) => void
): Unsubscribe => {
  let isListening = true;

  try {
    const unsub = onSnapshot(
      collection(db, 'documents'),
      (snapshot) => {
        if (!isListening) return;
        const list: DocumentApplication[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as DocumentApplication);
        });
        list.sort((a, b) => (b.dateSubmitted || '').localeCompare(a.dateSubmitted || ''));
        setCache(CACHE_KEYS.DOCUMENTS, list);
        onData(list);
      },
      (err) => {
        console.warn('[Firestore Documents] Realtime listener notice:', err.message);
        onData(getCache<DocumentApplication>(CACHE_KEYS.DOCUMENTS));
      }
    );

    return () => {
      isListening = false;
      try { unsub(); } catch {}
    };
  } catch (err: any) {
    console.warn('[Firestore Documents] Error setting up listener:', err?.message);
    onData(getCache<DocumentApplication>(CACHE_KEYS.DOCUMENTS));
    return () => {};
  }
};

export const saveDocumentToDb = async (docApp: DocumentApplication): Promise<void> => {
  const current = getCache<DocumentApplication>(CACHE_KEYS.DOCUMENTS);
  const updated = [docApp, ...current.filter(d => d.id !== docApp.id)];
  setCache(CACHE_KEYS.DOCUMENTS, updated);

  try {
    const docRef = doc(db, 'documents', docApp.id);
    await setDoc(docRef, docApp, { merge: true });
  } catch (error: any) {
    console.warn('[Firestore Documents] Cloud sync notice (saved locally):', error?.message);
  }
};

export const updateDocumentStatusInDb = async (
  id: string,
  status: RequestStatus,
  notes?: string
): Promise<void> => {
  const current = getCache<DocumentApplication>(CACHE_KEYS.DOCUMENTS);
  const updated = current.map(d => {
    if (d.id === id) {
      return {
        ...d,
        status,
        notes: notes !== undefined ? notes : d.notes,
        dateProcessed: status === 'completed' || status === 'ready-pickup' ? new Date().toISOString().split('T')[0] : d.dateProcessed
      };
    }
    return d;
  });
  setCache(CACHE_KEYS.DOCUMENTS, updated);

  try {
    const docRef = doc(db, 'documents', id);
    const updates: any = { 
      status,
      updatedAt: new Date().toISOString()
    };
    if (notes !== undefined) updates.notes = notes;
    if (status === 'completed' || status === 'ready-pickup') {
      updates.dateProcessed = new Date().toISOString().split('T')[0];
    }
    await setDoc(docRef, updates, { merge: true });
  } catch (error: any) {
    console.warn('[Firestore Documents] Status update cloud notice:', error?.message);
  }
};

// ==========================================
// SERVICE REQUESTS / RESIDENT REPORTS
// ==========================================
const mergeServiceRecords = (cloud: ServiceRequest[], cached: ServiceRequest[]) => {
  const merged = new Map<string, ServiceRequest>();

  [...cached, ...cloud].forEach((entry) => {
    const key = entry.id || entry.referenceNumber;
    if (!key) return;

    const existing = merged.get(key);
    merged.set(key, existing ? { ...existing, ...entry } : entry);
  });

  return Array.from(merged.values()).sort((a, b) => (b.dateReported || '').localeCompare(a.dateReported || ''));
};

export const subscribeServices = (
  onData: (services: ServiceRequest[]) => void
): Unsubscribe => {
  let isListening = true;

  try {
    const unsub = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        if (!isListening) return;
        const list: ServiceRequest[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<ServiceRequest>;
          const normalized: ServiceRequest = {
            ...(data as any),
            id: docSnap.id,
            referenceNumber: data.referenceNumber || generateServiceReferenceNumber(),
          };
          list.push(normalized);
        });

        const cached = getCache<ServiceRequest>(CACHE_KEYS.SERVICES);
        const merged = mergeServiceRecords(list, cached);
        setCache(CACHE_KEYS.SERVICES, merged);
        onData(merged);
      },
      (err) => {
        console.warn('[Firestore Services] Realtime listener notice:', err.message);
        const fallback = getCache<ServiceRequest>(CACHE_KEYS.SERVICES);
        onData(fallback);
      }
    );

    return () => {
      isListening = false;
      try { unsub(); } catch {}
    };
  } catch (err: any) {
    console.warn('[Firestore Services] Error setting up listener:', err?.message);
    onData(getCache<ServiceRequest>(CACHE_KEYS.SERVICES));
    return () => {};
  }
};

export const saveServiceToDb = async (service: ServiceRequest): Promise<void> => {
  const normalizedService: ServiceRequest = {
    ...service,
    referenceNumber: service.referenceNumber?.trim() || generateServiceReferenceNumber(),
    createdAt: service.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const current = getCache<ServiceRequest>(CACHE_KEYS.SERVICES);
  const updated = [normalizedService, ...current.filter(s => s.id !== normalizedService.id && s.referenceNumber !== normalizedService.referenceNumber)];
  setCache(CACHE_KEYS.SERVICES, updated);

  try {
    const docRef = doc(db, 'services', normalizedService.id);
    await setDoc(docRef, normalizedService, { merge: true });
  } catch (error: any) {
    console.warn('[Firestore Services] Cloud sync notice (saved locally):', error?.message);
    // Last-resort persisted copy so the admin dashboard can still recover the record in the same browser session.
    const persisted = getCache<ServiceRequest>(CACHE_KEYS.SERVICES);
    setCache(CACHE_KEYS.SERVICES, [normalizedService, ...persisted.filter(s => s.id !== normalizedService.id && s.referenceNumber !== normalizedService.referenceNumber)]);
  }
};

export const updateServiceStatusInDb = async (
  id: string,
  status: RequestStatus,
  resolutionNotes?: string
): Promise<void> => {
  const current = getCache<ServiceRequest>(CACHE_KEYS.SERVICES);
  const updated = current.map(s => {
    if (s.id === id) {
      return {
        ...s,
        status,
        resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : s.resolutionNotes,
        dateResolved: status === 'completed' || status === 'ready-pickup' ? new Date().toISOString().split('T')[0] : s.dateResolved
      };
    }
    return s;
  });
  setCache(CACHE_KEYS.SERVICES, updated);

  try {
    const docRef = doc(db, 'services', id);
    const updates: any = { 
      status,
      updatedAt: new Date().toISOString()
    };
    if (resolutionNotes !== undefined) updates.resolutionNotes = resolutionNotes;
    if (status === 'completed' || status === 'ready-pickup') {
      updates.dateResolved = new Date().toISOString().split('T')[0];
    }
    await setDoc(docRef, updates, { merge: true });
  } catch (error: any) {
    console.warn('[Firestore Services] Status update cloud notice:', error?.message);
  }
};

// ==========================================
// BARANGAY OFFICIALS
// ==========================================
export const subscribeOfficials = (
  onData: (officials: BarangayOfficial[]) => void
): Unsubscribe => {
  let isListening = true;

  try {
    const unsub = onSnapshot(
      collection(db, 'officials'),
      (snapshot) => {
        if (!isListening) return;
        const list: BarangayOfficial[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as BarangayOfficial);
        });
        setCache(CACHE_KEYS.OFFICIALS, list);
        onData(list);
      },
      (error) => {
        console.warn('[Firestore Officials] Permission notice, serving local state:', error.message);
        onData(getCache<BarangayOfficial>(CACHE_KEYS.OFFICIALS));
      }
    );

    return () => {
      isListening = false;
      try { unsub(); } catch {}
    };
  } catch (err: any) {
    console.warn('[Firestore Officials] Error setting up listener:', err?.message);
    onData(getCache<BarangayOfficial>(CACHE_KEYS.OFFICIALS));
    return () => {};
  }
};

export const saveOfficialToDb = async (official: BarangayOfficial): Promise<void> => {
  const current = getCache<BarangayOfficial>(CACHE_KEYS.OFFICIALS);
  const updated = [...current.filter(o => o.id !== official.id), official];
  setCache(CACHE_KEYS.OFFICIALS, updated);

  try {
    const docRef = doc(db, 'officials', official.id);
    await setDoc(docRef, official);
  } catch (error: any) {
    console.warn('[Firestore Officials] Cloud sync notice (saved locally):', error?.message);
  }
};

// ==========================================
// USERS & ROLE ASSIGNMENT (LIVE FIRESTORE ONLY)
// ==========================================
const SUPER_ADMIN_EMAIL = 'franklinkyleluzano@gmail.com';

export const getUsersCache = (): UserProfile[] => {
  try {
    localStorage.removeItem('martirez_db_users'); // Purge any legacy mock users
  } catch {}

  const cached = getCache<UserProfile>(CACHE_KEYS.USERS);
  // Strictly filter out any mock accounts
  return cached.filter(u => {
    const e = (u.email || '').toLowerCase();
    return e !== 'maria.santos@gmail.com' && e !== 'juan.delacruz@yahoo.com' && e !== 'kristine.reyes@gmail.com' && u.uid !== 'admin-franklin-super';
  });
};

export const subscribeUsers = (
  onData: (users: UserProfile[]) => void
): Unsubscribe => {
  let isListening = true;

  try {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (!isListening) return;
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const email = (data.email || '').toLowerCase();
          // Filter out any mock users
          if (email === 'maria.santos@gmail.com' || email === 'juan.delacruz@yahoo.com' || email === 'kristine.reyes@gmail.com' || docSnap.id === 'admin-franklin-super') {
            return;
          }
          list.push({ uid: docSnap.id, ...data } as UserProfile);
        });

        // Ensure franklinkyleluzano@gmail.com always has admin role
        const cleanList = list.map(u => {
          if (u.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
            return { ...u, role: 'admin' as UserRole };
          }
          return u;
        });

        setCache(CACHE_KEYS.USERS, cleanList);
        onData(cleanList);
      },
      (error) => {
        console.warn('[Firestore Users] Live snapshot notice:', error.message);
        onData(getUsersCache());
      }
    );

    return () => {
      isListening = false;
      try { unsub(); } catch {}
    };
  } catch (err: any) {
    console.warn('[Firestore Users] Error setting up listener:', err?.message);
    onData(getUsersCache());
    return () => {};
  }
};

export const saveUserToDb = async (user: UserProfile): Promise<UserProfile> => {
  const current = getUsersCache();
  const emailLower = (user.email || '').toLowerCase().trim();
  const docId = user.uid || emailLower.replace(/[@.]/g, '_');

  // Check if role was already set in cache
  const existingCached = current.find(u => u.uid === user.uid || (u.email && u.email.toLowerCase() === emailLower));
  
  let effectiveRole: UserRole = 'resident';
  let assignedBy = user.assignedBy || existingCached?.assignedBy;

  if (emailLower === SUPER_ADMIN_EMAIL.toLowerCase()) {
    effectiveRole = 'admin';
  } else if (existingCached?.role && existingCached.role !== 'resident') {
    effectiveRole = existingCached.role;
  } else if (user.role && user.role !== 'resident') {
    effectiveRole = user.role;
  }

  // Check live Firestore document to never overwrite an assigned official role
  try {
    const docRef = doc(db, 'users', docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const liveData = snap.data();
      if (emailLower === SUPER_ADMIN_EMAIL.toLowerCase()) {
        effectiveRole = 'admin';
      } else if (liveData.role && liveData.role !== 'resident') {
        effectiveRole = liveData.role as UserRole;
        if (liveData.assignedBy) assignedBy = liveData.assignedBy;
      }
    }
  } catch (err: any) {
    console.warn('[Firestore Users] Read profile notice:', err?.message);
  }

  const normalizedUser: UserProfile = {
    ...user,
    role: effectiveRole,
    assignedBy,
    lastLogin: user.lastLogin || new Date().toISOString()
  };

  const updated = [
    normalizedUser,
    ...current.filter(u => u.uid !== user.uid && u.email.toLowerCase() !== emailLower)
  ];
  setCache(CACHE_KEYS.USERS, updated);

  try {
    const docRef = doc(db, 'users', docId);
    await setDoc(docRef, normalizedUser, { merge: true });
  } catch (error: any) {
    console.warn('[Firestore Users] Cloud sync notice (saved locally):', error?.message);
  }

  return normalizedUser;
};

export const updateUserRoleInDb = async (
  uidOrEmail: string, 
  newRole: UserRole, 
  assignedByEmail?: string
): Promise<void> => {
  const current = getUsersCache();
  const targetUser = current.find(u => u.uid === uidOrEmail || u.email.toLowerCase() === uidOrEmail.toLowerCase());
  const docId = targetUser?.uid || uidOrEmail;

  const updated = current.map(u => {
    if (u.uid === uidOrEmail || u.email.toLowerCase() === uidOrEmail.toLowerCase()) {
      if (u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        return { ...u, role: 'admin' as UserRole };
      }
      return { 
        ...u, 
        role: newRole,
        assignedBy: assignedByEmail || u.assignedBy
      };
    }
    return u;
  });

  setCache(CACHE_KEYS.USERS, updated);

  try {
    const docRef = doc(db, 'users', docId);
    await setDoc(docRef, { 
      role: newRole,
      assignedBy: assignedByEmail || SUPER_ADMIN_EMAIL,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error: any) {
    console.warn('[Firestore Users] Role update cloud notice:', error?.message);
  }
};

