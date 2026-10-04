"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import {
  Compass,
  Radio,
  Calendar,
  Building2,
  Users,
  QrCode,
  HeartHandshake,
  AlertTriangle,
  Shield,
  PlusCircle,
  CheckCircle2,
  UserSearch,
  ScanLine,
  Activity,
  Layers,
} from "lucide-react";

export type DashboardView =
  | "all_events"
  | "live_events"
  | "upcoming_events"
  | "niyaz_stalls"
  | "lost_found"
  | "volunteer_hub"
  | "committee_hub";

interface SidebarProps {
  currentView: DashboardView;
  onSelectView: (view: DashboardView) => void;
  liveCount: number;
  totalEventsCount: number;
  upcomingCount: number;
  onOpenCreateEvent?: () => void;
  onTriggerSOS?: () => void;
  className?: string;
  onCloseMobile?: () => void;
}

export function DashboardSidebar({
  currentView,
  onSelectView,
  liveCount,
  totalEventsCount,
  upcomingCount,
  onOpenCreateEvent,
  onTriggerSOS,
  className = "",
  onCloseMobile,
}: SidebarProps) {
  const { user, userProfile, committeeProfile } = useAuth();

  const isCommittee = userProfile?.role === "committee";
  const isAdmin = userProfile?.role === "admin";

  const handleItemClick = (view: DashboardView) => {
    onSelectView(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`w-64 lg:w-72 bg-[#fafaf7] border-r border-[#e6e5e0] flex flex-col shrink-0 overflow-y-auto select-none font-sans text-[#26251e] ${className}`}
    >
      {/* Workspace Switcher / Identity */}
      <div className="p-3 border-b border-[#e6e5e0] bg-[#fafaf7]">
        <div className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-[rgba(38,37,30,0.05)] transition-colors cursor-pointer">
          {user?.photoURL || committeeProfile?.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={committeeProfile?.logoUrl || user?.photoURL || ""}
              alt="Avatar"
              className="w-8 h-8 rounded-lg object-cover border border-[#e6e5e0]"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#26251e] text-[#f7f7f4] flex items-center justify-center font-bold text-xs">
              {(user?.displayName || user?.email || "U")[0].toUpperCase()}
            </div>
          )}

          <div className="flex flex-col truncate flex-1 min-w-0">
            <span className="text-xs font-medium text-[#26251e] truncate">
              {committeeProfile?.name || user?.displayName || user?.email?.split("@")[0]}
            </span>
            <div className="mt-1">
              <Badge status={userProfile?.role || "user"} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 p-2 space-y-5">
        {/* SECTION 1: CITIZEN / USERS */}
        <div className="space-y-0.5">
          <div className="px-2.5 py-1 flex items-center justify-between text-[11px] font-mono font-medium text-[#807d72] tracking-[0.08em] uppercase">
            <span>Citizen & Community</span>
            <Users className="w-3.5 h-3.5 text-[#807d72]" />
          </div>

          <button
            type="button"
            onClick={() => handleItemClick("all_events")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
              currentView === "all_events"
                ? "bg-white border border-[#e6e5e0] font-medium text-[#26251e]"
                : "border border-transparent font-normal text-[#5a5852] hover:bg-[rgba(38,37,30,0.05)] hover:text-[#26251e]"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Compass className={`w-4 h-4 ${currentView === "all_events" ? "text-[#f54e00]" : "text-[#807d72]"}`} />
              <span>All Processions</span>
            </div>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded text-[#5a5852] bg-[#e6e5e0]/60">
              {totalEventsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick("live_events")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
              currentView === "live_events"
                ? "bg-[#cf2d56]/10 border border-[#cf2d56]/20 font-medium text-[#cf2d56]"
                : "border border-transparent font-normal text-[#5a5852] hover:bg-[rgba(38,37,30,0.05)] hover:text-[#26251e]"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Radio className={`w-4 h-4 ${currentView === "live_events" ? "text-[#cf2d56]" : "text-[#cf2d56] animate-pulse"}`} />
              <span>Live GPS Tracking</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded text-[#cf2d56] bg-[#cf2d56]/15 font-medium">
              {liveCount} Active
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick("upcoming_events")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
              currentView === "upcoming_events"
                ? "bg-white border border-[#e6e5e0] font-medium text-[#26251e]"
                : "border border-transparent font-normal text-[#5a5852] hover:bg-[rgba(38,37,30,0.05)] hover:text-[#26251e]"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Calendar className={`w-4 h-4 ${currentView === "upcoming_events" ? "text-[#f54e00]" : "text-[#807d72]"}`} />
              <span>Upcoming Schedule</span>
            </div>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded text-[#5a5852] bg-[#e6e5e0]/60">
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick("niyaz_stalls")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
              currentView === "niyaz_stalls"
                ? "bg-[#9fbbe0]/20 border border-[#9fbbe0]/40 font-medium text-[#234b7a]"
                : "border border-transparent font-normal text-[#5a5852] hover:bg-[rgba(38,37,30,0.05)] hover:text-[#26251e]"
            }`}
          >
            <div className="flex items-center space-x-2">
              <QrCode className={`w-4 h-4 ${currentView === "niyaz_stalls" ? "text-[#234b7a]" : "text-[#807d72]"}`} />
              <span>Niyaz Stalls & Passes</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#9fbbe0]/30 text-[#234b7a]">
              Permits
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick("lost_found")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
              currentView === "lost_found"
                ? "bg-[#dfa88f]/20 border border-[#dfa88f]/40 font-medium text-[#854326]"
                : "border border-transparent font-normal text-[#5a5852] hover:bg-[rgba(38,37,30,0.05)] hover:text-[#26251e]"
            }`}
          >
            <div className="flex items-center space-x-2">
              <UserSearch className={`w-4 h-4 ${currentView === "lost_found" ? "text-[#854326]" : "text-[#807d72]"}`} />
              <span>Lost & Found Center</span>
            </div>
          </button>
        </div>

        {/* SECTION 2: VOLUNTEERS */}
        <div className="space-y-0.5 pt-2 border-t border-[#e6e5e0]">
          <div className="px-2.5 py-1 flex items-center justify-between text-[11px] font-mono font-medium text-[#807d72] tracking-[0.08em] uppercase">
            <span>Volunteer Force</span>
            <HeartHandshake className="w-3.5 h-3.5 text-[#1f8a65]" />
          </div>

          <button
            type="button"
            onClick={() => handleItemClick("volunteer_hub")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
              currentView === "volunteer_hub"
                ? "bg-[#9fc9a2]/20 border border-[#9fc9a2]/40 font-medium text-[#1f8a65]"
                : "border border-transparent font-normal text-[#5a5852] hover:bg-[rgba(38,37,30,0.05)] hover:text-[#26251e]"
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className={`w-4 h-4 ${currentView === "volunteer_hub" ? "text-[#1f8a65]" : "text-[#807d72]"}`} />
              <span>Volunteer Command Hub</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#9fc9a2]/30 text-[#1f8a65]">
              Ready
            </span>
          </button>

          <Link
            href="/events/juloos-ashura-central/volunteer"
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] text-[#5a5852] hover:text-[#26251e] hover:bg-[rgba(38,37,30,0.05)] transition-colors border border-transparent"
          >
            <div className="flex items-center space-x-2">
              <ScanLine className="w-4 h-4 text-[#807d72]" />
              <span>Field QR Pass Scanner</span>
            </div>
            <span className="text-[10px] font-mono text-[#807d72]">Scan</span>
          </Link>
        </div>

        {/* SECTION 3: ORGANIZING COMMITTEE */}
        <div className="space-y-0.5 pt-2 border-t border-[#e6e5e0]">
          <div className="px-2.5 py-1 flex items-center justify-between text-[11px] font-mono font-medium text-[#807d72] tracking-[0.08em] uppercase">
            <span>Organizing Committee</span>
            <Building2 className="w-3.5 h-3.5 text-[#f54e00]" />
          </div>

          <button
            type="button"
            onClick={() => handleItemClick("committee_hub")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
              currentView === "committee_hub"
                ? "bg-[#c0a8dd]/20 border border-[#c0a8dd]/40 font-medium text-[#4c336e]"
                : "border border-transparent font-normal text-[#5a5852] hover:bg-[rgba(38,37,30,0.05)] hover:text-[#26251e]"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Building2 className={`w-4 h-4 ${currentView === "committee_hub" ? "text-[#4c336e]" : "text-[#807d72]"}`} />
              <span>Committee Workspace</span>
            </div>
            {isCommittee && (
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#c0a8dd]/30 text-[#4c336e]">
                Active
              </span>
            )}
          </button>

          {isCommittee && onOpenCreateEvent && (
            <button
              type="button"
              onClick={onOpenCreateEvent}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-[#f54e00] hover:bg-[#f54e00]/10 transition-colors cursor-pointer border border-transparent"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create New Procession</span>
            </button>
          )}

          <Link
            href="/committee/events"
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] text-[#5a5852] hover:text-[#26251e] hover:bg-[rgba(38,37,30,0.05)] transition-colors border border-transparent"
          >
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#807d72]" />
              <span>Dedicated Events Portal</span>
            </div>
          </Link>
        </div>

        {/* SECTION 4: ADMINISTRATION (If Admin) */}
        {isAdmin && (
          <div className="space-y-0.5 pt-2 border-t border-[#e6e5e0]">
            <div className="px-2.5 py-1 flex items-center justify-between text-[11px] font-mono font-medium text-[#807d72] tracking-[0.08em] uppercase">
              <span>Super Admin</span>
              <Shield className="w-3.5 h-3.5 text-[#f54e00]" />
            </div>

            <Link
              href="/admin/dashboard"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-[#26251e] hover:bg-[rgba(38,37,30,0.05)] transition-colors border border-transparent"
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-[#f54e00]" />
                <span>Verification Console</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Sidebar Bottom Actions */}
      <div className="p-3 border-t border-[#e6e5e0] bg-[#fafaf7] space-y-2 mt-auto">
        {onTriggerSOS && (
          <button
            type="button"
            onClick={onTriggerSOS}
            className="w-full py-2 px-3 rounded-lg bg-[#cf2d56]/10 border border-[#cf2d56]/20 hover:bg-[#cf2d56]/15 text-[#cf2d56] text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-[#cf2d56]" />
            <span>Emergency SOS Trigger</span>
          </button>
        )}

        <div className="px-1 py-0.5 flex items-center justify-between text-[11px] text-[#807d72]">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1f8a65]" />
            <span>Civic Telemetry Active</span>
          </span>
          <span className="font-mono text-[10px]">v1.2</span>
        </div>
      </div>
    </aside>
  );
}
