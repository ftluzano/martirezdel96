export type UserRole = 'resident' | 'official' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  purok?: string;
  voterStatus?: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
  assignedBy?: string;
}

export type DocumentType = 
  | 'barangay-clearance'
  | 'certificate-of-residency'
  | 'certificate-of-indigency'
  | 'business-clearance'
  | 'first-time-jobseeker'
  | 'barangay-id';

export type RequestStatus = 'pending' | 'in-review' | 'ready-pickup' | 'completed' | 'rejected';

export interface DocumentApplication {
  id: string;
  referenceNumber: string;
  documentType: DocumentType;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  address: string;
  purok: string;
  yearsOfResidency: number;
  purpose: string;
  status: RequestStatus;
  dateSubmitted: string;
  dateProcessed?: string;
  fee: number;
  notes?: string;
  cedulaNumber?: string;
  orNumber?: string;
  officerInCharge?: string;
  providedFileName?: string;
  providedFileType?: string;
  providedFileData?: string;
  providedFileSize?: number;
  providedAt?: string;
}

export type ServiceCategory = 
  | 'neighborhood-disputes'
  | 'environment-sanitation'
  | 'infrastructure-utilities'
  | 'peace-order-safety'
  | 'health-social-concerns'
  | 'services-documents'
  | 'other-frequent-reports'
  | 'streetlight'
  | 'waste-management'
  | 'drainage'
  | 'health-sanitation'
  | 'peace-order'
  | 'tree-trimming'
  | 'blotter-lupon'
  | string;

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface ServiceRequest {
  id: string;
  referenceNumber: string;
  category: ServiceCategory;
  title: string;
  description: string;
  location: string;
  purok: string;
  priority: PriorityLevel;
  status: RequestStatus;
  reportedBy: string;
  contactNumber: string;
  reporterEmail: string;
  dateReported: string;
  createdAt?: string;
  updatedAt?: string;
  photoProof?: string;
  assignedTeam?: string;
  resolutionNotes?: string;
  dateResolved?: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Advisory' | 'Emergency' | 'Health' | 'Events' | 'Youth' | 'General';
  content: string;
  date: string;
  author: string;
  authorRole: string;
  isUrgent?: boolean;
  eventDate?: string;
  location?: string;
}

export interface BarangayOfficial {
  id: string;
  name: string;
  position: string;
  committee?: string;
  contact?: string;
  term: string;
  category: 'executive' | 'kagawad' | 'sk' | 'appointed' | 'staff';
}
