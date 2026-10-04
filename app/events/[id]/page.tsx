"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  fetchEventById,
  fetchUserVolunteerRegistration,
  fetchEventSOSRequests,
  fetchEventLostAndFound,
  updateVolunteerAttendance,
} from "@/lib/firebase/event-services";
import {
  JuloosEvent,
  VolunteerRegistration,
  SOSRequest,
  LostAndFoundItem,
} from "@/types/event";
import { RouteMap } from "@/components/events/RouteMap";
import { EventVideoPlayer } from "@/components/events/EventVideoPlayer";
import { VolunteerModal } from "@/components/events/VolunteerModal";
import { NiyazModal } from "@/components/events/NiyazModal";
import { SOSModal } from "@/components/events/SOSModal";
import { LostFoundModal } from "@/components/events/LostFoundModal";
import { EventDonationCard } from "@/components/events/EventDonationCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Bell,
  HeartHandshake,
  AlertTriangle,
  UtensilsCrossed,
  UserSearch,
  CheckCircle2,
  Radio,
  ArrowLeft,
  QrCode,
  Check,
  UserCheck,
  Shield,
  Loader2,
  Share2,
  Heart,
  Video,
  MoreHorizontal,
  X,
  ChevronRight,
} from "lucide-react";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: eventId } = use(params);
  const { user, userProfile, loading: authLoading } = useAuth();

  const [event, setEvent] = useState<JuloosEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [volunteerRecord, setVolunteerRecord] = useState<VolunteerRegistration | null>(null);
  const [sosList, setSosList] = useState<SOSRequest[]>([]);
  const [lostFoundList, setLostFoundList] = useState<LostAndFoundItem[]>([]);
  const [activeTabLostFound, setActiveTabLostFound] = useState<"person" | "item">("person");

  // Modals state
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [isNiyazModalOpen, setIsNiyazModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isLostFoundModalOpen, setIsLostFoundModalOpen] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [qrScannerDemo, setQrScannerDemo] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const ev = await fetchEventById(eventId);
      setEvent(ev);

      const candidateUid =
        user?.uid ||
        (typeof window !== "undefined" ? localStorage.getItem("carvaan_guest_uid") : null);
      if (candidateUid) {
        const vol = await fetchUserVolunteerRegistration(eventId, candidateUid);
        setVolunteerRecord(vol);
      }

      const sos = await fetchEventSOSRequests(eventId);
      setSosList(sos);

      const lf = await fetchEventLostAndFound(eventId);
      setLostFoundList(lf);
    } catch (err) {
      console.error("Error loading event data:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId, user]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  const handleToggleAttendance = async () => {
    if (!volunteerRecord) return;
    setAttendanceLoading(true);
    const newStatus = volunteerRecord.attendance === "present" ? "absent" : "present";
    try {
      await updateVolunteerAttendance(volunteerRecord.id, newStatus);
      setVolunteerRecord((prev) => (prev ? { ...prev, attendance: newStatus } : null));
    } catch (err) {
      console.error("Attendance update failed:", err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const [activeSection, setActiveSection] = useState<string>("section-livestream");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!event) return;
    const sectionIds = [
      "section-livestream",
      "section-route",
      "section-announcements",
      "section-lost-found",
      "donate-juloos-section",
      "section-volunteer",
      "section-niyaz",
      "section-committee",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [event]);

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryLeftCards = [
    { id: "section-route", label: "Route", icon: MapPin },
    { id: "section-announcements", label: "Alerts", icon: Bell },
  ];

  const primaryRightCards = [
    { id: "donate-juloos-section", label: "Donate", icon: Heart },
  ];

  const moreCards = [
    {
      id: "section-livestream",
      label: "Live Stream",
      description: "Live camera telecast and audio coverage",
      icon: Video,
    },
    {
      id: "section-lost-found",
      label: "Lost & Found",
      description: "Missing persons & recovered belongings",
      icon: UserSearch,
    },
    {
      id: "section-volunteer",
      label: "Volunteer Corps",
      description: "Passes, duty attendance & scanner",
      icon: HeartHandshake,
    },
    {
      id: "section-niyaz",
      label: "Niyaz Registry",
      description: "Sabeel & food stall verification",
      icon: UtensilsCrossed,
    },
    {
      id: "section-committee",
      label: "Organizing Committee",
      description: "Verified organizer credentials & contacts",
      icon: Building2,
    },
  ];

  if (authLoading || (loading && !event)) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#0070f3] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-wider text-[#888888]">Loading Juloos telemetry...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-semibold text-[#171717]">Event Not Found</h2>
        <p className="text-xs text-[#666666] mt-1">The procession you are looking for does not exist.</p>
        <Link href="/" className="mt-4">
          <Button variant="secondary" size="sm" pill>Back to Directory</Button>
        </Link>
      </div>
    );
  }

  const isVolunteer = Boolean(volunteerRecord && volunteerRecord.status === "approved");
  const isCommittee = userProfile?.role === "committee";
  const canViewRestrictedSOS = isVolunteer || isCommittee;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-[#171717] selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Sub-Header Breadcrumb & Emergency SOS Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#ebebeb] sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#666666] hover:text-[#171717] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Processions</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: event.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Event link copied to clipboard!");
                }
              }}
              className="p-1.5 rounded-full border border-[#ebebeb] bg-white text-[#666666] hover:text-[#171717] hover:bg-[#fafafa] transition-colors cursor-pointer"
              title="Share Event"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* High-visibility SOS CTA button */}
            <Button
              variant="danger"
              size="sm"
              pill
              className="space-x-1 font-medium text-xs px-2.5 sm:px-3 py-1 shrink-0"
              onClick={() => setIsSosModalOpen(true)}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SOS EMERGENCY</span>
              <span className="sm:hidden">SOS</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full pb-24 md:pb-8">
        {/* HERO SECTION */}
        <section className="bg-white rounded-2xl border border-[#ebebeb] overflow-hidden shadow-xs">
          <div className="relative h-60 sm:h-72 bg-[#111111]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.coverImage || "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80"}
              alt={event.title}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            <div className="absolute top-4 left-4">
              {event.status === "live" ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-black/70 text-white border border-white/20 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ee0000] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ee0000]"></span>
                  </span>
                  <span>LIVE GPS TRACKING</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/90 text-[#171717] border border-[#ebebeb] backdrop-blur-xs">
                  {event.status === "upcoming" ? "Scheduled Upcoming" : "Completed"}
                </span>
              )}
            </div>

            <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
              <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-200">
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-300" />
                  <span>{event.date}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-300" />
                  <span>{event.startTime} to {event.endTime}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00dfd8]" />
                  <span>{event.location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Strip */}
          <div className="p-4 bg-[#fafafa] border-t border-[#ebebeb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#666666] line-clamp-2 sm:line-clamp-1 max-w-md">
              {event.description}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                pill
                onClick={() => setIsVolunteerModalOpen(true)}
                className="w-full sm:w-auto justify-center"
              >
                <HeartHandshake className="w-3.5 h-3.5 mr-1.5 text-[#10b981]" />
                <span>{volunteerRecord ? "Volunteer Status" : "Volunteer Here"}</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                pill
                onClick={() => setIsNiyazModalOpen(true)}
                className="w-full sm:w-auto justify-center"
              >
                <UtensilsCrossed className="w-3.5 h-3.5 mr-1.5 text-[#0070f3]" />
                <span>Register Niyaz</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                pill
                onClick={() => {
                  const el = document.getElementById("donate-juloos-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto justify-center text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/10"
              >
                <Heart className="w-3.5 h-3.5 mr-1.5 fill-current text-[#10b981]" />
                <span>Donate / Hadiya</span>
              </Button>
            </div>
          </div>
        </section>

        {/* 7 DEDICATED CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS */}
          <div className="md:col-span-2 space-y-6">
            {/* EMBEDDED LIVE VIDEO PLAYER */}
            <div id="section-livestream" className="scroll-mt-24">
              <EventVideoPlayer
                videoUrl={event.videoUrl || "https://www.youtube.com/watch?v=ss-HcTBup88"}
                title={`${event.title} - Live Stream & Video Coverage`}
                isLive={event.status === "live"}
              />
            </div>

            {/* CARD 1: ROUTE OF THE JULOOS */}
            <div id="section-route" className="scroll-mt-24">
              <RouteMap
                startPoint={event.route.startPoint}
                endPoint={event.route.endPoint}
                waypoints={event.route.waypoints}
                title="Procession Route & Checkpoints"
              />
            </div>

            {/* CARD 2: ANNOUNCEMENTS */}
            <div id="section-announcements" className="scroll-mt-24 bg-white rounded-2xl border border-[#ebebeb] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-[#0070f3]" />
                  <h3 className="text-base font-semibold text-[#171717]">Official Announcements</h3>
                </div>
                <span className="text-xs font-mono text-[#888888]">
                  {event.announcements?.length || 0} Broadcasts
                </span>
              </div>

              {event.announcements?.length === 0 ? (
                <p className="text-xs text-[#888888] py-4 text-center font-mono">No broadcasts announced yet.</p>
              ) : (
                <div className="space-y-3">
                  {event.announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5
                        ${
                          ann.priority === "urgent"
                            ? "bg-[#ee0000]/5 border-[#ee0000]/20 text-[#ee0000]"
                            : "bg-[#fafafa] border-[#ebebeb] text-[#171717]"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {ann.priority === "urgent" && (
                            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-[#ee0000] text-white">
                              URGENT
                            </span>
                          )}
                          <span className="font-semibold text-xs text-[#171717]">{ann.title}</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#888888]">
                          {new Date(ann.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[#666666] leading-relaxed">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CARD 3: LOST AND FOUND SECTION */}
            <div id="section-lost-found" className="scroll-mt-24 bg-white rounded-2xl border border-[#ebebeb] p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <UserSearch className="w-4 h-4 text-[#ff4d4d]" />
                  <div>
                    <h3 className="text-base font-semibold text-[#171717]">Lost & Found Center</h3>
                    <p className="text-xs text-[#888888]">Missing children/persons & recovered belongings</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="bg-[#f5f5f5] p-1 rounded-full border border-[#ebebeb] flex text-xs">
                    <button
                      onClick={() => setActiveTabLostFound("person")}
                      className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer
                        ${activeTabLostFound === "person" ? "bg-white text-[#171717] shadow-xs" : "text-[#888888] hover:text-[#171717]"}
                      `}
                    >
                      Persons
                    </button>
                    <button
                      onClick={() => setActiveTabLostFound("item")}
                      className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer
                        ${activeTabLostFound === "item" ? "bg-white text-[#171717] shadow-xs" : "text-[#888888] hover:text-[#171717]"}
                      `}
                    >
                      Belongings
                    </button>
                  </div>

                  {(isVolunteer || isCommittee) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      pill
                      onClick={() => setIsLostFoundModalOpen(true)}
                    >
                      Report Item
                    </Button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {lostFoundList
                  .filter((item) => item.itemType === activeTabLostFound)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-[#ebebeb] bg-[#fafafa] hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start space-x-3.5">
                        {item.photoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.photoUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#ebebeb]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] text-[#171717] border border-[#ebebeb] flex items-center justify-center font-bold text-xs font-mono">
                            {item.itemType === "person" ? "P" : "I"}
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-xs text-[#171717]">{item.name}</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase
                                ${item.status === "lost" ? "bg-[#ee0000]/10 text-[#ee0000] border border-[#ee0000]/20" : "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25"}
                              `}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="text-[#666666] max-w-md">{item.description}</p>
                          <div className="flex items-center space-x-2 text-[#888888] text-[11px]">
                            <span>Location: <strong className="text-[#171717]">{item.location}</strong></span>
                            <span>•</span>
                            <span>Reported by: {item.reportedBy.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: SIDE CARDS */}
          <div className="space-y-6">
            {/* CARD 4: ORGANIZING COMMITTEE CARD */}
            <div id="section-committee" className="scroll-mt-24 bg-white rounded-2xl border border-[#ebebeb] p-6 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#0070f3]" />
                <h3 className="text-base font-semibold text-[#171717]">Organizing Committee</h3>
              </div>

              <div className="flex items-center space-x-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.committeeLogo}
                  alt={event.committeeName}
                  className="w-10 h-10 rounded-xl object-cover border border-[#ebebeb]"
                />
                <div>
                  <h4 className="font-semibold text-xs text-[#171717]">{event.committeeName}</h4>
                  <span className="inline-flex items-center text-[11px] text-[#10b981] font-medium mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Verified Organizer
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#666666] leading-relaxed">
                Certified organizing committee overseeing route safety, civic permissions, and volunteer assignments for this Juloos.
              </p>
            </div>

            {/* DONATE TO JULOOS VIA UPI QR CODE */}
            <div id="donate-juloos-section" className="scroll-mt-24">
              <EventDonationCard
                donationConfig={event.donationConfig}
                committeeName={event.committeeName}
                eventTitle={event.title}
              />
            </div>

            {/* CARD 5: VOLUNTEER PARTICIPATION & ATTENDANCE */}
            <div id="section-volunteer" className="scroll-mt-24 bg-white rounded-2xl border border-[#ebebeb] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HeartHandshake className="w-4 h-4 text-[#10b981]" />
                  <h3 className="text-base font-semibold text-[#171717]">Volunteer Corps</h3>
                </div>
                {volunteerRecord && <Badge status={volunteerRecord.status} />}
              </div>

              {!volunteerRecord ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#666666] leading-relaxed">
                    Join the verified volunteer squad to assist attendees, monitor crowd points, verify Niyaz, and support emergencies.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    pill
                    fullWidth
                    onClick={() => setIsVolunteerModalOpen(true)}
                  >
                    Register as Volunteer
                  </Button>
                </div>
              ) : (
                <div className="space-y-3.5 pt-1">
                  <div className="p-3.5 bg-[#f5f5f5] border border-[#ebebeb] rounded-xl text-xs space-y-1">
                    <p className="font-semibold font-mono text-[#171717]">Pass ID: {volunteerRecord.id.slice(0, 12)}</p>
                    <p className="text-[#666666]">Status: {volunteerRecord.status === "approved" ? "Active on Ground" : "Under Review by Committee"}</p>
                  </div>

                  {/* Attendance marking button */}
                  {volunteerRecord.status === "approved" && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                        Attendance Status
                      </label>
                      <button
                        type="button"
                        onClick={handleToggleAttendance}
                        disabled={attendanceLoading}
                        className={`w-full py-2.5 px-3 rounded-full text-xs font-medium transition-all flex items-center justify-center space-x-2 cursor-pointer
                          ${
                            volunteerRecord.attendance === "present"
                              ? "bg-[#10b981] text-white shadow-xs"
                              : "bg-white text-[#171717] hover:bg-[#fafafa] border border-[#ebebeb]"
                          }
                        `}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>
                          {volunteerRecord.attendance === "present"
                            ? "Attendance Marked: PRESENT"
                            : "Click to Mark Attendance (PRESENT)"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Volunteer Feature: Scan Niyaz QR */}
                  {volunteerRecord.status === "approved" && (
                    <div className="pt-2 border-t border-[#ebebeb]">
                      <button
                        onClick={() => setQrScannerDemo(!qrScannerDemo)}
                        className="w-full py-2 px-3 rounded-full border border-[#ebebeb] text-xs font-medium text-[#171717] hover:bg-[#fafafa] flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#0070f3]" />
                        <span>{qrScannerDemo ? "Close Scanner" : "Scan Niyaz QR Permit"}</span>
                      </button>

                      {qrScannerDemo && (
                        <div className="mt-3 p-4 rounded-xl bg-[#111111] text-white text-center space-y-2 text-xs">
                          <p className="font-medium text-[#00dfd8]">Camera Scanner Ready</p>
                          <p className="text-[11px] text-gray-400">Point phone camera at Sabeel/Niyaz distributor QR pass to verify clearance.</p>
                          <div className="w-24 h-24 mx-auto border-2 border-dashed border-[#00dfd8] rounded-xl flex items-center justify-center">
                            <QrCode className="w-12 h-12 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CARD 6: REGISTER NIYAZ & PERMITS */}
            <div id="section-niyaz" className="scroll-mt-24 bg-white rounded-2xl border border-[#ebebeb] p-6 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2">
                <UtensilsCrossed className="w-4 h-4 text-[#7928ca]" />
                <h3 className="text-base font-semibold text-[#171717]">Niyaz / Sabeel Registry</h3>
              </div>
              <p className="text-xs text-[#666666] leading-relaxed">
                Organizing a water sabeel, milk distribution, or packed food? Register to receive your official committee verification QR code.
              </p>
              <Button
                variant="primary"
                size="md"
                pill
                fullWidth
                onClick={() => setIsNiyazModalOpen(true)}
              >
                Register Niyaz Stall
              </Button>
            </div>

            {/* CARD 7: SOS REQUESTS FEED (Visible to Committee & Volunteers) */}
            {canViewRestrictedSOS && (
              <div id="section-sos-feed" className="scroll-mt-24 bg-[#ee0000]/5 rounded-2xl border border-[#ee0000]/20 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#ee0000]">
                    <Shield className="w-4 h-4" />
                    <h3 className="text-base font-semibold">Active SOS Feed</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-[#ee0000] text-white">
                    {sosList.length} Active
                  </span>
                </div>
                <p className="text-xs text-[#ee0000]/80">
                  Visible to on-duty volunteers & committee members only.
                </p>

                <div className="space-y-2.5">
                  {sosList.map((sos) => (
                    <div
                      key={sos.id}
                      className="p-3.5 rounded-xl bg-white border border-[#ee0000]/20 text-xs space-y-1 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#171717]">{sos.userName}</span>
                        <span className="text-[10px] font-mono text-[#888888]">
                          {new Date(sos.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[#666666]">{sos.description}</p>
                      <div className="text-[11px] text-[#888888] flex items-center justify-between pt-1">
                        <span>Location: <strong className="text-[#171717]">{sos.location}</strong></span>
                        <a href={`tel:${sos.userPhone}`} className="text-[#0070f3] font-medium hover:underline">
                          Call: {sos.userPhone}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODALS */}
      {(() => {
        const effectiveUser = user || {
          uid:
            typeof window !== "undefined"
              ? localStorage.getItem("carvaan_guest_uid") || "guest_attendee"
              : "guest_attendee",
          displayName: "Guest Attendee",
          email: "",
          photoURL: null,
        };

        return (
          <>
            <VolunteerModal
              isOpen={isVolunteerModalOpen}
              onClose={() => setIsVolunteerModalOpen(false)}
              eventId={event.id}
              user={user}
              onSuccess={loadData}
            />
            <NiyazModal
              isOpen={isNiyazModalOpen}
              onClose={() => setIsNiyazModalOpen(false)}
              eventId={event.id}
              user={effectiveUser}
              onSuccess={loadData}
            />
            <SOSModal
              isOpen={isSosModalOpen}
              onClose={() => setIsSosModalOpen(false)}
              eventId={event.id}
              user={effectiveUser}
              onSuccess={loadData}
            />
            <LostFoundModal
              isOpen={isLostFoundModalOpen}
              onClose={() => setIsLostFoundModalOpen(false)}
              eventId={event.id}
              user={effectiveUser}
              userRole={isCommittee ? "committee" : "volunteer"}
              onSuccess={loadData}
            />
          </>
        );
      })()}

      {/* Mobile-Only "More Sections" Slide-Up Drawer */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative bg-white rounded-t-3xl border-t border-[#ebebeb] p-5 shadow-2xl max-h-[80vh] overflow-y-auto z-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200">
            {/* Grab Handle */}
            <div className="w-10 h-1.5 bg-[#e5e5e5] rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0]">
              <div>
                <h3 className="text-sm font-semibold text-[#171717]">More Procession Sections</h3>
                <p className="text-xs text-[#888888]">Jump directly to any section on this page</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-[#f5f5f5] text-[#666666] hover:text-[#171717] cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-[#f5f5f5] mt-2">
              {moreCards.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      scrollToSection(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`w-full py-3 px-2 flex items-center justify-between text-left rounded-xl transition-colors cursor-pointer
                      ${isActive ? "bg-[#f5f5f5] text-[#171717]" : "hover:bg-[#fafafa] text-[#404040]"}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${isActive ? "bg-[#171717] text-white" : "bg-[#f5f5f5] text-[#171717]"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-[#171717]">
                            {item.label}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-mono font-medium px-2 py-0.2 rounded-full bg-[#10b981]/15 text-[#10b981]">
                              Viewing
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#888888] line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#a3a3a3]" />
                  </button>
                );
              })}

              {/* If Restricted SOS is visible to user */}
              {canViewRestrictedSOS && (
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection("section-sos-feed");
                    setIsMoreOpen(false);
                  }}
                  className="w-full py-3 px-2 flex items-center justify-between text-left rounded-xl hover:bg-[#ee0000]/5 transition-colors cursor-pointer text-[#ee0000]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-[#ee0000]/10 text-[#ee0000]">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold">Active SOS Feed ({sosList.length})</span>
                      <p className="text-[11px] text-[#ee0000]/80">Restricted emergency queue</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#ee0000]/60" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Only Bottom Navigation Dock with Elevated SOS Center CTA */}
      <nav
        aria-label="Event Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ebebeb] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.6rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-md mx-auto px-3 flex items-center justify-between h-16 relative">
          {/* Left Primary Cards (Route & Alerts) */}
          <div className="flex items-center justify-around flex-1 pr-2">
            {primaryLeftCards.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer group flex-1
                    ${isActive ? "text-[#171717]" : "text-[#737373] hover:text-[#171717]"}
                  `}
                  title={item.label}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#171717] text-white shadow-xs"
                        : "text-[#737373] group-hover:text-[#171717] group-hover:bg-[#f5f5f5]"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                  </div>
                  <span
                    className={`text-[10px] font-medium leading-tight truncate w-full text-center mt-0.5 ${
                      isActive ? "text-[#171717] font-semibold" : "text-[#737373]"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Elevated SOS Emergency Center CTA */}
          <div className="flex flex-col items-center justify-center shrink-0 px-2">
            <button
              type="button"
              onClick={() => setIsSosModalOpen(true)}
              className="group relative -top-3.5 w-13 h-13 rounded-full bg-linear-to-b from-[#ee0000] to-[#b91c1c] text-white flex flex-col items-center justify-center shadow-lg shadow-[#ee0000]/40 hover:shadow-xl hover:scale-105 active:scale-95 transition-all ring-4 ring-white border border-red-300/40 cursor-pointer focus:outline-none"
              aria-label="Broadcast Emergency SOS"
              title="Broadcast Emergency SOS"
            >
              <span className="absolute -inset-1 rounded-full bg-[#ee0000]/30 animate-ping opacity-60 pointer-events-none" />
              <AlertTriangle className="w-5 h-5 text-white animate-pulse relative z-10" />
              <span className="text-[10px] font-black tracking-wider text-white uppercase relative z-10 leading-none mt-0.5">
                SOS
              </span>
            </button>
          </div>

          {/* Right Primary Card (Donate) + "More" Drawer Button */}
          <div className="flex items-center justify-around flex-1 pl-2">
            {primaryRightCards.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer group flex-1
                    ${isActive ? "text-[#171717]" : "text-[#737373] hover:text-[#171717]"}
                  `}
                  title={item.label}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#171717] text-white shadow-xs"
                        : "text-[#737373] group-hover:text-[#171717] group-hover:bg-[#f5f5f5]"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                  </div>
                  <span
                    className={`text-[10px] font-medium leading-tight truncate w-full text-center mt-0.5 ${
                      isActive ? "text-[#171717] font-semibold" : "text-[#737373]"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* "More" Sections Button */}
            {(() => {
              const isMoreActive = moreCards.some((c) => c.id === activeSection);
              return (
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer group flex-1 relative
                    ${isMoreOpen || isMoreActive ? "text-[#171717]" : "text-[#737373] hover:text-[#171717]"}
                  `}
                  title="More Sections"
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors relative ${
                      isMoreOpen || isMoreActive
                        ? "bg-[#171717] text-white shadow-xs"
                        : "text-[#737373] group-hover:text-[#171717] group-hover:bg-[#f5f5f5]"
                    }`}
                  >
                    <MoreHorizontal className="w-4.5 h-4.5" />
                    {isMoreActive && !isMoreOpen && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10b981] ring-2 ring-white" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium leading-tight truncate w-full text-center mt-0.5 ${
                      isMoreOpen || isMoreActive ? "text-[#171717] font-semibold" : "text-[#737373]"
                    }`}
                  >
                    More
                  </span>
                </button>
              );
            })()}
          </div>
        </div>
      </nav>

      <Footer />
    </div>
  );
}
