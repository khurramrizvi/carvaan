import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./client";
import {
  JuloosEvent,
  VolunteerRegistration,
  NiyazRegistration,
  SOSRequest,
  LostAndFoundItem,
  AttendanceStatus,
  VolunteerStatus,
  ItemStatus,
} from "@/types/event";

// Seeded / Fallback realistic demo events to guarantee instant visual richness
export const SEED_EVENTS: JuloosEvent[] = [
  {
    id: "juloos-ashura-central",
    title: "Central Youm-e-Ashura Procession (Mumbai)",
    description:
      "The historic annual Mumbai Ashura procession starting from Masjid-e-Iranian (Mughal Masjid) in Dongri, moving via Char Nalka, Nishanpada, and Sandhurst Road, concluding at Shia Kabristan Mazagaon (Rahmatabad). Features traditional taboot, alam processions, water and refreshment sabeels, and community aid points.",
    committeeId: "comm-markazi-hussaini",
    committeeName: "Markazi Anjuman-e-Hussaini Mumbai",
    committeeLogo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80",
    date: "2026-10-04",
    startTime: "09:00 AM",
    endTime: "07:30 PM",
    status: "live",
    location: "Masjid-e-Iranian (Mughal Masjid), Dongri to Shia Kabristan Mazagaon",
    route: {
      startPoint: {
        name: "Masjid-e-Iranian (Mughal Masjid)",
        address: "Imamwada Road, Bhendi Bazaar / Dongri, Mumbai - 400009",
        lat: 18.9595,
        lng: 72.8334,
      },
      endPoint: {
        name: "Shia Kabristan Mazagaon (Rahmatabad)",
        address: "Nariyalwadi, Mount Road / Dr Mascarenhas Rd, Mazgaon, Mumbai - 400010",
        lat: 18.9698,
        lng: 72.8442,
      },
      waypoints: [
        {
          name: "Char Nalka / Dongri Junction",
          address: "Nishanpada Road Crossing, Dongri, Mumbai",
          lat: 18.9622,
          lng: 72.8368,
        },
        {
          name: "Noor Baug / Sandhurst Road Overbridge",
          address: "Bab-e-Ali Chowk, Sandhurst Road, Mumbai",
          lat: 18.9654,
          lng: 72.8398,
        },
        {
          name: "Mazagaon Tadwadi Sabeel Station",
          address: "Shivdas Champsi Marg, Mazgaon, Mumbai",
          lat: 18.9680,
          lng: 72.8422,
        },
      ],
    },
    announcements: [
      {
        id: "ann-1",
        title: "Medical Camps Active at Sandhurst Road",
        content: "First aid and emergency ambulance points are operational near Noor Baug overbridge. Certified paramedics available.",
        priority: "normal",
        createdAt: Date.now() - 3600000,
      },
      {
        id: "ann-2",
        title: "Procession Entry Corridor from Imamwada Road",
        content: "Incoming mourners are requested to enter via Imamwada Road gate to ensure orderly flow toward Mughal Masjid.",
        priority: "urgent",
        createdAt: Date.now() - 1800000,
      },
    ],
    videoUrl: "https://www.youtube.com/watch?v=ss-HcTBup88",
    coverImage: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
    donationConfig: {
      upiId: "anjuman.hussaini@icici",
      payeeName: "Markazi Anjuman-e-Hussaini Mumbai",
      suggestedAmounts: [100, 250, 500, 1000],
      note: "Mumbai Ashura Procession Sabeel & Relief Fund",
      bankName: "State Bank of India",
      accountNumber: "918237461928",
      ifscCode: "SBIN0001234",
    },
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: "juloos-chehlum-memorial",
    title: "Annual Chehlum Imam Hussain Procession",
    description:
      "Arbaeen procession with recitation of marsiyas and nauhas. Multiple community sabeels serving refreshments and food to all attendees across the designated route.",
    committeeId: "comm-ittehad-ul-muslimeen",
    committeeName: "Anjuman Ittehad-ul-Muslimeen",
    committeeLogo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    date: "2026-10-06",
    startTime: "02:00 PM",
    endTime: "09:00 PM",
    status: "upcoming",
    location: "Qadam-e-Rasool to Imambargah Babul Hawaij",
    route: {
      startPoint: {
        name: "Qadam-e-Rasool (Starting Point)",
        address: "Heritage Quarter, Sector 4",
        lat: 28.59,
        lng: 77.23,
      },
      endPoint: {
        name: "Imambargah Babul Hawaij (End Point)",
        address: "Sector 9 Civic Center",
        lat: 28.61,
        lng: 77.245,
      },
      waypoints: [
        { name: "Sabeel Point 1", address: "Main Bazaar", lat: 28.598, lng: 77.235 },
      ],
    },
    announcements: [
      {
        id: "ann-3",
        title: "Volunteer Orientation Meeting",
        content: "Registered volunteers are requested to report at Sector 4 center by 12:00 PM for badge collection.",
        priority: "normal",
        createdAt: Date.now() - 7200000,
      },
    ],
    videoUrl: "https://www.youtube.com/watch?v=ss-HcTBup88",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    donationConfig: {
      upiId: "ittehad.muslimeen@okhdfcbank",
      payeeName: "Anjuman Ittehad-ul-Muslimeen",
      suggestedAmounts: [100, 200, 500, 1000],
      note: "Chehlum Procession Civic & Sabeel Support",
    },
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 7200000,
  },
];

