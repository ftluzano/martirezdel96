import { Announcement, BarangayOfficial, DocumentApplication, ServiceRequest } from '../types';

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

export const BARANGAY_OFFICIALS: BarangayOfficial[] = [];

export const INITIAL_DOCUMENTS: DocumentApplication[] = [];

export const INITIAL_SERVICES: ServiceRequest[] = [];

export const DOCUMENT_CATALOG = [
  {
    type: 'barangay-clearance' as const,
    title: 'Barangay Clearance',
    fee: 50,
    processingTime: 'Same Day'
  },
  {
    type: 'certificate-of-residency' as const,
    title: 'Certificate of Residency',
    fee: 50,
    processingTime: 'Same Day'
  },
  {
    type: 'certificate-of-indigency' as const,
    title: 'Certificate of Indigency',
    fee: 0,
    processingTime: 'Same Day (Free)'
  },
  {
    type: 'first-time-jobseeker' as const,
    title: 'First-Time Jobseeker Certificate',
    fee: 0,
    processingTime: 'Same Day (Free)'
  },
  {
    type: 'business-clearance' as const,
    title: 'Barangay Business Clearance',
    fee: 250,
    processingTime: '1-2 Working Days'
  },
  {
    type: 'barangay-id' as const,
    title: 'Barangay Resident ID Card',
    fee: 80,
    processingTime: '2-3 Working Days'
  }
];

export const SERVICE_CATEGORIES = [
  {
    id: 'streetlight' as const,
    name: 'Streetlight & Electrical'
  },
  {
    id: 'waste-management' as const,
    name: 'Waste Management & Sanitation'
  },
  {
    id: 'drainage' as const,
    name: 'Drainage & Flood Control'
  },
  {
    id: 'health-sanitation' as const,
    name: 'Public Health & Pest Control'
  },
  {
    id: 'peace-order' as const,
    name: 'Peace & Order / Security'
  },
  {
    id: 'tree-trimming' as const,
    name: 'Tree Trimming & Hazard Mitigation'
  },
  {
    id: 'blotter-lupon' as const,
    name: 'Dispute Mediation & Conciliation'
  }
];

export const BARANGAY_AREAS = [
  'Purok 1',
  'Purok 2',
  'Purok 3',
  'Purok 4',
  'Purok 5',
  'Purok 6',
  'Sitio Riverside',
  'Barangay Proper'
] as const;
