export type EventStatus = "live" | "upcoming" | "completed";
export type DistributorType = "individual" | "booth";
export type NiyazStatus = "pending" | "approved" | "rejected";
export type SOSStatus = "pending" | "resolved";
export type ItemType = "person" | "item";
export type ItemStatus = "lost" | "found" | "resolved";
export type VolunteerStatus = "pending" | "approved" | "rejected";
export type AttendanceStatus = "present" | "absent";

export interface GeoPoint {
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority?: "normal" | "urgent";
  createdAt: number;
}

export interface JuloosEvent {
  id: string;
  title: string;
  description: string;
  committeeId: string;
  committeeName: string;
  committeeLogo: string;
  date: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  location: string;
  route: {
    startPoint: GeoPoint;
    endPoint: GeoPoint;
    waypoints?: GeoPoint[];
  };
  announcements: Announcement[];
  emergencyContacts?: { name: string; phone: string; role?: string }[];
  videoUrl?: string;
  coverImage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VolunteerRegistration {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  profilePicture?: string;
  status: VolunteerStatus;
  attendance: AttendanceStatus;
  appliedAt: number;
}

export interface NiyazRegistration {
  id: string;
  eventId: string;
  userId: string;
  niyazName: string;
  distributorType: DistributorType;
  distributorName: string;
  distributorPhone: string;
  distributorEmail: string;
  distributorAddress: string;
  distributorWebsite?: string;
  distributorDescription: string;
  status: NiyazStatus;
  expirationDate: string;
  qrCodeData?: string;
  createdAt: number;
}

export interface SOSRequest {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userPhone: string;
  description: string;
  location: string;
  status: SOSStatus;
  createdAt: number;
  resolvedAt?: number;
}

export interface LostAndFoundItem {
  id: string;
  eventId: string;
  itemType: ItemType;
  name: string;
  description: string;
  location: string;
  status: ItemStatus;
  reportedBy: {
    uid: string;
    name: string;
    phone: string;
    role: string;
  };
  photoUrl?: string;
  isBroadcasted?: boolean;
  createdAt: number;
}