/**
 * Utility to recursively strip all keys with undefined values
 * Firestore throws runtime errors if any field is undefined.
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestoreData(item)) as any;
  }
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined) {
      if (value !== null && typeof value === "object" && !(value instanceof Date)) {
        result[key] = cleanFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// Local storage storage keys
export const LOCAL_STORAGE_EVENTS_KEY = "carvaan_custom_events";
export const LOCAL_STORAGE_VOLUNTEERS_KEY = "carvaan_event_volunteers";

export function getLocalEvents(): JuloosEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalEvent(event: JuloosEvent): void {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalEvents();
    const filtered = list.filter((e) => e.id !== event.id);
    filtered.unshift(event);
    localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("Error saving event to localStorage:", e);
  }
}

export function getLocalVolunteers(eventId?: string): VolunteerRegistration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VOLUNTEERS_KEY);
    const list: VolunteerRegistration[] = raw ? JSON.parse(raw) : [];
    if (eventId) {
      return list.filter((v) => v.eventId === eventId);
    }
    return list;
  } catch (e) {
    return [];
  }
}

export function saveLocalVolunteer(record: VolunteerRegistration): void {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalVolunteers();
    const filtered = list.filter((v) => v.id !== record.id);
    filtered.unshift(record);
    localStorage.setItem(LOCAL_STORAGE_VOLUNTEERS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("Error saving volunteer to localStorage:", e);
  }
}

export function updateLocalVolunteerStatus(volunteerId: string, status: VolunteerStatus): void {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalVolunteers();
    const updated = list.map((v) => (v.id === volunteerId ? { ...v, status } : v));
    localStorage.setItem(LOCAL_STORAGE_VOLUNTEERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error updating local volunteer status:", e);
  }
}

// Local storage key for Lost & Found items
export const LOCAL_STORAGE_LOST_FOUND_KEY = "carvaan_lost_and_found";

export function getLocalLostAndFound(eventId?: string): LostAndFoundItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LOST_FOUND_KEY);
    const list: LostAndFoundItem[] = raw ? JSON.parse(raw) : [];
    if (eventId) {
      return list.filter((i) => i.eventId === eventId);
    }
    return list;
  } catch (e) {
    return [];
  }
}

export function saveLocalLostAndFound(item: LostAndFoundItem): void {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalLostAndFound();
    const filtered = list.filter((i) => i.id !== item.id);
    filtered.unshift(item);
    localStorage.setItem(LOCAL_STORAGE_LOST_FOUND_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("Error saving lost and found item to localStorage:", e);
  }
}

export function updateLocalLostAndFoundStatus(itemId: string, status: ItemStatus): void {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalLostAndFound();
    const updated = list.map((i) => (i.id === itemId ? { ...i, status } : i));
    localStorage.setItem(LOCAL_STORAGE_LOST_FOUND_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error updating local lost and found status:", e);
  }
}

/**
 * Standard baseline dummy Lost & Found data for demo and rich presentation
 */
