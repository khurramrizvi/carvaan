"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { QRScannerModal } from "@/components/volunteer/QRScannerModal";
import { LostFoundModal } from "@/components/events/LostFoundModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  QrCode,
  AlertTriangle,
  UserSearch,
  UserCheck,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Package,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function VolunteerPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: eventId } = use(params);
  const { user, loading: authLoading } = useAuth();

  const [event, setEvent] = useState<JuloosEvent | null>(null);
  const [volunteerRecord, setVolunteerRecord] = useState<VolunteerRegistration | null>(null);
  const [sosList, setSosList] = useState<SOSRequest[]>([]);
  const [lostFoundList, setLostFoundList] = useState<LostAndFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLostFoundModalOpen, setIsLostFoundModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [ev, vol, sos, lf] = await Promise.all([
        fetchEventById(eventId),
        fetchUserVolunteerRegistration(eventId, user.uid),
        fetchEventSOSRequests(eventId),
        fetchEventLostAndFound(eventId),
      ]);
      setEvent(ev);
      setVolunteerRecord(vol);
      setSosList(sos);
      setLostFoundList(lf);
    } catch (err) {
      console.error("Error loading volunteer portal:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId, user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router, loadData]);

  const handleToggleAttendance = async () => {
    if (!volunteerRecord) return;
    setAttendanceLoading(true);
    const newStatus = volunteerRecord.attendance === "present" ? "absent" : "present";
    try {
      await updateVolunteerAttendance(volunteerRecord.id, newStatus);
      setVolunteerRecord((prev) => (prev ? { ...prev, attendance: newStatus } : null));
    } catch (err) {
      console.error("Failed to update attendance:", err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (authLoading || (loading && !event)) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#0070f3] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-wider text-[#888888]">Connecting to Field Operations...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-semibold text-[#171717]">Event Not Found</h2>
        <Link href="/" className="mt-4">
          <Button variant="secondary" size="sm" pill>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const isApproved = volunteerRecord?.status === "approved";

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 md:pb-16 font-sans selection:bg-[#171717] selection:text-white">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#ebebeb] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#666666] hover:text-[#171717] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Event Overview</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-6 h-6 rounded-md overflow-hidden border border-[#ebebeb] bg-white shrink-0 shadow-xs transition-transform group-hover:scale-105">
              <Image
                src="/logo-white.png"
                alt="Carvaan Logo"
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-xs text-[#171717]">Carvaan</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#fafafa] text-[#666666] border border-[#ebebeb] hidden sm:inline-block">
              Volunteer Force
            </span>
          </Link>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Volunteer Duty Badge Card */}
        <section className="bg-white rounded-2xl border border-[#ebebeb] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#f5f5f5] text-[#171717] border border-[#ebebeb] flex items-center justify-center font-mono text-lg shrink-0">
              {(user?.displayName || "V")[0]?.toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold tracking-tight text-[#171717]">
                  {user?.displayName || "Field Volunteer"}
                </h1>
                <Badge status={volunteerRecord?.status || "pending"} />
              </div>
              <p className="text-xs text-[#666666]">
                On Duty for: <strong className="text-[#171717]">{event.title}</strong>
              </p>
              <div className="flex items-center space-x-3 text-xs text-[#888888] pt-0.5">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                  <span>{event.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#888888]" />
                  <span>{event.startTime} - {event.endTime}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Scanner Action */}
          <div className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              pill
              fullWidth
              className="space-x-2"
              onClick={() => setIsScannerOpen(true)}
            >
              <QrCode className="w-4 h-4 text-[#00dfd8]" />
              <span>Verify Niyaz QR Pass</span>
            </Button>
          </div>
        </section>

        {/* 1. ATTENDANCE SECTION */}
        <section className="bg-white rounded-2xl border border-[#ebebeb] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-[#0070f3]" />
              <h2 className="text-base font-semibold tracking-tight text-[#171717]">Volunteer Daily Attendance</h2>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider
                ${
                  volunteerRecord?.attendance === "present"
                    ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25"
                    : "bg-[#f5f5f5] text-[#888888]"
                }
              `}
            >
              {volunteerRecord?.attendance === "present" ? "PRESENT" : "ABSENT"}
            </span>
          </div>

          <p className="text-xs text-[#666666]">
            Per guidelines, on-ground volunteers mark their presence when reporting to their designated zone or sabeel.
          </p>

          <button
            type="button"
            onClick={handleToggleAttendance}
            disabled={attendanceLoading || !isApproved}
            className={`w-full py-2.5 px-4 rounded-full text-xs font-medium transition-all flex items-center justify-center space-x-2 cursor-pointer
              ${
                !isApproved
                  ? "bg-[#f5f5f5] text-[#888888] cursor-not-allowed border border-[#ebebeb]"
                  : volunteerRecord?.attendance === "present"
                  ? "bg-[#10b981] text-white shadow-xs"
                  : "bg-[#171717] text-white hover:bg-[#2e2e2e]"
              }
            `}
          >
            {attendanceLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            <span>
              {!isApproved
                ? "Attendance Available Once Approved"
                : volunteerRecord?.attendance === "present"
                ? "You Are Marked: PRESENT (Click to Toggle)"
                : "Tap Here to Mark Attendance as PRESENT"}
            </span>
          </button>
        </section>

        {/* 2. SOS INCIDENT VIEWER */}
        <section className="bg-white rounded-2xl border border-[#ebebeb] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#ee0000]">
              <AlertTriangle className="w-4 h-4" />
              <h2 className="text-base font-semibold tracking-tight text-[#171717]">Live SOS Incidents (Volunteer View)</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#ee0000]/10 text-[#ee0000]">
              {sosList.length} Reported
            </span>
          </div>

          <div className="p-3 bg-[#ee0000]/5 rounded-xl border border-[#ee0000]/20 text-xs text-[#ee0000]">
            <strong>Role Directive:</strong> Volunteers monitor incidents to render physical assistance and guide paramedics. Per committee regulations, only the organizing committee has authority to mark incidents resolved.
          </div>

          <div className="space-y-3">
            {sosList.length === 0 ? (
              <p className="text-xs font-mono text-[#888888] text-center py-6">No emergency incidents active on route.</p>
            ) : (
              sosList.map((sos) => (
                <div
                  key={sos.id}
                  className="p-4 rounded-xl border border-[#ebebeb] bg-[#fafafa] hover:border-[#171717]/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-[#171717] text-sm">{sos.description}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider
                          ${sos.status === "pending" ? "bg-[#ee0000]/10 text-[#ee0000]" : "bg-[#10b981]/10 text-[#10b981]"}
                        `}
                      >
                        {sos.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[#888888]">
                      <span className="flex items-center space-x-1 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-[#0070f3]" />
                        <span className="font-medium text-[#171717]">{sos.location}</span>
                      </span>
                      <span>•</span>
                      <span>Reported by: {sos.userName}</span>
                    </div>
                  </div>

                  <a
                    href={`tel:${sos.userPhone}`}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#171717] text-white font-medium text-xs hover:bg-[#2e2e2e] transition-colors shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Reporter</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 3. LOST AND FOUND REPORTING */}
        <section className="bg-white rounded-2xl border border-[#ebebeb] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#171717]">
              <UserSearch className="w-4 h-4 text-[#ff4d4d]" />
              <h2 className="text-base font-semibold tracking-tight">Lost & Found Reporting Center</h2>
            </div>

            <Button
              variant="secondary"
              size="sm"
              pill
              onClick={() => setIsLostFoundModalOpen(true)}
            >
              Report New Case
            </Button>
          </div>

          <p className="text-xs text-[#666666]">
            Report any separated children, elderly persons, or found valuables directly into the central log.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lostFoundList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[#ebebeb] bg-white hover:border-[#171717]/30 transition-all flex items-start space-x-3 text-xs shadow-xs"
              >
                {item.photoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-11 h-11 rounded-lg object-cover border border-[#ebebeb] shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-[#f5f5f5] text-[#171717] border border-[#ebebeb] flex items-center justify-center font-mono text-xs shrink-0">
                    {item.itemType === "person" ? "P" : "I"}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-[#171717]">{item.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider
                        ${item.status === "lost" ? "bg-[#ee0000]/10 text-[#ee0000]" : "bg-[#10b981]/10 text-[#10b981]"}
                      `}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[#666666] line-clamp-2">{item.description}</p>
                  <p className="text-[#888888] font-mono text-[10px]">Location: {item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* MODALS */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        eventId={event.id}
      />

      {user && (
        <LostFoundModal
          isOpen={isLostFoundModalOpen}
          onClose={() => setIsLostFoundModalOpen(false)}
          eventId={event.id}
          user={user}
          userRole="volunteer"
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
