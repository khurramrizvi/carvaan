"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAllEvents,
  fetchEventSOSRequests,
  fetchEventLostAndFound,
} from "@/lib/firebase/event-services";
import { fetchEventNiyazList } from "@/lib/firebase/committee-event-services";
import { JuloosEvent, SOSRequest, LostAndFoundItem, NiyazRegistration } from "@/types/event";
import { EventCard } from "@/components/events/EventCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SOSModal } from "@/components/events/SOSModal";
import { NiyazModal } from "@/components/events/NiyazModal";
import { LostFoundModal } from "@/components/events/LostFoundModal";
import {
  Calendar,
  Building2,
  Shield,
  Loader2,
  Search,
  Radio,
  Clock,
  Compass,
  Sparkles,
  QrCode,
  HeartHandshake,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Users,
  Plus,
  ScanLine,
  UserSearch,
  MapPin,
  ChevronRight,
  Terminal,
  Zap,
} from "lucide-react";

type ActiveTab = "processions" | "volunteers" | "committees" | "niyaz" | "lost_found";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, committeeProfile } = useAuth();

  const [events, setEvents] = useState<JuloosEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("processions");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isNiyazModalOpen, setIsNiyazModalOpen] = useState(false);
  const [isLostFoundModalOpen, setIsLostFoundModalOpen] = useState(false);

  // Sub-data for operational views
  const [sosList, setSosList] = useState<SOSRequest[]>([]);
  const [lostFoundList, setLostFoundList] = useState<LostAndFoundItem[]>([]);
  const [niyazList, setNiyazList] = useState<NiyazRegistration[]>([]);

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam === "live") setStatusFilter("live");
    else if (filterParam === "upcoming") setStatusFilter("upcoming");

    const tabParam = searchParams.get("tab") as ActiveTab;
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      setLoadingEvents(true);
      try {
        const data = await fetchAllEvents();
        setEvents(data);

        if (data.length > 0) {
          const defaultId = data[0].id;
          const [sos, lf, ny] = await Promise.all([
            fetchEventSOSRequests(defaultId).catch(() => []),
            fetchEventLostAndFound(defaultId).catch(() => []),
            fetchEventNiyazList(defaultId).catch(() => []),
          ]);
          setSosList(sos);
          setLostFoundList(lf);
          setNiyazList(ny);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    load();
  }, []);

  const isCommittee = userProfile?.role === "committee";
  const liveEvents = events.filter((e) => e.status === "live");
  const upcomingEvents = events.filter((e) => e.status === "upcoming");

  const filteredEvents = events.filter((ev) => {
    let matchesStatus = true;
    if (statusFilter === "live") matchesStatus = ev.status === "live";
    if (statusFilter === "upcoming") matchesStatus = ev.status === "upcoming";

    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.committeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeEventId = events.length > 0 ? events[0].id : "juloos-ashura-central";

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] flex flex-col font-sans selection:bg-[#171717] selection:text-white">
      {/* Top Sticky Navbar */}
      <Navbar />

      {/* =====================================================================
          CATCHY VERCEL HERO SECTION
          ===================================================================== */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-[#ebebeb] bg-white">
        {/* Subtle Vercel Dot Grid & Atmospheric Glows */}
        <div className="absolute inset-0 vercel-dot-grid opacity-70 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] vercel-glow-blue opacity-80 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/3 -translate-y-1/2 w-[550px] h-[300px] vercel-glow-purple opacity-50 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8">
          {/* Eyebrow Announcement Pill */}
          <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-mono bg-white border border-[#ebebeb] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-[#171717]/40 transition-all cursor-pointer max-w-full">
            <div className="relative w-4 h-4 rounded-full overflow-hidden border border-[#ebebeb] shrink-0">
              <Image
                src="/logo-white.png"
                alt="Carvaan Emblem"
                width={16}
                height={16}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[#171717] font-medium shrink-0">Carvaan Engine 2.0</span>
            <span className="text-[#ebebeb] hidden xs:inline">/</span>
            <span className="text-[#666666] hidden xs:inline truncate">Real-time Civic Telemetry</span>
            <ArrowRight className="w-3 h-3 text-[#666666] shrink-0" />
          </div>

          {/* Catchy Headline with Vercel Gradient */}
          <div className="space-y-4">
            <h1 className="display-hero max-w-4xl mx-auto font-semibold tracking-tighter text-[#171717]">
              Coordinate processions. <br />
              <span className="vercel-gradient-text">In real-time.</span>
            </h1>
            <p className="body-lead max-w-2xl mx-auto text-[#666666]">
              High-performance infrastructure for community Juloos, live route telemetry, volunteer
              force deployment, and instant emergency SOS response.
            </p>
          </div>

          {/* Primary CTA Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("procession-explorer");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#171717] text-white hover:bg-[#2e2e2e] text-sm font-medium transition-all shadow-[0_4px_14px_rgba(0,0,0,0.15)] flex items-center justify-center space-x-2 cursor-pointer group"
            >
              <span>Explore Live Processions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <Link
              href="/committee/events"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-[#171717] border border-[#ebebeb] hover:border-[#171717] hover:bg-[#fafafa] text-sm font-medium transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-[#0070f3]" />
              <span>Committee Workspace</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsSosModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#ee0000] text-white hover:bg-[#c50000] text-sm font-medium transition-all shadow-[0_2px_8px_rgba(238,0,0,0.25)] flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>SOS Emergency</span>
            </button>
          </div>

          {/* Live Telemetry Metric Strip */}
          <div className="pt-8 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#ebebeb]">
              <div className="text-[11px] font-mono text-[#888888] uppercase">Active Routes</div>
              <div className="text-xl font-semibold text-[#171717] mt-0.5 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span>{liveEvents.length > 0 ? `${liveEvents.length} Live` : "4 Ready"}</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#ebebeb]">
              <div className="text-[11px] font-mono text-[#888888] uppercase">Response Time</div>
              <div className="text-xl font-semibold text-[#0070f3] mt-0.5">&lt; 90 Sec</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#ebebeb]">
              <div className="text-[11px] font-mono text-[#888888] uppercase">Volunteers</div>
              <div className="text-xl font-semibold text-[#171717] mt-0.5">850+ Active</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#ebebeb]">
              <div className="text-[11px] font-mono text-[#888888] uppercase">Niyaz Stalls</div>
              <div className="text-xl font-semibold text-[#7928ca] mt-0.5">100% Verified</div>
            </div>
          </div>
        </div>

        {/* Interactive Vercel-Style Live Console Preview */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
          <div className="rounded-xl border border-[#262626] bg-[#111111] text-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] space-y-4">
            {/* Top Console Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-[#262626] pb-3 text-xs gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
                </div>
                <div className="flex items-center space-x-1.5 pl-1.5">
                  <div className="relative w-4 h-4 rounded-sm overflow-hidden bg-white shrink-0">
                    <Image
                      src="/logo-white.png"
                      alt="Carvaan Logo"
                      width={16}
                      height={16}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-mono text-white font-medium text-[11px]">carvaan</span>
                  <span className="text-[#444444]">/</span>
                  <span className="font-mono text-[#888888] text-[11px] truncate max-w-[120px] sm:max-w-none">telemetry-corridor</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span>Sub-second GPS stream</span>
                </span>
              </div>
            </div>

            {/* Simulated Live Route State */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] space-y-1">
                <span className="text-[#888888] font-mono">Current Sector</span>
                <p className="font-semibold text-sm text-white flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00dfd8]" />
                  <span>Civil Lines Crossing (KM 4.2)</span>
                </p>
                <span className="text-[11px] text-[#888888]">Speed: 2.1 km/h • High Density</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] space-y-1">
                <span className="text-[#888888] font-mono">Next Checkpoint</span>
                <p className="font-semibold text-sm text-white flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#f9cb28]" />
                  <span>Hazratganj Sabeel Hub (ETA 16:45)</span>
                </p>
                <span className="text-[11px] text-[#888888]">Medical Ambulance #02 on standby</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#181818] border border-[#2a2a2a] space-y-1">
                <span className="text-[#888888] font-mono">Volunteer Roster</span>
                <p className="font-semibold text-sm text-[#10b981] flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>142 Volunteers On-Duty</span>
                </p>
                <span className="text-[11px] text-[#888888]">Sector lead: Raza Kazmi</span>
              </div>
            </div>

            {/* Live Terminal Ticker */}
            <div className="p-3 rounded-lg bg-[#0d0d0d] border border-[#222222] font-mono text-[11px] text-[#888888] space-y-1 overflow-x-auto">
              <div className="text-white/90 flex items-start space-x-2">
                <span className="text-[#0070f3]">&gt;</span>
                <span className="break-all sm:break-normal">[15:24:02] GPS Node #01 verified corridor perimeter clear</span>
              </div>
              <div className="text-[#888888] flex items-start space-x-2">
                <span className="text-[#10b981]">&gt;</span>
                <span className="break-all sm:break-normal">[15:25:10] Niyaz Token #NY-8902 scanned and validated at Station B</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          EASY-TO-USE INTERACTIVE ROLE SELECTOR BAR
          ===================================================================== */}
      <section className="bg-white border-b border-[#ebebeb] sticky top-16 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-3 gap-2">
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("processions")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "processions"
                    ? "bg-[#171717] text-white shadow-sm"
                    : "text-[#666666] hover:text-[#171717] hover:bg-[#f5f5f5]"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Processions ({events.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("volunteers")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "volunteers"
                    ? "bg-[#171717] text-white shadow-sm"
                    : "text-[#666666] hover:text-[#171717] hover:bg-[#f5f5f5]"
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Volunteer Corps</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("committees")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "committees"
                    ? "bg-[#171717] text-white shadow-sm"
                    : "text-[#666666] hover:text-[#171717] hover:bg-[#f5f5f5]"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Committees</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("niyaz")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "niyaz"
                    ? "bg-[#171717] text-white shadow-sm"
                    : "text-[#666666] hover:text-[#171717] hover:bg-[#f5f5f5]"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Niyaz Passes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("lost_found")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "lost_found"
                    ? "bg-[#171717] text-white shadow-sm"
                    : "text-[#666666] hover:text-[#171717] hover:bg-[#f5f5f5]"
                }`}
              >
                <UserSearch className="w-3.5 h-3.5" />
                <span>Lost & Found</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSosModalOpen(true)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#ee0000]/10 text-[#ee0000] border border-[#ee0000]/20 hover:bg-[#ee0000]/20 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Broadcast SOS</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          MAIN INTERACTIVE CONTENT AREA
          ===================================================================== */}
      <main id="procession-explorer" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        {/* TAB 1: PROCESSIONS EXPLORER */}
        {activeTab === "processions" && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ebebeb]">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#171717]">
                  Community Processions Directory
                </h2>
                <p className="text-sm text-[#666666] mt-1">
                  Track live GPS corridors, scheduled routes, Sabeel stops, and authorized timings.
                </p>
              </div>

              {/* Search & Status Pill Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Status Filter Pills */}
                <div className="inline-flex p-1 rounded-full bg-[#f5f5f5] border border-[#ebebeb] overflow-x-auto max-w-full no-scrollbar shrink-0">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                      statusFilter === "all"
                        ? "bg-white text-[#171717] shadow-sm"
                        : "text-[#666666] hover:text-[#171717]"
                    }`}
                  >
                    All ({events.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("live")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1 whitespace-nowrap shrink-0 ${
                      statusFilter === "live"
                        ? "bg-white text-[#ee0000] shadow-sm font-semibold"
                        : "text-[#666666] hover:text-[#171717]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ee0000] animate-pulse" />
                    <span>Live ({liveEvents.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("upcoming")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                      statusFilter === "upcoming"
                        ? "bg-white text-[#171717] shadow-sm"
                        : "text-[#666666] hover:text-[#171717]"
                    }`}
                  >
                    Scheduled ({upcomingEvents.length})
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by city, landmark..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#ebebeb] rounded-full text-xs text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Event Cards Grid */}
            {loadingEvents ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#0070f3] animate-spin" />
                <p className="text-xs text-[#888888] font-mono">Synchronizing telemetry streams...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#ebebeb] p-16 text-center text-[#888888] space-y-3 shadow-sm">
                <Calendar className="w-12 h-12 text-[#888888]/40 mx-auto" />
                <h3 className="font-semibold text-lg text-[#171717]">No processions found</h3>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">
                  No records match your active search or status criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="text-xs font-medium text-[#0070f3] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VOLUNTEER CORPS */}
        {activeTab === "volunteers" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#ebebeb] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center border border-[#10b981]/20">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#171717]">Volunteer Corps Terminal</h2>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Field coordination, QR pass verification, lost child assistance, and medical triage.
                  </p>
                </div>
              </div>

              <Link
                href={`/events/${activeEventId}/volunteer`}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#171717] hover:bg-[#2e2e2e] text-white transition-all shadow-sm"
              >
                <ScanLine className="w-4 h-4 text-[#00dfd8]" />
                <span>Launch QR Field Scanner</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-white border border-[#ebebeb] space-y-1">
                <span className="text-xs text-[#888888] font-mono uppercase">Readiness</span>
                <p className="text-base font-semibold text-[#10b981] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span>On-Duty & Ready</span>
                </p>
              </div>
              <div className="p-5 rounded-xl bg-white border border-[#ebebeb] space-y-1">
                <span className="text-xs text-[#888888] font-mono uppercase">Distress Signals</span>
                <p className="text-base font-semibold text-[#ee0000]">{sosList.length} Active Alerts</p>
              </div>
              <div className="p-5 rounded-xl bg-white border border-[#ebebeb] space-y-1">
                <span className="text-xs text-[#888888] font-mono uppercase">Assigned Sector</span>
                <p className="text-base font-semibold text-[#171717]">Central Corridor Checkpoint</p>
              </div>
            </div>

            {/* Emergency Alerts Feed */}
            <div className="p-6 rounded-2xl bg-white border border-[#ebebeb] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#171717] flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-[#ee0000]" />
                  <span>Emergency Incident Dispatch Feed</span>
                </h3>
                <span className="text-xs font-mono text-[#888888]">Live Sync</span>
              </div>

              {sosList.length === 0 ? (
                <div className="p-10 text-center text-[#888888] bg-[#fafafa] rounded-xl border border-[#ebebeb]">
                  <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#171717]">All Sectors Clear</p>
                  <p className="text-xs text-[#888888]">No active SOS calls reported in this corridor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sosList.map((sos) => (
                    <div
                      key={sos.id}
                      className="p-4 rounded-xl border border-[#ee0000]/20 bg-[#ee0000]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#ee0000] text-white">
                            SOS ALERT
                          </span>
                          <span className="text-xs font-semibold text-[#171717]">{sos.userName}</span>
                        </div>
                        <p className="text-xs text-[#666666]">{sos.description}</p>
                        <p className="text-xs text-[#888888] flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#ee0000]" />
                          <span>{sos.location}</span>
                        </p>
                      </div>
                      <span className="text-xs font-mono text-[#666666]">{sos.userPhone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COMMITTEES */}
        {activeTab === "committees" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#ebebeb] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#0070f3]/10 text-[#0070f3] flex items-center justify-center border border-[#0070f3]/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#171717]">Committee Operations Console</h2>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Procession publishing, civic permission compliance, volunteer rostering, and Niyaz licensing.
                  </p>
                </div>
              </div>

              <Link
                href="/committee/events"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#171717] hover:bg-[#2e2e2e] text-white transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create / Manage Juloos</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-5 rounded-2xl bg-white border border-[#ebebeb] space-y-4 hover:border-[#171717]/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider bg-[#f5f5f5] text-[#171717] border border-[#ebebeb]">
                        {event.status}
                      </span>
                      <span className="text-xs font-mono text-[#888888]">{event.date}</span>
                    </div>
                    <h4 className="font-semibold text-base text-[#171717]">{event.title}</h4>
                    <p className="text-xs text-[#666666] line-clamp-2">{event.location}</p>
                  </div>

                  <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-between">
                    <Link
                      href={`/committee/events/${event.id}`}
                      className="text-xs font-medium text-[#0070f3] hover:underline flex items-center space-x-1"
                    >
                      <span>Command Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-xs text-[#888888] hover:text-[#171717]"
                    >
                      Public View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NIYAZ PASSES */}
        {activeTab === "niyaz" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#ebebeb] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#7928ca]/10 text-[#7928ca] flex items-center justify-center border border-[#7928ca]/20">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#171717]">Niyaz & Sabeel Distribution Stalls</h2>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Official digital permits with QR verification for community food and beverage camps.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNiyazModalOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#171717] hover:bg-[#2e2e2e] text-white transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Apply for Niyaz Permit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#ebebeb] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 font-medium">
                    VERIFIED PASS #NY-8902
                  </span>
                  <QrCode className="w-4 h-4 text-[#888888]" />
                </div>
                <h4 className="font-semibold text-base text-[#171717]">Sabeel-e-Ali Asghar (A.S)</h4>
                <p className="text-xs text-[#666666]">Chilled Mineral Water & Rose Sherbet Distribution</p>
                <div className="pt-2 text-xs text-[#888888] flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0070f3]" />
                  <span>Civil Lines Junction Checkpoint</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#ebebeb] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 font-medium">
                    VERIFIED PASS #NY-8903
                  </span>
                  <QrCode className="w-4 h-4 text-[#888888]" />
                </div>
                <h4 className="font-semibold text-base text-[#171717]">Langar-e-Hussaini Camp #1</h4>
                <p className="text-xs text-[#666666]">Packaged Haleem & Fresh Naan Distribution</p>
                <div className="pt-2 text-xs text-[#888888] flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0070f3]" />
                  <span>Grand Trunk Road Crossing</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LOST & FOUND */}
        {activeTab === "lost_found" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#ebebeb] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#ff4d4d]/10 text-[#ff4d4d] flex items-center justify-center border border-[#ff4d4d]/20">
                  <UserSearch className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#171717]">Lost & Found Command Center</h2>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Real-time child reunification assistance and lost personal belongings registry.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLostFoundModalOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#171717] hover:bg-[#2e2e2e] text-white transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Report Missing Person / Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {lostFoundList.length === 0 ? (
                <div className="p-10 text-center text-[#888888] bg-white rounded-2xl border border-[#ebebeb]">
                  <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#171717]">No Active Missing Person Inquiries</p>
                  <p className="text-xs text-[#888888]">All reported cases have been successfully resolved.</p>
                </div>
              ) : (
                lostFoundList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white border border-[#ebebeb] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold ${
                          item.itemType === "person" ? "bg-[#ee0000]/10 text-[#ee0000]" : "bg-[#f5f5f5] text-[#171717]"
                        }`}>
                          {item.itemType === "person" ? "MISSING PERSON" : "LOST ITEM"}
                        </span>
                        <span className="text-xs font-semibold text-[#171717]">{item.name}</span>
                      </div>
                      <p className="text-xs text-[#666666]">{item.description}</p>
                      <p className="text-xs text-[#888888]">Last seen near: {item.location}</p>
                    </div>
                    <span className="text-xs font-mono text-[#888888]">
                      Contact: {item.reportedBy?.phone || "Organizing Desk"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* =====================================================================
          CATCHY VERCEL BENTO GRID FEATURE SHOWCASE
          ===================================================================== */}
      <section className="py-20 bg-white border-t border-[#ebebeb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="caption-mono text-[#0070f3]">Engineered for Community Resilience</span>
            <h2 className="display-lg text-[#171717]">
              Built like critical infrastructure.
            </h2>
            <p className="text-base text-[#666666]">
              Every feature in Carvaan is engineered for high-density crowd scenarios where reliable
              communication saves lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#fafafa] border border-[#ebebeb] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#007cf0]/10 text-[#007cf0] flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#171717]">Sub-Second GPS Telemetry</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Live location beacon tracking along certified procession routes with real-time waypoint progression.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#fafafa] border border-[#ebebeb] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#7928ca]/10 text-[#7928ca] flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#171717]">Anti-Fraud Niyaz Passes</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Cryptographically signed QR tokens prevent distribution bottlenecks and certify food safety standards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#fafafa] border border-[#ebebeb] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#171717]">Volunteer Rapid Mobilization</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Roster verification, duty assignment, and integrated field cameras for lost children reunification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#fafafa] border border-[#ebebeb] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#ee0000]/10 text-[#ee0000] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#171717]">Instant Emergency Dispatch</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                One-tap SOS broadcasts patient coordinates instantly to nearest medical volunteers and ambulances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          VERCEL DARK POLARITY-FLIP CTA BAND
          ===================================================================== */}
      <section className="py-20 bg-[#111111] text-white border-t border-[#262626]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono bg-[#1c1c1c] text-[#00dfd8] border border-[#333333]">
            <Zap className="w-3.5 h-3.5" />
            <span>DPDP Act 2023 Compliant Platform</span>
          </div>

          <h2 className="display-lg text-white">
            Ready to coordinate your community Juloos?
          </h2>
          <p className="text-base text-[#888888] max-w-xl mx-auto">
            Get your organizing committee verified or enroll as an on-ground volunteer in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-[#111111] hover:bg-[#f0f0f0] font-medium text-sm transition-all shadow-[0_4px_14px_rgba(255,255,255,0.2)]"
            >
              Register Your Committee
            </Link>
            <Link
              href="/events/juloos-ashura-central/volunteer"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#222222] text-white border border-[#333333] hover:bg-[#2c2c2c] font-medium text-sm transition-all"
            >
              Join Volunteer Force
            </Link>
          </div>
        </div>
      </section>

      {/* Global Modals */}
      {isSosModalOpen && (
        <SOSModal
          isOpen={isSosModalOpen}
          onClose={() => setIsSosModalOpen(false)}
          eventId={activeEventId}
          user={user || { uid: "citizen-guest", displayName: "Concerned Citizen", email: null }}
          onSuccess={() => {
            alert("Emergency SOS broadcasted successfully to on-ground volunteers!");
          }}
        />
      )}

      {isNiyazModalOpen && (
        <NiyazModal
          isOpen={isNiyazModalOpen}
          onClose={() => setIsNiyazModalOpen(false)}
          eventId={activeEventId}
          user={user || { uid: "citizen-guest", displayName: "Citizen", email: null }}
          onSuccess={() => {
            alert("Niyaz permit application submitted for committee review!");
          }}
        />
      )}

      {isLostFoundModalOpen && (
        <LostFoundModal
          isOpen={isLostFoundModalOpen}
          onClose={() => setIsLostFoundModalOpen(false)}
          eventId={activeEventId}
          user={user || { uid: "citizen-guest", displayName: "Citizen", email: null }}
          userRole={isCommittee ? "committee" : "volunteer"}
          onSuccess={() => {
            alert("Report filed and broadcasted to on-ground volunteer monitors!");
          }}
        />
      )}

      {/* Vercel Styled Footer */}
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-[#171717]">
          <Loader2 className="w-8 h-8 text-[#0070f3] animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
