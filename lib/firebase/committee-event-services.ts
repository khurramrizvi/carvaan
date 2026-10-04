import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./client";
import {
  JuloosEvent,
  VolunteerRegistration,
  NiyazRegistration,
  SOSRequest,
  LostAndFoundItem,
  VolunteerStatus,
  NiyazStatus,
  SOSStatus,
  ItemStatus,
  Announcement,
} from "@/types/event";
import {
  SEED_EVENTS,
  cleanFirestoreData,
  getLocalEvents,
  saveLocalEvent,
  getLocalVolunteers,
  updateLocalVolunteerStatus,
  fetchEventLostAndFound,
  updateLocalLostAndFoundStatus,
} from "./event-services";

/**
 * Fetch all events organized by a specific committee
 */
export async function fetchCommitteeEvents(committeeId: string): Promise<JuloosEvent[]> {
  const map = new Map<string, JuloosEvent>();

  // 1. Seed events relevant to this committee
  SEED_EVENTS.filter(
    (e) => e.committeeId === committeeId || committeeId.includes("comm")
  ).forEach((e) => map.set(e.id, e));

  // 2. Custom events saved in localStorage
  const localEvents = getLocalEvents();
  localEvents
    .filter((e) => e.committeeId === committeeId || committeeId.includes("comm"))
    .forEach((e) => map.set(e.id, e));

  // 3. Firestore query with single-field equality (no composite index error)
  try {
    const q = query(
      collection(db, "events"),
      where("committeeId", "==", committeeId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      snap.forEach((d) => {
        const item = d.data() as JuloosEvent;
        map.set(item.id, item);
      });
    }
  } catch (err) {
    console.warn("Could not query committee events from Firestore:", err);
  }

  const all = Array.from(map.values());
  if (all.length > 0) {
    all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return all;
  }
  return SEED_EVENTS;
}

/**
 * Create a new Juloos Event
 */
export async function createNewCommitteeEvent(
  data: Omit<JuloosEvent, "id" | "createdAt" | "updatedAt">
): Promise<JuloosEvent> {
  const id = `juloos_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();
  const newEvent: JuloosEvent = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  const cleaned = cleanFirestoreData(newEvent);

  // 1. Immediately persist in localStorage for guaranteed availability
  saveLocalEvent(cleaned);

  // 2. Persist in Firestore
  try {
    await setDoc(doc(db, "events", id), cleaned);
  } catch (err) {
    console.warn("Firestore event save error:", err);
  }

  return cleaned;
}

/**
 * Fetch all volunteers registered for an event
 */
export async function fetchEventVolunteersList(eventId: string): Promise<VolunteerRegistration[]> {
  const map = new Map<string, VolunteerRegistration>();

  // 1. Read from local storage
  const localVols = getLocalVolunteers(eventId);
  localVols.forEach((v) => map.set(v.id, v));

  // 2. Query Firestore (single field where query, no composite index needed)
  try {
    const q = query(
      collection(db, "volunteers"),
      where("eventId", "==", eventId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      snap.forEach((d) => {
        const item = d.data() as VolunteerRegistration;
        map.set(item.id, item);
      });
    }
  } catch (err) {
    console.warn("Could not fetch volunteers from Firestore:", err);
  }

  const list = Array.from(map.values());
  if (list.length > 0) {
    list.sort((a, b) => (b.appliedAt || 0) - (a.appliedAt || 0));
    return list;
  }

  // Realistic mock volunteers for demonstration if none exist yet
  return [
    {
      id: `vol_${eventId}_1`,
      eventId,
      userId: "u-vol-1",
      name: "Syed Zafar Abbas",
      email: "zafar.abbas@example.com",
      phone: "+91 98765 11223",
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      rolePreference: "Crowd Safety & Route Guide",
      status: "approved",
      attendance: "present",
      appliedAt: Date.now() - 86400000,
    },
    {
      id: `vol_${eventId}_2`,
      eventId,
      userId: "u-vol-2",
      name: "Ali Haider Rizvi",
      email: "ali.haider@example.com",
      phone: "+91 98111 44556",
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      rolePreference: "Sabeel & Water Distribution",
      status: "pending",
      attendance: "absent",
      appliedAt: Date.now() - 43200000,
    },
    {
      id: `vol_${eventId}_3`,
      eventId,
      userId: "u-vol-3",
      name: "Fatima Zehra",
      email: "fatima.z@example.com",
      phone: "+91 98222 77889",
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      rolePreference: "Medical & First Aid Escort",
      status: "pending",
      attendance: "absent",
      appliedAt: Date.now() - 21600000,
    },
  ];
}

/**
 * Approve or Reject Volunteer registration
 */
export async function updateVolunteerStatus(
  volunteerId: string,
  status: VolunteerStatus
): Promise<void> {
  // Update local storage record
  updateLocalVolunteerStatus(volunteerId, status);

  // Update Firestore
  try {
    await updateDoc(doc(db, "volunteers", volunteerId), { status });
  } catch (err) {
    console.warn("Volunteer update error:", err);
  }
}

/**
 * Fetch all Niyaz requests for an event
 */
export async function fetchEventNiyazList(eventId: string): Promise<NiyazRegistration[]> {
  try {
    const q = query(
      collection(db, "niyaz_requests"),
      where("eventId", "==", eventId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: NiyazRegistration[] = [];
      snap.forEach((d) => list.push(d.data() as NiyazRegistration));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return list;
    }
  } catch (err) {
    console.warn("Could not fetch Niyaz list:", err);
  }

  // Realistic mock Niyaz requests
  return [
    {
      id: `niyaz_${eventId}_1`,
      eventId,
      userId: "u-niyaz-1",
      niyazName: "Sabeel-e-Ali Asghar (Chilled Milk Sharbat & Water)",
      distributorType: "booth",
      distributorName: "Mirza Hasan & Family",
      distributorPhone: "+91 98999 12345",
      distributorEmail: "hasan.mirza@gmail.com",
      distributorAddress: "Opposite Town Hall Gate 2, Main Bazaar",
      distributorWebsite: "https://sabeel-hussain.org",
      distributorDescription: "Serving 2,000 liters of chilled rose milk sharbat and packaged bottled water in sterile cups.",
      status: "approved",
      expirationDate: "2026-10-04 (10:00 PM)",
      qrCodeData: `CARVAAN-NIYAZ:niyaz_${eventId}_1:${eventId}:Mirza Hasan`,
      createdAt: Date.now() - 86400000,
    },
    {
      id: `niyaz_${eventId}_2`,
      eventId,
      userId: "u-niyaz-2",
      niyazName: "Haleem & Tabarruk Distribution",
      distributorType: "individual",
      distributorName: "Baqir Hussain Naqvi",
      distributorPhone: "+91 98777 54321",
      distributorEmail: "baqir.naqvi@example.com",
      distributorAddress: "Sector 4 Civic Center Road Corner",
      distributorDescription: "500 boxed portions of Haleem distributed directly to mourners.",
      status: "pending",
      expirationDate: "2026-10-04 (07:00 PM)",
      qrCodeData: `CARVAAN-NIYAZ:niyaz_${eventId}_2:${eventId}:Baqir Hussain`,
      createdAt: Date.now() - 36000000,
    },
  ];
}

/**
 * Approve or Reject Niyaz permit
 */
export async function updateNiyazStatus(
  niyazId: string,
  status: NiyazStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, "niyaz_requests", niyazId), { status });
  } catch (err) {
    console.warn("Niyaz update error:", err);
  }
}

/**
 * Fetch all SOS requests for an event
 */
export async function fetchEventSOSList(eventId: string): Promise<SOSRequest[]> {
  try {
    const q = query(
      collection(db, "sos_requests"),
      where("eventId", "==", eventId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: SOSRequest[] = [];
      snap.forEach((d) => list.push(d.data() as SOSRequest));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return list;
    }
  } catch (err) {
    console.warn("Could not fetch SOS requests:", err);
  }

  // Realistic mock SOS incidents
  return [
    {
      id: `sos_${eventId}_1`,
      eventId,
      userId: "u-sos-1",
      userName: "Mohammad Kazim",
      userPhone: "+91 98450 11223",
      description: "Severe dehydration and fainting near Sabeel #2. Stretcher & paramedic requested.",
      location: "Near Civil Lines Junction / Sabeel-e-Sakina",
      status: "pending",
      createdAt: Date.now() - 1800000,
    },
    {
      id: `sos_${eventId}_2`,
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
 * Resolve SOS emergency incident (Committee only)
 */
export async function resolveSOSRequest(sosId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "sos_requests", sosId), {
      status: "resolved",
      resolvedAt: Date.now(),
    });
  } catch (err) {
    console.warn("SOS resolve error:", err);
  }
}

/**
 * Fetch all Lost & Found items/persons for an event (always preserves dummy items while syncing new reports)
 */
export async function fetchEventLostFoundList(eventId: string): Promise<LostAndFoundItem[]> {
  return fetchEventLostAndFound(eventId);
}

/**
 * Resolve Lost & Found item/person (Committee only)
 */
export async function resolveLostFoundItem(itemId: string): Promise<void> {
  // Update local storage
  updateLocalLostAndFoundStatus(itemId, "resolved");

  // Update Firestore
  try {
    await updateDoc(doc(db, "lost_and_found", itemId), {
      status: "resolved",
    });
  } catch (err) {
    console.warn("Lost & Found resolve error:", err);
  }
}

/**
 * Broadcast lost person details directly to event announcements
 */
export async function broadcastLostPersonToAnnouncements(
  eventId: string,
  item: LostAndFoundItem
): Promise<Announcement> {
  const announcement: Announcement = {
    id: `ann_lost_${item.id}_${Date.now()}`,
    title: `MISSING PERSON ALERT: ${item.name}`,
    content: `Missing: ${item.name}. Last seen: ${item.location}. Description: ${item.description}. If seen, contact on-ground volunteer: ${item.reportedBy.name} (${item.reportedBy.phone}) immediately!`,
    priority: "urgent",
    createdAt: Date.now(),
  };

  try {
    await updateDoc(doc(db, "events", eventId), {
      announcements: arrayUnion(announcement),
    });

    await updateDoc(doc(db, "lost_and_found", item.id), {
      isBroadcasted: true,
    });
  } catch (err) {
    console.warn("Error broadcasting announcement to Firestore:", err);
  }

  return announcement;
}
