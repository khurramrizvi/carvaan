import { User as FirebaseUser } from "firebase/auth";

export type UserRole = "user" | "committee" | "admin";
export type AccountStatus = "active" | "pending" | "approved" | "rejected";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: AccountStatus;
  provider: "google.com" | "password";
  photoURL?: string;
  phoneNumber?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CommitteeProfile {
  id: string; // Matches uid
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  description: string;
  logoUrl: string;
  status: AccountStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CommitteeRegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  website?: string;
  description: string;
  logoFile: File;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  committeeProfile: CommitteeProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string, intendedRole: "committee" | "admin") => Promise<{ status: AccountStatus; role: UserRole }>;
  registerCommittee: (input: CommitteeRegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
