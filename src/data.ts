// ─── Types ───────────────────────────────────────────────────────────────────

export type Gender = 'Male' | 'Female' | 'Other';
export type PreferredGender = 'Male' | 'Female' | 'Any';
export type AppMode = 'seeker' | 'host';

export interface User {
  id: string;
  name: string;
  gender: Gender;
  profileImageUrl: string | null;
  bio: string | null;
}

export interface Property {
  id: string;
  hostId: string;
  apartmentName: string;
  address: string;
  originalRentPrice: number;
  subletPrice: number;
  avgUtilityFee: number;
  availableStartDate: string;
  availableEndDate: string;
  preferredGender: PreferredGender;
  description: string;
  imageUrls: string[];
}

export interface SeekerProfile {
  id: string;
  userId: string;
  targetPriceMin: number;
  targetPriceMax: number;
  desiredStartDate: string;
  desiredEndDate: string;
  preferredGender: PreferredGender;
}

export interface SeekerCard {
  user: User;
  profile: SeekerProfile;
}

// ─── Mock Properties ─────────────────────────────────────────────────────────

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    hostId: 'u10',
    apartmentName: 'The Hub on Campus',
    address: '312 E Campus Mall, Madison, WI',
    originalRentPrice: 1850,
    subletPrice: 1350,
    avgUtilityFee: 80,
    availableStartDate: '2025-05-15',
    availableEndDate: '2025-08-15',
    preferredGender: 'Female',
    description: 'Modern studio with floor-to-ceiling windows overlooking Lake Mendota.',
    imageUrls: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    ],
  },
  {
    id: 'p2',
    hostId: 'u11',
    apartmentName: 'The James Madison',
    address: '316 W Gorham St, Madison, WI',
    originalRentPrice: 2200,
    subletPrice: 1750,
    avgUtilityFee: 100,
    availableStartDate: '2025-06-01',
    availableEndDate: '2025-08-31',
    preferredGender: 'Any',
    description: 'Spacious 1BR apartment with rooftop access and gym. Steps from State Street.',
    imageUrls: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    ],
  },
  {
    id: 'p3',
    hostId: 'u12',
    apartmentName: 'State Street Apartments',
    address: '524 State St, Madison, WI',
    originalRentPrice: 1600,
    subletPrice: 1200,
    avgUtilityFee: 60,
    availableStartDate: '2025-05-01',
    availableEndDate: '2025-07-31',
    preferredGender: 'Male',
    description: 'Cozy studio above State Street shops. Perfect location for summer internship.',
    imageUrls: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
  },
  {
    id: 'p4',
    hostId: 'u13',
    apartmentName: 'Langdon Street Lofts',
    address: '202 N Langdon St, Madison, WI',
    originalRentPrice: 2500,
    subletPrice: 1900,
    avgUtilityFee: 120,
    availableStartDate: '2025-06-15',
    availableEndDate: '2025-09-15',
    preferredGender: 'Any',
    description: 'Luxury loft with exposed brick and lake views. Furnished and ready to move in.',
    imageUrls: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800&q=80',
    ],
  },
  {
    id: 'p5',
    hostId: 'u14',
    apartmentName: 'University Ave Suites',
    address: '1820 University Ave, Madison, WI',
    originalRentPrice: 1400,
    subletPrice: 1050,
    avgUtilityFee: 50,
    availableStartDate: '2025-05-20',
    availableEndDate: '2025-08-20',
    preferredGender: 'Female',
    description: 'Clean, bright studio across from Camp Randall. Bike to class in minutes.',
    imageUrls: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
  },
];

// ─── Mock Users + Seeker Profiles ────────────────────────────────────────────

export const MOCK_SEEKER_CARDS: SeekerCard[] = [
  {
    user: {
      id: 'u1',
      name: 'Emma Johnson',
      gender: 'Female',
      profileImageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80',
      bio: 'CS Junior @ UW-Madison · Coffee addict ☕ · Looking for summer sublet',
    },
    profile: {
      id: 'sp1',
      userId: 'u1',
      targetPriceMin: 1000,
      targetPriceMax: 1400,
      desiredStartDate: '2025-05-15',
      desiredEndDate: '2025-08-15',
      preferredGender: 'Female',
    },
  },
  {
    user: {
      id: 'u2',
      name: 'Liam Park',
      gender: 'Male',
      profileImageUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=600&q=80',
      bio: 'Finance Senior · Internship @ American Family · Clean & quiet roommate',
    },
    profile: {
      id: 'sp2',
      userId: 'u2',
      targetPriceMin: 1200,
      targetPriceMax: 1700,
      desiredStartDate: '2025-06-01',
      desiredEndDate: '2025-08-31',
      preferredGender: 'Any',
    },
  },
  {
    user: {
      id: 'u3',
      name: 'Sofia Martinez',
      gender: 'Female',
      profileImageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80',
      bio: 'Grad student (Econ) · Loves yoga & farmers markets · Flexible on dates',
    },
    profile: {
      id: 'sp3',
      userId: 'u3',
      targetPriceMin: 900,
      targetPriceMax: 1300,
      desiredStartDate: '2025-05-01',
      desiredEndDate: '2025-07-31',
      preferredGender: 'Female',
    },
  },
  {
    user: {
      id: 'u4',
      name: 'Marcus Chen',
      gender: 'Male',
      profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
      bio: 'Biomedical Engineering · Research at WARF · Early bird 🐦',
    },
    profile: {
      id: 'sp4',
      userId: 'u4',
      targetPriceMin: 1300,
      targetPriceMax: 1800,
      desiredStartDate: '2025-06-15',
      desiredEndDate: '2025-09-15',
      preferredGender: 'Male',
    },
  },
  {
    user: {
      id: 'u5',
      name: 'Aisha Williams',
      gender: 'Female',
      profileImageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
      bio: 'Law School 1L · Night owl 🌙 · Looking for quiet solo place',
    },
    profile: {
      id: 'sp5',
      userId: 'u5',
      targetPriceMin: 1100,
      targetPriceMax: 1600,
      desiredStartDate: '2025-05-20',
      desiredEndDate: '2025-08-20',
      preferredGender: 'Any',
    },
  },
];