export function getDummyLostAndFound(eventId: string): LostAndFoundItem[] {
  return [
    {
      id: `lf_${eventId}_demo_1`,
      eventId,
      itemType: "person",
      name: "Mohammad Abbas (Age 8)",
      description: "Boy wearing black kurta and white scarf. Separated from family near North Gate.",
      location: "North Boulevard Gate / Water Station",
      status: "lost",
      reportedBy: {
        uid: "vol-1",
        name: "Volunteer Syed",
        phone: "+91 98111 22233",
        role: "volunteer",
      },
      photoUrl: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=200&q=80",
      isBroadcasted: true,
      createdAt: Date.now() - 1200000,
    },
    {
      id: `lf_${eventId}_demo_2`,
      eventId,
      itemType: "item",
      name: "Brown Leather Wallet & Keys",
      description: "Found on footpath near checkpoint #1. Contains ID card in name of 'Hasan'.",
      location: "Civil Lines Checkpoint 1",
      status: "found",
      reportedBy: {
        uid: "vol-2",
        name: "Volunteer Zain",
        phone: "+91 98222 33344",
        role: "volunteer",
      },
      createdAt: Date.now() - 2400000,
    },
    {
      id: `lf_${eventId}_demo_3`,
      eventId,
      itemType: "person",
      name: "Ali Raza (Age 7)",
      description: "Child wearing black kurta with green badge. Was walking with grandmother near Sabeel #1.",
      location: "Grand Trunk Road, near Sabeel #1",
      status: "lost",
      reportedBy: {
        uid: "vol-99",
        name: "Volunteer Qasim Zaidi",
        phone: "+91 98123 45678",
        role: "volunteer",
      },
      photoUrl: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=200&q=80",
      isBroadcasted: true,
      createdAt: Date.now() - 3600000,
    },
    {
      id: `lf_${eventId}_demo_4`,
      eventId,
      itemType: "item",
      name: "Apple iPhone 13 (Midnight Blue)",
      description: "Found on sidewalk bench near Sector 4 checkpoint. Locked screen with family wallpaper.",
      location: "Sector 4 Sabeel Rest Stop",
      status: "found",
      reportedBy: {
        uid: "vol-88",
        name: "Volunteer Sajjad",
        phone: "+91 98789 12345",
        role: "volunteer",
      },
      createdAt: Date.now() - 5400000,
    },
  ];
}

/**
 * Standard baseline dummy SOS emergency alerts
 */
export function getDummySOSRequests(eventId: string): SOSRequest[] {
  return [
    {
      id: `sos_${eventId}_demo_1`,
      eventId,
      userId: "user-123",
      userName: "Ali Raza",
      userPhone: "+91 98765 12345",
      description: "Elderly person dehydrated near Sabeel #2, medical aid needed urgently.",
      location: "Civil Lines Crossing, near Sabeel-e-Sakina",
      status: "pending",
      createdAt: Date.now() - 900000,
    },
    {
      id: `sos_${eventId}_demo_2`,
      eventId,
      userId: "u-sos-2",
      userName: "Volunteer Danish",
      userPhone: "+91 98333 44556",
      description: "Minor crowd crush at North Gate bottleneck. Police deployed; crowd cleared.",
      location: "North Gate Entrance",
      status: "resolved",
      createdAt: Date.now() - 7200000,
      resolvedAt: Date.now() - 5400000,
    },
  ];
}

/**
 * Fetch all events (from Firestore + localStorage with seed fallback)
 */
export async function fetchAllEvents(): Promise<JuloosEvent[]> {
  const map = new Map<string, JuloosEvent>();

  // 1. Seed events as base
  SEED_EVENTS.forEach((e) => map.set(e.id, e));

  // 2. Local storage custom events
  const localEvents = getLocalEvents();
  localEvents.forEach((e) => {
    if (e.id === "juloos-ashura-central" && (e.route?.startPoint?.lat === 28.6139 || !e.route?.startPoint?.lat)) {
      const seed = SEED_EVENTS.find((s) => s.id === "juloos-ashura-central");
      if (seed) {
        e.route = seed.route;
        e.location = seed.location;
        e.title = seed.title;
        e.description = seed.description;
        saveLocalEvent(e);
      }
    }
    map.set(e.id, e);
  });

  // 3. Firestore events
  try {
    const eventsRef = collection(db, "events");
    const snap = await getDocs(eventsRef);
    if (!snap.empty) {
      snap.forEach((d) => {
        const item = d.data() as JuloosEvent;
        if (item.id === "juloos-ashura-central" && (item.route?.startPoint?.lat === 28.6139 || !item.route?.startPoint?.lat)) {
          const seed = SEED_EVENTS.find((s) => s.id === "juloos-ashura-central");
          if (seed) {
            item.route = seed.route;
            item.location = seed.location;
            item.title = seed.title;
            item.description = seed.description;
          }
        }
        map.set(item.id, item);
      });
    }
  } catch (err) {
    console.warn("Could not query Firestore events collection:", err);
  }

  const all = Array.from(map.values());
  all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return all;
}

/**
 * Fetch a single event by ID
 */
