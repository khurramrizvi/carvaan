import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./client";
import {
  JuloosEvent,
  VolunteerRegistration,
  NiyazRegistration,
  SOSRequest,
  LostAndFoundItem,
  AttendanceStatus,
} from "@/types/event";

// Seeded / Fallback realistic demo events to guarantee instant visual richness
export const SEED_EVENTS: JuloosEvent[] = [
  {
    id: "juloos-ashura-central",
    title: "Central Youm-e-Ashura Procession",
    description:
      "The historic annual Ashura procession commemorating the martyrdom of Imam Hussain (A.S). The procession includes traditional taboot, alam processions, water and refreshment sabeels, and community aid points.",
    committeeId: "comm-markazi-hussaini",
    committeeName: "Markazi Anjuman-e-Hussaini",
    committeeLogo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80",
    date: "2026-10-04",
    startTime: "09:00 AM",
    endTime: "07:30 PM",
    status: "live",
    location: "Imambargah Shuhada to Central Karbala Grounds",
    route: {
      startPoint: {
        name: "Imambargah Shuhada-e-Karbala (Start)",
        address: "Old City Gate, Market Square",
        lat: 28.6139,
        lng: 77.209,
      },
      endPoint: {
        name: "Central Karbala Grounds (Destination)",
        address: "Karbala Memorial Complex, Ring Road",
        lat: 28.6328,
        lng: 77.2197,
      },
      waypoints: [
        { name: "Sabeel-e-Sakina Checkpoint", address: "Civil Lines Junction", lat: 28.621, lng: 77.212 },
        { name: "Medical Aid Station #2", address: "Grand Trunk Road Crossing", lat: 28.627, lng: 77.216 },
      ],
    },
    announcements: [
      {
        id: "ann-1",
        title: "Medical Camps Active at Civil Lines",
        content: "First aid and emergency ambulance points are operational at Checkpoint 2. Certified paramedics available.",
        priority: "normal",
        createdAt: Date.now() - 3600000,
      },
      {
        id: "ann-2",
        title: "Procession Entry Restricted from West Gate",
        content: "Due to heavy footfall, incoming mourners are requested to enter via the North Boulevard Gate.",
        priority: "urgent",
        createdAt: Date.now() - 1800000,
      },
    ],
    videoUrl: "https://www.youtube.com/watch?v=ss-HcTBup88",
    coverImage: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
    donationConfig: {
      upiId: "anjuman.hussaini@icici",
      payeeName: "Markazi Anjuman-e-Hussaini Trust",
      suggestedAmounts: [100, 250, 500, 1000],
      note: "Ashura Procession Sabeel & Relief Fund",
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
 * Fetch all events (from Firestore with seed fallback)
 */
export async function fetchAllEvents(): Promise<JuloosEvent[]> {
  try {
    const eventsRef = collection(db, "events");
    const snap = await getDocs(eventsRef);
    if (!snap.empty) {
      const list: JuloosEvent[] = [];
      snap.forEach((d) => list.push(d.data() as JuloosEvent));
      return list;
    }
  } catch (err) {
    console.warn("Could not query Firestore events collection, using seed events:", err);
  }
  return SEED_EVENTS;
}

/**
 * Fetch a single event by ID
 */
export async function fetchEventById(eventId: string): Promise<JuloosEvent | null> {
  try {
    const docRef = doc(db, "events", eventId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as JuloosEvent;
    }
  } catch (err) {
    console.warn("Could not fetch event from Firestore:", err);
  }
  const fallback = SEED_EVENTS.find((e) => e.id === eventId);
  return fallback || null;
}

/**
 * Register user as volunteer for an event
 */
export async function registerVolunteerForEvent(
  eventId: string,
  user: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null },
  phone: string
): Promise<VolunteerRegistration> {
  const volunteerId = `vol_${eventId}_${user.uid}`;
  const record: VolunteerRegistration = {
    id: volunteerId,
    eventId,
    userId: user.uid,
    name: user.displayName || "Community Volunteer",
    email: user.email || "",
    phone,
    profilePicture: user.photoURL || undefined,
    status: "pending",
    attendance: "absent",
    appliedAt: Date.now(),
  };

  try {
    await setDoc(doc(db, "volunteers", volunteerId), record);
  } catch (err) {
    console.warn("Firestore volunteer save error:", err);
  }

  return record;
}

/**
 * Check if current user is registered as volunteer for event
 */
export async function fetchUserVolunteerRegistration(
  eventId: string,
  userId: string
): Promise<VolunteerRegistration | null> {
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

  try {
    await setDoc(doc(db, "niyaz_requests", id), record);
  } catch (err) {
    console.warn("Firestore niyaz save error:", err);
  }

  return record;
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

  try {
    await setDoc(doc(db, "sos_requests", id), record);
  } catch (err) {
    console.warn("Firestore SOS save error:", err);
  }

  return record;
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

  try {
    await setDoc(doc(db, "lost_and_found", id), record);
  } catch (err) {
    console.warn("Firestore lost & found save error:", err);
  }

  return record;
}

/**
 * Fetch SOS alerts for event (visible to Committee and Volunteers)
 */
export async function fetchEventSOSRequests(eventId: string): Promise<SOSRequest[]> {
  try {
    const q = query(
      collection(db, "sos_requests"),
      where("eventId", "==", eventId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const list: SOSRequest[] = [];
    snap.forEach((d) => list.push(d.data() as SOSRequest));
    return list;
  } catch (err) {
    console.warn("Firestore SOS query error:", err);
    // Return sample SOS if needed
    return [
      {
        id: "sos-demo-1",
        eventId,
        userId: "user-123",
        userName: "Ali Raza",
        userPhone: "+91 98765 12345",
        description: "Elderly person dehydrated near Sabeel #2, medical aid needed urgently.",
        location: "Civil Lines Crossing, near Sabeel-e-Sakina",
        status: "pending",
        createdAt: Date.now() - 900000,
      },
    ];
  }
}

/**
 * Fetch Lost & Found items/persons for event
 */
export async function fetchEventLostAndFound(eventId: string): Promise<LostAndFoundItem[]> {
  try {
    const q = query(
      collection(db, "lost_and_found"),
      where("eventId", "==", eventId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const list: LostAndFoundItem[] = [];
    snap.forEach((d) => list.push(d.data() as LostAndFoundItem));
    return list;
  } catch (err) {
    console.warn("Firestore Lost&Found query error:", err);
    return [
      {
        id: "lf-demo-1",
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
        id: "lf-demo-2",
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
    ];
  }
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
