"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchEventById } from "@/lib/firebase/event-services";
import {
  fetchEventVolunteersList,
  updateVolunteerStatus,
  fetchEventNiyazList,
  updateNiyazStatus,
  fetchEventSOSList,
  resolveSOSRequest,
  fetchEventLostFoundList,
  resolveLostFoundItem,
  broadcastLostPersonToAnnouncements,
} from "@/lib/firebase/committee-event-services";
import {
  JuloosEvent,
  VolunteerRegistration,
  NiyazRegistration,
  SOSRequest,
  LostAndFoundItem,
  VolunteerStatus,
  NiyazStatus,
} from "@/types/event";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  ArrowLeft,
  Building2,
  Users,
  UtensilsCrossed,
  AlertTriangle,
  UserSearch,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  ExternalLink,
  QrCode,
  Megaphone,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  Globe,
  Share2,
} from "lucide-react";

type ActiveTab = "volunteers" | "lost_found" | "niyaz" | "sos";

export default function CommitteeEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: eventId } = use(params);
  const { user, userProfile, committeeProfile, loading: authLoading } = useAuth();

  const [event, setEvent] = useState<JuloosEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("volunteers");

  // Tab Data States
  const [volunteers, setVolunteers] = useState<VolunteerRegistration[]>([]);
  const [niyazList, setNiyazList] = useState<NiyazRegistration[]>([]);
  const [sosList, setSosList] = useState<SOSRequest[]>([]);
  const [lostFoundList, setLostFoundList] = useState<LostAndFoundItem[]>([]);
  const [lostFoundFilter, setLostFoundFilter] = useState<"person" | "item">("person");

  // Action Loading Tracking
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modals for Volunteer Popup & QR View
  const [selectedVolunteer, setSelectedVolunteer] = useState<{
    name: string;
    phone: string;
    role: string;
    uid: string;
  } | null>(null);
  const [selectedNiyazQR, setSelectedNiyazQR] = useState<NiyazRegistration | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ev, vols, niyaz, sos, lf] = await Promise.all([
        fetchEventById(eventId),
        fetchEventVolunteersList(eventId),
        fetchEventNiyazList(eventId),
        fetchEventSOSList(eventId),
        fetchEventLostFoundList(eventId),
      ]);
      setEvent(ev);
      setVolunteers(vols);
      setNiyazList(niyaz);
      setSosList(sos);
      setLostFoundList(lf);
    } catch (err) {
      console.error("Error loading committee event detail:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (userProfile?.role !== "committee") {
        router.push("/");
      } else {
        loadData();
      }
    }
  }, [user, userProfile, authLoading, router, loadData]);

  // Handlers for Volunteer actions
  const handleVolunteerAction = async (volId: string, status: VolunteerStatus) => {
    setActionLoadingId(volId);
    try {
      await updateVolunteerStatus(volId, status);
      setVolunteers((prev) =>
        prev.map((v) => (v.id === volId ? { ...v, status } : v))
      );
    } catch (err) {
      console.error("Volunteer status update error:", err);
      alert("Failed to update volunteer status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handlers for Niyaz actions
  const handleNiyazAction = async (niyazId: string, status: NiyazStatus) => {
    setActionLoadingId(niyazId);
    try {
      await updateNiyazStatus(niyazId, status);
      setNiyazList((prev) =>
        prev.map((n) => (n.id === niyazId ? { ...n, status } : n))
      );
    } catch (err) {
      console.error("Niyaz status update error:", err);
      alert("Failed to update Niyaz status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handlers for SOS actions
  const handleResolveSOS = async (sosId: string) => {
    setActionLoadingId(sosId);
    try {
      await resolveSOSRequest(sosId);
      setSosList((prev) =>
        prev.map((s) => (s.id === sosId ? { ...s, status: "resolved" } : s))
      );
    } catch (err) {
      console.error("SOS resolution error:", err);
      alert("Failed to resolve SOS request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handlers for Lost & Found items
  const handleResolveLostFound = async (itemId: string) => {
    setActionLoadingId(itemId);
    try {
      await resolveLostFoundItem(itemId);
      setLostFoundList((prev) =>
        prev.map((l) => (l.id === itemId ? { ...l, status: "resolved" } : l))
      );
    } catch (err) {
      console.error("Lost & Found resolution error:", err);
      alert("Failed to resolve Lost & Found item.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handler for Broadcasting missing person to Public Announcements
  const handleBroadcastAnnouncement = async (item: LostAndFoundItem) => {
    if (!event) return;
    setActionLoadingId(item.id);
    try {
      await broadcastLostPersonToAnnouncements(eventId, item);
      setLostFoundList((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, isBroadcasted: true } : l))
      );
      alert(`Missing person notice for ${item.name} broadcasted to public event feed!`);
    } catch (err) {
      console.error("Broadcast error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (authLoading || (loading && !event)) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#0070f3] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-wider text-[#888888]">Loading Event Operations Hub...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-semibold text-[#171717]">Event Not Found</h2>
        <Link href="/committee/events" className="mt-4">
          <Button variant="secondary" size="sm" pill>Back to Committee Events</Button>
        </Link>
      </div>
    );
  }

  // Card Counters
  const pendingVolunteers = volunteers.filter((v) => v.status === "pending").length;
  const activeLostItems = lostFoundList.filter((l) => l.status === "lost").length;
  const pendingNiyaz = niyazList.filter((n) => n.status === "pending").length;
  const pendingSOS = sosList.filter((s) => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-[#171717] selection:text-white">
      <Navbar />

      {/* Operations Sub-Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#ebebeb] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/committee/events"
              className="p-1.5 rounded-full border border-[#ebebeb] text-[#888888] hover:text-[#171717] hover:bg-[#fafafa] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#0070f3] font-medium">
                  Ops Hub
                </span>
                <span className="text-[#ebebeb]">•</span>
                <span className="text-xs text-[#171717] font-semibold truncate max-w-[130px] sm:max-w-xs">
                  {event.title}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Link
              href={`/events/${event.id}`}
              target="_blank"
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#ebebeb] bg-white text-xs font-medium text-[#171717] hover:bg-[#fafafa] transition-colors shadow-xs"
            >
              <span className="hidden sm:inline">Public Page</span>
              <span className="sm:hidden">Public</span>
              <ExternalLink className="w-3 h-3 text-[#888888]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Event Quick Info Banner */}
        <section className="bg-white rounded-2xl border border-[#ebebeb] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#171717]">{event.title}</h1>
              {event.status === "live" && (
                <span className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#ee0000] text-white">
                  <Radio className="w-3 h-3" />
                  <span>LIVE</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#666666] leading-relaxed">{event.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#888888] pt-1">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                <span>{event.date}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#888888]" />
                <span>{event.startTime} - {event.endTime}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#0070f3]" />
                <span>{event.location}</span>
              </span>
            </div>
          </div>
        </section>

        {/* 4 INTERACTIVE METRIC CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1: VOLUNTEERS */}
          <button
            type="button"
            onClick={() => setActiveTab("volunteers")}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-xs
              ${
                activeTab === "volunteers"
                  ? "bg-white border-[#171717] shadow-sm ring-1 ring-[#171717]"
                  : "bg-white border-[#ebebeb] hover:border-[#d4d4d4]"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                Volunteers
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#f5f5f5] text-[#171717] flex items-center justify-center">
                <Users className="w-4 h-4 text-[#0070f3]" />
              </div>
            </div>
            <h3 className="text-3xl font-semibold text-[#171717] mt-2">{volunteers.length}</h3>
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#ebebeb]">
              <span className="text-[#888888]">Total Registered</span>
              {pendingVolunteers > 0 ? (
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#ab570a] bg-[#f5a623]/10 px-2 py-0.5 rounded-full">
                  {pendingVolunteers} Pending
                </span>
              ) : (
                <span className="text-[#10b981] font-mono text-[10px] uppercase tracking-wider">All Approved</span>
              )}
            </div>
          </button>

          {/* CARD 2: LOST & FOUND */}
          <button
            type="button"
            onClick={() => setActiveTab("lost_found")}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-xs
              ${
                activeTab === "lost_found"
                  ? "bg-white border-[#171717] shadow-sm ring-1 ring-[#171717]"
                  : "bg-white border-[#ebebeb] hover:border-[#d4d4d4]"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                Lost & Found
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#f5f5f5] text-[#171717] flex items-center justify-center">
                <UserSearch className="w-4 h-4 text-[#ff4d4d]" />
              </div>
            </div>
            <h3 className="text-3xl font-semibold text-[#171717] mt-2">{lostFoundList.length}</h3>
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#ebebeb]">
              <span className="text-[#888888]">Reports Logged</span>
              {activeLostItems > 0 ? (
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#ee0000] bg-[#ee0000]/10 px-2 py-0.5 rounded-full">
                  {activeLostItems} Active
                </span>
              ) : (
                <span className="text-[#10b981] font-mono text-[10px] uppercase tracking-wider">All Resolved</span>
              )}
            </div>
          </button>

          {/* CARD 3: NIYAZ REQUESTS */}
          <button
            type="button"
            onClick={() => setActiveTab("niyaz")}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-xs
              ${
                activeTab === "niyaz"
                  ? "bg-white border-[#171717] shadow-sm ring-1 ring-[#171717]"
                  : "bg-white border-[#ebebeb] hover:border-[#d4d4d4]"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                Niyaz Requests
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#f5f5f5] text-[#171717] flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-[#7928ca]" />
              </div>
            </div>
            <h3 className="text-3xl font-semibold text-[#171717] mt-2">{niyazList.length}</h3>
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#ebebeb]">
              <span className="text-[#888888]">Total Sabeels</span>
              {pendingNiyaz > 0 ? (
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#ab570a] bg-[#f5a623]/10 px-2 py-0.5 rounded-full">
                  {pendingNiyaz} Pending
                </span>
              ) : (
                <span className="text-[#10b981] font-mono text-[10px] uppercase tracking-wider">Clearances Granted</span>
              )}
            </div>
          </button>

          {/* CARD 4: SOS REQUESTS */}
          <button
            type="button"
            onClick={() => setActiveTab("sos")}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-xs
              ${
                activeTab === "sos"
                  ? "bg-white border-[#ee0000] shadow-sm ring-1 ring-[#ee0000]"
                  : "bg-white border-[#ebebeb] hover:border-[#d4d4d4]"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                SOS Incidents
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#ee0000]/10 text-[#ee0000] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-3xl font-semibold text-[#171717] mt-2">{sosList.length}</h3>
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#ebebeb]">
              <span className="text-[#888888]">Emergency Alerts</span>
              {pendingSOS > 0 ? (
                <span className="font-mono text-[10px] uppercase tracking-wider text-white bg-[#ee0000] px-2 py-0.5 rounded-full">
                  {pendingSOS} Pending
                </span>
              ) : (
                <span className="text-[#10b981] font-mono text-[10px] uppercase tracking-wider">All Resolved</span>
              )}
            </div>
          </button>
        </section>

        {/* DETAILS SECTION CORRESPONDING TO ACTIVE TAB */}
        <section className="bg-white rounded-2xl border border-[#ebebeb] shadow-xs overflow-hidden">
          {/* TAB 1: VOLUNTEERS */}
          {activeTab === "volunteers" && (
            <div>
              <div className="p-6 border-b border-[#ebebeb] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#171717]">Volunteers Registered</h2>
                  <p className="text-xs text-[#666666]">
                    Review volunteer roster, approve applicants, and monitor live attendance
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-[#ebebeb] text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                      <th className="py-3 px-6">Profile</th>
                      <th className="py-3 px-6">Volunteer ID & Name</th>
                      <th className="py-3 px-6">Phone Number</th>
                      <th className="py-3 px-6">Email</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6">Attendance</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebebeb] text-xs">
                    {volunteers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#888888] font-mono">
                          No volunteers have registered for this Juloos yet.
                        </td>
                      </tr>
                    ) : (
                      volunteers.map((vol) => (
                        <tr key={vol.id} className="hover:bg-[#fafafa] transition-colors">
                          <td className="py-3.5 px-6">
                            {vol.profilePicture ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={vol.profilePicture}
                                alt={vol.name}
                                className="w-9 h-9 rounded-xl object-cover border border-[#ebebeb]"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-[#f5f5f5] text-[#171717] border border-[#ebebeb] flex items-center justify-center font-mono text-xs">
                                {vol.name[0]?.toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="font-semibold text-[#171717]">{vol.name}</div>
                            <div className="text-[10px] font-mono text-[#888888] mt-0.5">{vol.id}</div>
                            {vol.rolePreference && (
                              <div className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#fafafa] border border-[#ebebeb] text-[10px] font-medium text-[#555555]">
                                {vol.rolePreference}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-6 text-[#171717] font-mono text-xs">{vol.phone}</td>
                          <td className="py-3.5 px-6 text-[#666666]">{vol.email}</td>
                          <td className="py-3.5 px-6">
                            <Badge status={vol.status} />
                          </td>
                          <td className="py-3.5 px-6">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider
                                ${vol.attendance === "present" ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25" : "bg-[#f5f5f5] text-[#888888]"}
                              `}
                            >
                              {vol.attendance === "present" ? "Present" : "Absent"}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right space-x-2 whitespace-nowrap">
                            {vol.status === "pending" ? (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  pill
                                  isLoading={actionLoadingId === vol.id}
                                  onClick={() => handleVolunteerAction(vol.id, "approved")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  pill
                                  isLoading={actionLoadingId === vol.id}
                                  onClick={() => handleVolunteerAction(vol.id, "rejected")}
                                >
                                  Reject
                                </Button>
                              </>
                            ) : vol.status === "approved" ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                pill
                                isLoading={actionLoadingId === vol.id}
                                onClick={() => handleVolunteerAction(vol.id, "rejected")}
                              >
                                Revoke
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                pill
                                isLoading={actionLoadingId === vol.id}
                                onClick={() => handleVolunteerAction(vol.id, "approved")}
                              >
                                Re-Approve
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: LOST & FOUND */}
          {activeTab === "lost_found" && (
            <div>
              <div className="p-6 border-b border-[#ebebeb] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#171717]">Lost & Found Section</h2>
                  <p className="text-xs text-[#666666]">
                    Track reported missing persons and items. Only committee can resolve items or broadcast them to announcements.
                  </p>
                </div>

                <div className="bg-[#f5f5f5] p-1 rounded-full flex text-xs font-mono">
                  <button
                    onClick={() => setLostFoundFilter("person")}
                    className={`px-3.5 py-1 rounded-full transition-all text-xs
                      ${lostFoundFilter === "person" ? "bg-white text-[#171717] shadow-xs" : "text-[#888888]"}
                    `}
                  >
                    Missing Persons ({lostFoundList.filter((l) => l.itemType === "person").length})
                  </button>
                  <button
                    onClick={() => setLostFoundFilter("item")}
                    className={`px-3.5 py-1 rounded-full transition-all text-xs
                      ${lostFoundFilter === "item" ? "bg-white text-[#171717] shadow-xs" : "text-[#888888]"}
                    `}
                  >
                    Found Items ({lostFoundList.filter((l) => l.itemType === "item").length})
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-[#ebebeb] text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                      <th className="py-3 px-6">ID & Subject</th>
                      <th className="py-3 px-6">Description</th>
                      <th className="py-3 px-6">Location</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6">Reported By (Volunteer)</th>
                      <th className="py-3 px-6 text-right">Committee Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebebeb] text-xs">
                    {lostFoundList.filter((l) => l.itemType === lostFoundFilter).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#888888] font-mono">
                          No {lostFoundFilter === "person" ? "missing persons" : "lost items"} reported.
                        </td>
                      </tr>
                    ) : (
                      lostFoundList
                        .filter((l) => l.itemType === lostFoundFilter)
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
                            <td className="py-3.5 px-6 align-top">
                              <div className="flex items-center space-x-3">
                                {item.photoUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={item.photoUrl}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-[#ebebeb]"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] text-[#171717] border border-[#ebebeb] flex items-center justify-center font-mono text-xs">
                                    {item.itemType === "person" ? "P" : "I"}
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-[#171717]">{item.name}</div>
                                  <div className="text-[10px] text-[#888888] font-mono mt-0.5">{item.id}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-6 align-top max-w-xs text-[#666666] leading-relaxed">
                              {item.description}
                            </td>

                            <td className="py-3.5 px-6 align-top text-[#171717]">
                              {item.location}
                            </td>

                            <td className="py-3.5 px-6 align-top">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider
                                  ${item.status === "lost" ? "bg-[#ee0000]/10 text-[#ee0000] border border-[#ee0000]/20" : item.status === "found" ? "bg-[#f5a623]/10 text-[#ab570a] border border-[#f5a623]/30" : "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25"}
                                `}
                              >
                                {item.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-6 align-top">
                              <button
                                type="button"
                                onClick={() => setSelectedVolunteer(item.reportedBy)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#f5f5f5] text-[#171717] font-mono text-xs hover:bg-[#ebebeb] transition-colors cursor-pointer"
                              >
                                <span>{item.reportedBy.name}</span>
                                <ExternalLink className="w-3 h-3 text-[#888888]" />
                              </button>
                            </td>

                            <td className="py-3.5 px-6 align-top text-right space-x-2 whitespace-nowrap">
                              {item.itemType === "person" && item.status !== "resolved" && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  pill
                                  disabled={item.isBroadcasted}
                                  isLoading={actionLoadingId === item.id}
                                  onClick={() => handleBroadcastAnnouncement(item)}
                                  className="space-x-1"
                                >
                                  <Megaphone className="w-3.5 h-3.5 text-[#0070f3]" />
                                  <span>{item.isBroadcasted ? "Broadcasted" : "Broadcast Notice"}</span>
                                </Button>
                              )}

                              {item.status !== "resolved" ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  pill
                                  isLoading={actionLoadingId === item.id}
                                  onClick={() => handleResolveLostFound(item.id)}
                                >
                                  Mark Resolved
                                </Button>
                              ) : (
                                <span className="inline-flex items-center text-[#10b981] font-mono text-xs">
                                  <Check className="w-3.5 h-3.5 mr-1" />
                                  Resolved
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NIYAZ REQUESTS */}
          {activeTab === "niyaz" && (
            <div>
              <div className="p-6 border-b border-[#ebebeb] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#171717]">Niyaz Registration Requests</h2>
                  <p className="text-xs text-[#666666]">
                    Verify distributor hygiene and permits. Approved distributors receive official QR verification passes.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-[#ebebeb] text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                      <th className="py-3 px-6">ID & Item Name</th>
                      <th className="py-3 px-6">Setup Type</th>
                      <th className="py-3 px-6">Distributor Info</th>
                      <th className="py-3 px-6">Location & Expiry</th>
                      <th className="py-3 px-6">Description</th>
                      <th className="py-3 px-6">Status & QR</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebebeb] text-xs">
                    {niyazList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#888888] font-mono">
                          No Niyaz or Sabeel distribution permits registered.
                        </td>
                      </tr>
                    ) : (
                      niyazList.map((n) => (
                        <tr key={n.id} className="hover:bg-[#fafafa] transition-colors">
                          <td className="py-3.5 px-6 align-top">
                            <div className="font-semibold text-[#171717]">{n.niyazName}</div>
                            <div className="text-[10px] text-[#888888] font-mono mt-0.5">{n.id}</div>
                          </td>

                          <td className="py-3.5 px-6 align-top">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#f5f5f5] text-[#171717] border border-[#ebebeb]">
                              {n.distributorType === "booth" ? "Sabeel / Booth" : "Individual"}
                            </span>
                          </td>

                          <td className="py-3.5 px-6 align-top space-y-1">
                            <div className="font-semibold text-[#171717]">{n.distributorName}</div>
                            <div className="text-[#888888] font-mono text-[11px]">{n.distributorPhone}</div>
                            <div className="text-[#888888] text-[11px]">{n.distributorEmail}</div>
                            {n.distributorWebsite && (
                              <a
                                href={n.distributorWebsite}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#0070f3] hover:underline flex items-center space-x-1"
                              >
                                <Globe className="w-3 h-3" />
                                <span>Website</span>
                              </a>
                            )}
                          </td>

                          <td className="py-3.5 px-6 align-top space-y-1">
                            <div className="text-[#171717]">{n.distributorAddress}</div>
                            <div className="text-[#888888] font-mono text-[10px]">Valid: {n.expirationDate}</div>
                          </td>

                          <td className="py-3.5 px-6 align-top max-w-xs text-[#666666] line-clamp-3">
                            {n.distributorDescription}
                          </td>

                          <td className="py-3.5 px-6 align-top space-y-1.5">
                            <Badge status={n.status} />
                            {n.status === "approved" && (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedNiyazQR(n)}
                                  className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#0070f3] hover:underline cursor-pointer"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  <span>View Pass QR</span>
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-6 align-top text-right space-x-2 whitespace-nowrap">
                            {n.status === "pending" ? (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  pill
                                  isLoading={actionLoadingId === n.id}
                                  onClick={() => handleNiyazAction(n.id, "approved")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  pill
                                  isLoading={actionLoadingId === n.id}
                                  onClick={() => handleNiyazAction(n.id, "rejected")}
                                >
                                  Reject
                                </Button>
                              </>
                            ) : n.status === "approved" ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                pill
                                isLoading={actionLoadingId === n.id}
                                onClick={() => handleNiyazAction(n.id, "rejected")}
                              >
                                Revoke
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                pill
                                isLoading={actionLoadingId === n.id}
                                onClick={() => handleNiyazAction(n.id, "approved")}
                              >
                                Re-Approve
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SOS REQUESTS */}
          {activeTab === "sos" && (
            <div>
              <div className="p-6 border-b border-[#ebebeb] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#ee0000]">SOS Emergency Incident Triage</h2>
                  <p className="text-xs text-[#666666]">
                    Live emergency alerts reported on ground. Only the committee has authority to mark incidents resolved.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-[#ebebeb] text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                      <th className="py-3 px-6">Incident ID</th>
                      <th className="py-3 px-6">Description of Emergency</th>
                      <th className="py-3 px-6">Incident Location</th>
                      <th className="py-3 px-6">Time Logged</th>
                      <th className="py-3 px-6">Reporter Details</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Committee Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebebeb] text-xs">
                    {sosList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#888888] font-mono">
                          No emergency SOS reports logged for this procession.
                        </td>
                      </tr>
                    ) : (
                      sosList.map((sos) => (
                        <tr key={sos.id} className="hover:bg-[#fafafa] transition-colors">
                          <td className="py-3.5 px-6 font-mono text-[11px] text-[#888888]">
                            {sos.id}
                          </td>
                          <td className="py-3.5 px-6 max-w-xs text-[#171717] leading-relaxed">
                            {sos.description}
                          </td>
                          <td className="py-3.5 px-6 text-[#171717]">
                            {sos.location}
                          </td>
                          <td className="py-3.5 px-6 text-[#888888] font-mono text-xs">
                            {new Date(sos.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3.5 px-6 space-y-0.5">
                            <div className="font-semibold text-[#171717]">{sos.userName}</div>
                            <div className="text-[#888888] font-mono text-[11px]">{sos.userPhone}</div>
                          </td>
                          <td className="py-3.5 px-6">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider
                                ${sos.status === "pending" ? "bg-[#ee0000]/10 text-[#ee0000] border border-[#ee0000]/20" : "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25"}
                              `}
                            >
                              {sos.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right whitespace-nowrap">
                            {sos.status === "pending" ? (
                              <Button
                                variant="primary"
                                size="sm"
                                pill
                                isLoading={actionLoadingId === sos.id}
                                onClick={() => handleResolveSOS(sos.id)}
                              >
                                Mark Resolved
                              </Button>
                            ) : (
                              <span className="inline-flex items-center text-[#10b981] font-mono text-xs">
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Resolved
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* POPUP MODAL: VOLUNTEER DETAILS (for Lost & Found "Reported By") */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#ebebeb] shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative space-y-4 text-center">
            <button
              onClick={() => setSelectedVolunteer(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#888888] hover:text-[#171717] hover:bg-[#f5f5f5]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-[#f5f5f5] text-[#171717] border border-[#ebebeb] flex items-center justify-center mx-auto text-base font-mono">
              {selectedVolunteer.name[0]?.toUpperCase()}
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#171717]">{selectedVolunteer.name}</h3>
              <p className="text-xs text-[#888888] mt-0.5 capitalize">{selectedVolunteer.role} (Verified On Ground)</p>
            </div>

            <div className="bg-[#fafafa] rounded-xl p-3 text-xs text-left space-y-2 border border-[#ebebeb]">
              <div className="flex items-center justify-between">
                <span className="text-[#888888]">Phone Number:</span>
                <a href={`tel:${selectedVolunteer.phone}`} className="font-mono text-[#0070f3] hover:underline">
                  {selectedVolunteer.phone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#888888]">Volunteer ID:</span>
                <span className="font-mono text-[#171717]">{selectedVolunteer.uid.slice(0, 10)}</span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              pill
              fullWidth
              onClick={() => setSelectedVolunteer(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* POPUP MODAL: APPROVED NIYAZ QR CODE PASS */}
      {selectedNiyazQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#ebebeb] shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative space-y-4 text-center">
            <button
              onClick={() => setSelectedNiyazQR(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#888888] hover:text-[#171717] hover:bg-[#f5f5f5]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[#10b981] font-mono text-[11px] uppercase tracking-wider font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official Verification Pass</span>
            </div>

            <h3 className="text-base font-semibold text-[#171717]">{selectedNiyazQR.niyazName}</h3>
            <p className="text-xs text-[#888888]">Distributor: {selectedNiyazQR.distributorName}</p>

            {/* Generated QR Code Pass Visual */}
            <div className="p-4 bg-[#111111] rounded-xl text-white space-y-2">
              <div className="w-36 h-36 mx-auto bg-white rounded-lg p-2 flex flex-col items-center justify-center border border-[#10b981]">
                <QrCode className="w-28 h-28 text-[#111111]" />
              </div>
              <p className="font-mono text-[10px] text-[#888888] truncate max-w-[240px] mx-auto">
                {selectedNiyazQR.qrCodeData}
              </p>
            </div>

            <div className="text-[11px] text-[#888888] leading-tight">
              Present this code to verified Carvaan volunteers during procession inspection. Valid until {selectedNiyazQR.expirationDate}.
            </div>

            <Button
              variant="secondary"
              size="sm"
              pill
              fullWidth
              onClick={() => setSelectedNiyazQR(null)}
            >
              Close Pass
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
