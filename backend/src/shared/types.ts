// This file is a direct copy of the frontend `types.ts` to ensure consistency.

export interface InvitedPerson {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface Visit {
  id:string;
  name: string;
  subject: string;
  need: string;
}

export interface PrayerRequest {
  id: string;
  subject: string;
  isAnonymous: boolean;
}

export type CellStatus = 'Active' | 'En implantation' | 'En multiplication' | 'En pause';

export interface Cell {
  id: string;
  region: string;
  group: string;
  district: string;
  cellName: string;
  cellCategory: string;
  leaderName: string;
  leaderContact?: string;
  status: CellStatus;
}

export interface Report {
  id: string;
  cellDate: string;
  region: string;
  group: string;
  district: string;
  cellName: string;
  cellCategory: string;
  leaderName: string;
  leaderContact: string;
  registeredMen: number;
  registeredWomen: number;
  registeredChildren: number;
  attendees: number;
  absentees: number;
  invitedPeople: InvitedPerson[];
  totalPresent: number;
  visitSchedule: string;
  visitsMade: Visit[];
  bibleStudy: number;
  miracleHour: number;
  sundayServiceAttendance: number;
  evangelismOuting: string;
  poignantTestimony?: string;
  prayerRequests?: PrayerRequest[];
  message: string;
  submittedAt: string;
}

export enum UserRole {
    NATIONAL_COORDINATOR = 'national_coordinator',
    REGIONAL_PASTOR = 'regional_pastor',
    GROUP_PASTOR = 'group_pastor',
    DISTRICT_PASTOR = 'district_pastor',
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  region?: string;
  group?: string;
  district?: string;
  status?: 'pending' | 'approved';
  password?: string;
  contact?: string;
}

export interface PastorData {
    uid?: string;
    email: string;
    name: string;
    role: UserRole;
    region?: string;
    group?: string;
    district?: string;
    password?: string;
    contact?: string;
    status?: 'pending' | 'approved';
}

export interface Group {
  id: string;
  region: string;
  name: string;
}

export interface District {
  id: string;
  region: string;
  group: string;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  status: 'draft' | 'published';
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string; // base64
  uploadedAt: string;
}

export interface Communication {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
  target: {
    type: 'global' | 'region';
    region?: string;
  };
  status: 'en_attente' | 'publié' | 'rejeté';
}