export interface ReportSubCategory {
  id: string;
  name: string;
}

export interface ReportCategoryConfig {
  id: string;
  name: string;
  tagline: string;
  iconName: string;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    hoverBg: string;
  };
  subIssues: string[];
}

export const REPORT_CATEGORIES_DATA: ReportCategoryConfig[] = [
  {
    id: 'neighborhood-disputes',
    name: 'Neighborhood & Disputes',
    tagline: 'Community peace, animal complaints, noise, and shared space issues',
    iconName: 'Home',
    colorTheme: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      hoverBg: 'hover:border-amber-400 hover:bg-amber-50/80',
    },
    subIssues: [
      'Noise disturbance',
      'Neighbor disputes',
      'Pet problems',
      'Blocked driveways/alleys, illegal parking, vehicles blocking access',
      'Unruly behavior, loitering, drinking/gambling in public areas',
      'Curfew violations (minors out late)',
    ],
  },
  {
    id: 'environment-sanitation',
    name: 'Environment & Sanitation',
    tagline: 'Garbage collection, drainage, overgrown lots, and clean surroundings',
    iconName: 'Trash2',
    colorTheme: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      hoverBg: 'hover:border-emerald-400 hover:bg-emerald-50/80',
    },
    subIssues: [
      'Garbage issues: missed collection, uncollected trash, illegal dumping',
      'Waste not segregated properly; piled trash attracting pests/rats',
      'Clogged canals/drainage → flooding, stagnant water, mosquitoes',
      'Overgrown vegetation, unkempt lots, grass/branches blocking paths',
      'Foul odors, smoke, burning trash/leaves',
      'Dirty public spaces, blocked sidewalks',
    ],
  },
  {
    id: 'infrastructure-utilities',
    name: 'Infrastructure & Utilities',
    tagline: 'Streetlights, roads, pipes, wires, and public utility repairs',
    iconName: 'Wrench',
    colorTheme: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      hoverBg: 'hover:border-blue-400 hover:bg-blue-50/80',
    },
    subIssues: [
      'Dim/broken streetlights',
      'Potholes, damaged roads, uneven pathways',
      'Leaking pipes, no water supply, low water pressure',
      'Exposed dangling wires, fallen power lines',
      'Damaged drainage covers, cracked walls, unsafe structures',
      'Signage missing/broken',
    ],
  },
  {
    id: 'peace-order-safety',
    name: 'Peace & Order & Safety',
    tagline: 'Security, incident reports, traffic hazards, and emergencies',
    iconName: 'ShieldAlert',
    colorTheme: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      badge: 'bg-red-100 text-red-800 border-red-200',
      hoverBg: 'hover:border-red-400 hover:bg-red-50/80',
    },
    subIssues: [
      'Thefts, robberies, suspicious persons/strangers',
      'Physical fights, verbal altercations, threats',
      'Graffiti, vandalism, damaged property',
      'Traffic congestion, reckless driving, speeding',
      'Fire hazards: blocked exits, exposed wiring, overcrowding',
      'Missing persons, lost/stray children',
    ],
  },
  {
    id: 'health-social-concerns',
    name: 'Health & Social Concerns',
    tagline: 'Medical aid, welfare, senior/PWD assistance, and family support',
    iconName: 'HeartPulse',
    colorTheme: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-900',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      hoverBg: 'hover:border-rose-400 hover:bg-rose-50/80',
    },
    subIssues: [
      'Spread of illness, suspected disease outbreaks',
      'Unsanitary food stalls/eateries',
      'Assistance needed: financial, medical, burial',
      'Senior citizen / PWD welfare concerns',
      'Domestic disputes, family problems',
      'Child neglect or abuse',
      'Assistance for calamity/fire victims',
    ],
  },
  {
    id: 'other-frequent-reports',
    name: 'Other Frequent Reports',
    tagline: 'Sidewalk vendors, construction noise, flooding, dead animals, and encroachment',
    iconName: 'AlertTriangle',
    colorTheme: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      hoverBg: 'hover:border-purple-400 hover:bg-purple-50/80',
    },
    subIssues: [
      'Street vendors blocking paths / selling without permit',
      'Construction noise/dust / work outside allowed hours',
      'Flooding after rain',
      'Dead animals on streets',
      'Encroachment on public land/alleys',
    ],
  },
];