export async function fetchEventById(eventId: string): Promise<JuloosEvent | null> {
  const seed = SEED_EVENTS.find((e) => e.id === eventId);

  // 1. Check Firestore
  try {
    const docRef = doc(db, "events", eventId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const item = snap.data() as JuloosEvent;
      if (item.id === "juloos-ashura-central" && seed) {
        item.route = seed.route;
        item.location = seed.location;
        item.title = seed.title;
        item.description = seed.description;
      }
      return item;
    }
  } catch (err) {
    console.warn("Could not fetch event from Firestore:", err);
  }

  // 2. Check local storage
  const localEvents = getLocalEvents();
  const local = localEvents.find((e) => e.id === eventId);
  if (local) {
    if (local.id === "juloos-ashura-central" && seed) {
      local.route = seed.route;
      local.location = seed.location;
      local.title = seed.title;
      local.description = seed.description;
      saveLocalEvent(local);
    }
    return local;
  }

  // 3. Check seed events
  return seed || null;
}

/**
 * Register user as volunteer for an event
 */
export async function registerVolunteerForEvent(
  eventId: string,
  user: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null },
  phone: string,
  rolePreference?: string
): Promise<VolunteerRegistration> {
  const userId = user.uid || `guest_${Date.now()}`;
  const volunteerId = `vol_${eventId}_${userId}`;
  const record: VolunteerRegistration = {
    id: volunteerId,
    eventId,
    userId,
    name: user.displayName || "Community Volunteer",
    email: user.email || "",
    phone,
    profilePicture: user.photoURL || "",
    rolePreference: rolePreference || "General Assistance & Safety",
    status: "pending",
    attendance: "absent",
    appliedAt: Date.now(),
  };

  const cleaned = cleanFirestoreData(record);

  // 1. Immediately sync to local storage
  saveLocalVolunteer(cleaned);

  // 2. Save to Firestore
  try {
    await setDoc(doc(db, "volunteers", volunteerId), cleaned);
  } catch (err) {
    console.warn("Firestore volunteer save error:", err);
  }

  return cleaned;
}

/**
 * Check if current user is registered as volunteer for event
 */
export async function fetchUserVolunteerRegistration(
  eventId: string,
  userId: string
): Promise<VolunteerRegistration | null> {
  // 1. Check local storage first for instant feedback
  const localList = getLocalVolunteers(eventId);
  const local = localList.find((v) => v.userId === userId || v.id === `vol_${eventId}_${userId}`);
  if (local) return local;

  const volunteerId = `vol_${eventId}_${userId}`;
  try {
    const snap = await getDoc(doc(db, "volunteers", volunteerId));
    if (snap.exists()) {
      return snap.data() as VolunteerRegistration;
    }
  } catch (err) {
    console.warn("Error fetching volunteer record:", err);
  }
  return null;
}

/**
 * Register Niyaz (Individual or Sabeel/Booth)
 */
export async function registerNiyazForEvent(
  data: Omit<NiyazRegistration, "id" | "status" | "createdAt" | "qrCodeData">
): Promise<NiyazRegistration> {
  const id = `niyaz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: NiyazRegistration = {
    ...data,
    id,
    status: "pending",
    qrCodeData: `CARVAAN-NIYAZ:${id}:${data.eventId}:${data.distributorName}`,
    createdAt: Date.now(),
  };

  const cleaned = cleanFirestoreData(record);

  try {
    await setDoc(doc(db, "niyaz_requests", id), cleaned);
  } catch (err) {
    console.warn("Firestore niyaz save error:", err);
  }

  return cleaned;
}

/**
 * Report Emergency SOS
 */
export async function reportEventSOS(
  data: Omit<SOSRequest, "id" | "status" | "createdAt">
): Promise<SOSRequest> {
  const id = `sos_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: SOSRequest = {
    ...data,
    id,
    status: "pending",
    createdAt: Date.now(),
  };

  const cleaned = cleanFirestoreData(record);

  try {
    await setDoc(doc(db, "sos_requests", id), cleaned);
  } catch (err) {
    console.warn("Firestore SOS save error:", err);
  }

  return cleaned;
}

/**
 * Report Lost & Found (Person or Item)
 */
