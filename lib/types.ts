// lib/types.ts

// 1. Enum
export enum ActivityType {
  NOTE = 'NOTE',
  CALL = 'CALL',
  MEETING = 'MEETING',
  EMAIL = 'EMAIL',
  TASK = 'TASK',
  INVOICE = 'INVOICE',
  STATUS_CHANGE = 'STATUS_CHANGE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ONBOARDING = 'ONBOARDING',
  ON_LEAVE = 'ON_LEAVE',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  VIEWER = 'VIEWER',
}

export enum LeadStatus {
  LEAD_IN = 'LEAD_IN',
  CONTACT_MADE = 'CONTACT_MADE',
  NEED_IDENTIFIED = 'NEED_IDENTIFIED',
  PROPOSAL_MADE = 'PROPOSAL_MADE',
  NEGOTIATION = 'NEGOTIATION',
  CONTRACT_SEND = 'CONTRACT_SEND',
  WON = 'WON',
  LOST = 'LOST',
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}


// 2. Tipe Interface
export type UserSimple = {
  id: string;
  name: string;
  avatar?: string | null;
};

export interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatar?: string | null;
  createdAt: string;
  status: UserStatus;
  department?: string | null;
  location?: string | null;
  bio?: string | null;
  skills?: any; // JSON
  joinedAt?: string | null;
  reportsToId?: string | null;
  reportsTo?: {
    id: string;
    name: string;
  } | null;
  assignedLeads?: {
    id: string;
    title: string;
    company?: string | null;
    status: string;
  }[];
}

export type LeadActivity = {
  id: string;
  leadId: string;
  createdById: string;
  type: ActivityType;

  // --- UPDATE BAGIAN INI ---
  title: string;          // Field Baru (Wajib)
  description?: string;   // Field Baru (Opsional)
  
  // Field Content kita buat opsional (?) untuk backward compatibility 
  // jaga-jaga kalau ada data lama yang belum termigrasi
  content?: string;       
  
  // Field Tambahan Baru
  location?: string;
  scheduledAt?: string;   // Biasanya dari API bentuknya string ISO
  isCompleted?: boolean;

  meta: any;              // Data JSON (Invoice items, Email details, dll)
  
  createdAt: string;
  
  // Relasi (Opsional tergantung include di backend)
  createdBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// 3. Tipe Lead (BARU & PENTING)
// Ini mencerminkan schema.prisma Anda yang baru
export interface Lead {
  id: string;
  title: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  value: number;
  currency: string;
  status: LeadStatus;
  priority: LeadPriority;
  label: string | null;
  contacts: string | null;
  clientType?: string | null; // ✅ tambahkan ini
  dueDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  wonAt?: string | null;
  lostAt?: string | null;
  isArchived?: boolean;
  sourceOrigin?: string | null;
  sourceChannel?: string | null;
  sourceChannelId?: string | null;
  createdById: string;
  assignedUsers: UserSimple[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateLeadData {
  title: string;
  company?: string;
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  clientType?: string;
  contacts?: string;
  isArchived?: boolean;
  dueDate?: string;
  description?: string;
  assignedToId?: string;
  sourceOrigin?: string | null;
  sourceChannel?: string | null;
  sourceChannelId?: string | null;
}
