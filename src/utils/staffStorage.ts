export type StaffStatus = 'available' | 'busy' | 'off';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  image: string;
  experience: string;
  specialty: string;
  bio: string;
  status: StaffStatus;
  statusNote?: string;
  phone: string;
  instagram: string;
  rating: number;
  totalCuts: number;
  color: string;
  initials: string;
  pin?: string;
}

export const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'subash',
    name: 'Subash Gurung',
    role: 'Senior Master Barber',
    image: '/images/barber_1.png',
    experience: '12+ Years Experience',
    specialty: 'Classic Scissor Cuts & Fade Mastery',
    bio: 'Subash trained in London and Mumbai before leading the master team at Khukuri Cut. He specializes in bespoke hair consultations and traditional razor styling.',
    status: 'available',
    statusNote: 'Ready for Walk-in',
    phone: '9841111001',
    instagram: '@subash_cuts',
    rating: 4.9,
    totalCuts: 3200,
    color: '#d5a353',
    initials: 'SG',
    pin: '1001',
  },
  {
    id: 'laxman',
    name: 'Laxman Shrestha',
    role: 'Master Barber & Stylist',
    image: '/images/barber_2.png',
    experience: '8 Years Experience',
    specialty: 'Hot Towel Shaving & Beard Sculpting',
    bio: 'Laxman is renowned for his precise straight razor work and custom beard shaping. He ensures every client walks out looking ultra sharp.',
    status: 'busy',
    statusNote: 'In Session',
    phone: '9841111002',
    instagram: '@laxman_barber',
    rating: 4.8,
    totalCuts: 2100,
    color: '#3b82f6',
    initials: 'LS',
  },
  {
    id: 'anup',
    name: 'Anup Thapa',
    role: 'Barber & Tattoo Artist',
    image: '/images/barber_3.png',
    experience: '10 Years Experience',
    specialty: 'Modern Texturized Cuts & Custom Sleeve Tattoos',
    bio: 'Anup bridges the world of modern hair fades and fine-line Nepalese tattoo artistry. Known for creative flair and meticulous hygiene standard.',
    status: 'available',
    statusNote: 'Available Now',
    phone: '9841111003',
    instagram: '@anup_ink',
    rating: 4.9,
    totalCuts: 1500,
    color: '#a855f7',
    initials: 'AT',
  },
];

const STORAGE_KEY = 'kc_staff_members';
export const STAFF_UPDATED_EVENT = 'kc_staff_updated';

export const getStoredStaff = (): StaffMember[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading staff from localStorage', e);
    return DEFAULT_STAFF;
  }
};

export const saveStoredStaff = (staff: StaffMember[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
    window.dispatchEvent(new Event(STAFF_UPDATED_EVENT));
  } catch (e) {
    console.error('Error saving staff to localStorage', e);
  }
};

export const updateStaffStatus = (id: string, status: StaffStatus, statusNote?: string): StaffMember[] => {
  const current = getStoredStaff();
  const updated = current.map((s) => (s.id === id ? { ...s, status, statusNote: statusNote ?? s.statusNote } : s));
  saveStoredStaff(updated);
  return updated;
};