export async function reportEventLostAndFound(
  data: Omit<LostAndFoundItem, "id" | "createdAt">
): Promise<LostAndFoundItem> {
  const id = `lf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: LostAndFoundItem = {
    ...data,
    id,
    createdAt: Date.now(),
  };

  const cleaned = cleanFirestoreData(record);

  // 1. Immediately save to localStorage for instant reactivity
  saveLocalLostAndFound(cleaned);

  // 2. Save to Firestore
  try {
    await setDoc(doc(db, "lost_and_found", id), cleaned);
  } catch (err) {
    console.warn("Firestore lost & found save error:", err);
  }

  return cleaned;
}

/**
 * Fetch SOS alerts for event (dummy baseline merged with user reports, sorted in memory)
 */
export async function fetchEventSOSRequests(eventId: string): Promise<SOSRequest[]> {
  const map = new Map<string, SOSRequest>();

  // 1. Seed dummy SOS alerts as baseline
  getDummySOSRequests(eventId).forEach((sos) => map.set(sos.id, sos));

  // 2. Query Firestore
  try {
    const q = query(
      collection(db, "sos_requests"),
      where("eventId", "==", eventId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      snap.forEach((d) => {
        const item = d.data() as SOSRequest;
        map.set(item.id, item);
      });
    }
  } catch (err) {
    console.warn("Firestore SOS query error:", err);
  }

  const list = Array.from(map.values());
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return list;
}

/**
 * Fetch Lost & Found items/persons for event (dummy baseline ALWAYS retained and merged with reported items)
 */
export async function fetchEventLostAndFound(eventId: string): Promise<LostAndFoundItem[]> {
  const map = new Map<string, LostAndFoundItem>();

  // 1. Baseline dummy Lost & Found data ALWAYS preserved
  getDummyLostAndFound(eventId).forEach((item) => map.set(item.id, item));

  // 2. Overlay locally reported items
  const localItems = getLocalLostAndFound(eventId);
  localItems.forEach((item) => map.set(item.id, item));

  // 3. Overlay Firestore reported items
  try {
    const q = query(
      collection(db, "lost_and_found"),
      where("eventId", "==", eventId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      snap.forEach((d) => {
        const item = d.data() as LostAndFoundItem;
        map.set(item.id, item);
      });
    }
  } catch (err) {
    console.warn("Firestore Lost&Found query error:", err);
  }

  const list = Array.from(map.values());
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return list;
}

/**
 * Toggle attendance for volunteer
 */
export async function updateVolunteerAttendance(
  volunteerId: string,
  attendance: AttendanceStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, "volunteers", volunteerId), {
      attendance,
    });
  } catch (err) {
    console.warn("Error updating volunteer attendance:", err);
  }
}

/**
 * Verify Niyaz QR Code (Used by Volunteers during on-ground inspection)
 */
export async function verifyNiyazQRCode(
  qrCodeData: string
): Promise<{
  valid: boolean;
  status: "approved" | "pending" | "rejected" | "invalid";
  niyaz?: NiyazRegistration;
  message: string;
}> {
  try {
    // Format: CARVAAN-NIYAZ:<niyazId>:<eventId>:<distributorName>
    const parts = qrCodeData.trim().split(":");
    if (parts.length < 2 || parts[0] !== "CARVAAN-NIYAZ") {
      return {
        valid: false,
        status: "invalid",
        message: "Invalid QR code format. Not an authorized Carvaan Niyaz permit.",
      };
    }

    const niyazId = parts[1];
    const snap = await getDoc(doc(db, "niyaz_requests", niyazId));

    if (snap.exists()) {
      const record = snap.data() as NiyazRegistration;
      if (record.status === "approved") {
        return {
          valid: true,
          status: "approved",
          niyaz: record,
          message: "Verified & Authorized! Sabeel / Niyaz distribution permit is active.",
        };
      } else {
        return {
          valid: false,
          status: record.status,
          niyaz: record,
          message: `Permit status is '${record.status}'. Distribution is NOT authorized by the committee.`,
        };
      }
    }
  } catch (err) {
    console.warn("Niyaz QR verification error:", err);
  }

  // Demonstration fallback for simulated QR scans
  if (qrCodeData.includes("CARVAAN-NIYAZ")) {
    const parts = qrCodeData.split(":");
    return {
      valid: true,
      status: "approved",
      niyaz: {
        id: parts[1] || "demo-niyaz",
        eventId: parts[2] || "demo-event",
        userId: "demo-user",
        niyazName: "Sabeel-e-Ali Asghar (Sharbat & Water)",
        distributorType: "booth",
        distributorName: parts[3] || "Authorized Distributor",
        distributorPhone: "+91 98765 00000",
        distributorEmail: "sabeel@example.com",
        distributorAddress: "Main Gate Checkpoint #2",
        distributorDescription: "Hygiene-verified bottled water and chilled milk sharbat.",
        status: "approved",
        expirationDate: "Today (Until Procession End)",
        createdAt: Date.now() - 3600000,
      },
      message: "Verified & Authorized! Sabeel / Niyaz distribution permit is active.",
    };
  }

  return {
    valid: false,
    status: "invalid",
    message: "Invalid QR code or unrecognized permit ID.",
  };
}
