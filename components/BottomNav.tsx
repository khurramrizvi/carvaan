"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SOSModal } from "@/components/events/SOSModal";
import {
  Compass,
  Building2,
  AlertTriangle,
  HeartHandshake,
  User,
  Shield,
  LogOut,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const { user, userProfile, committeeProfile, logout } = useAuth();
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  // Hide on dedicated authentication and status screens
  const authRoutes = ["/login", "/register", "/admin/login", "/auth/status"];
  if (authRoutes.includes(pathname)) {
    return null;
  }

  const isCommittee = userProfile?.role === "committee";
  const isAdmin = userProfile?.role === "admin";

  // Active check helpers
  const isProcessionsActive =
    pathname === "/" || (pathname.startsWith("/events/") && !pathname.includes("/volunteer"));
  const isCommitteesActive = pathname.startsWith("/committee");
  const isVolunteersActive = pathname.includes("/volunteer");
  const isAccountActive =
    pathname.startsWith("/admin") || isAccountDrawerOpen;

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#ebebeb] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] transition-all"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-end justify-items-center">
          {/* TAB 1: Processions / Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-full py-1 text-center transition-colors group ${
              isProcessionsActive
                ? "text-[#171717]"
                : "text-[#888888] hover:text-[#171717]"
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isProcessionsActive
                  ? "bg-[#171717]/5 text-[#0070f3]"
                  : "group-hover:bg-[#f5f5f5]"
              }`}
            >
              <Compass className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                isProcessionsActive ? "font-semibold text-[#171717]" : "font-normal"
              }`}
            >
              Processions
            </span>
          </Link>

          {/* TAB 2: Committees */}
          <Link
            href="/committee/events"
            className={`flex flex-col items-center justify-center w-full py-1 text-center transition-colors group ${
              isCommitteesActive
                ? "text-[#171717]"
                : "text-[#888888] hover:text-[#171717]"
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isCommitteesActive
                  ? "bg-[#171717]/5 text-[#0070f3]"
                  : "group-hover:bg-[#f5f5f5]"
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                isCommitteesActive ? "font-semibold text-[#171717]" : "font-normal"
              }`}
            >
              Committees
            </span>
          </Link>

          {/* TAB 3: Elevated Center SOS Trigger */}
          <div className="flex flex-col items-center justify-center w-full relative">
            <button
              type="button"
              onClick={() => setIsSosOpen(true)}
              aria-label="Trigger Emergency SOS Alert"
              className="relative -top-4 w-12 h-12 rounded-full bg-[#ee0000] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(238,0,0,0.38)] border-[3px] border-white active:scale-95 transition-transform hover:bg-[#c50000] cursor-pointer"
            >
              <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
            </button>
            <span className="text-[10px] -mt-3 font-semibold text-[#ee0000] tracking-tight">
              SOS
            </span>
          </div>

          {/* TAB 4: Volunteer Corps */}
          <Link
            href="/events/juloos-ashura-central/volunteer"
            className={`flex flex-col items-center justify-center w-full py-1 text-center transition-colors group ${
              isVolunteersActive
                ? "text-[#171717]"
                : "text-[#888888] hover:text-[#171717]"
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isVolunteersActive
                  ? "bg-[#171717]/5 text-[#10b981]"
                  : "group-hover:bg-[#f5f5f5]"
              }`}
            >
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                isVolunteersActive ? "font-semibold text-[#171717]" : "font-normal"
              }`}
            >
              Volunteers
            </span>
          </Link>

          {/* TAB 5: Account / Profile */}
          {user ? (
            <button
              type="button"
              onClick={() => setIsAccountDrawerOpen(true)}
              className={`flex flex-col items-center justify-center w-full py-1 text-center transition-colors group cursor-pointer ${
                isAccountActive
                  ? "text-[#171717]"
                  : "text-[#888888] hover:text-[#171717]"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full overflow-hidden border transition-all flex items-center justify-center text-[10px] font-bold ${
                  isAccountActive
                    ? "border-[#0070f3] ring-2 ring-[#0070f3]/20"
                    : "border-[#ebebeb] group-hover:border-[#171717]"
                }`}
              >
                {user.photoURL || committeeProfile?.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={committeeProfile?.logoUrl || user.photoURL || ""}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="bg-[#171717] text-white w-full h-full flex items-center justify-center">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isAccountActive ? "font-semibold text-[#171717]" : "font-normal"
                }`}
              >
                Account
              </span>
            </button>
          ) : (
            <Link
              href="/login"
              className={`flex flex-col items-center justify-center w-full py-1 text-center transition-colors group ${
                pathname === "/login"
                  ? "text-[#171717]"
                  : "text-[#888888] hover:text-[#171717]"
              }`}
            >
              <div className="p-1 rounded-xl group-hover:bg-[#f5f5f5] transition-all">
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-normal">
                Log In
              </span>
            </Link>
          )}
        </div>
      </nav>

      {/* QUICK MOBILE ACCOUNT DRAWER / SHEET */}
      {isAccountDrawerOpen && user && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsAccountDrawerOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl border-t border-[#ebebeb] p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] space-y-4 max-h-[80vh] overflow-y-auto z-10 animate-in slide-in-from-bottom-4">
            <div className="w-12 h-1 bg-[#ebebeb] rounded-full mx-auto" />

            <div className="flex items-center justify-between border-b border-[#ebebeb] pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ebebeb] bg-[#171717] text-white flex items-center justify-center font-semibold text-sm">
                  {user.photoURL || committeeProfile?.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={committeeProfile?.logoUrl || user.photoURL || ""}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user.displayName || user.email || "U")[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#171717] truncate max-w-[200px]">
                    {committeeProfile?.name || user.displayName || user.email}
                  </h4>
                  <p className="text-xs text-[#888888] font-mono truncate max-w-[200px]">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountDrawerOpen(false)}
                className="p-1.5 rounded-full text-[#888888] hover:text-[#171717] hover:bg-[#f5f5f5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-1">
              {isCommittee && (
                <Link
                  href="/committee/events"
                  onClick={() => setIsAccountDrawerOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f5f5f5] text-sm text-[#171717] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-4 h-4 text-[#0070f3]" />
                    <span>Committee Events Console</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#888888]" />
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsAccountDrawerOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f5f5f5] text-sm text-[#171717] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-[#0070f3]" />
                    <span>Superadmin Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#888888]" />
                </Link>
              )}

              <Link
                href="/events/juloos-ashura-central/volunteer"
                onClick={() => setIsAccountDrawerOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f5f5f5] text-sm text-[#171717] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <HeartHandshake className="w-4 h-4 text-[#10b981]" />
                  <span>My Volunteer Registrations</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#888888]" />
              </Link>
            </div>

            {/* Logout Action */}
            <div className="pt-2 border-t border-[#ebebeb]">
              <button
                type="button"
                onClick={() => {
                  setIsAccountDrawerOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#ee0000]/10 hover:bg-[#ee0000]/15 text-[#ee0000] text-sm font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Carvaan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL EMERGENCY SOS MODAL FROM BOTTOM NAV */}
      {isSosOpen && (
        <SOSModal
          isOpen={isSosOpen}
          onClose={() => setIsSosOpen(false)}
          eventId="juloos-ashura-central"
          user={user || { uid: "guest", displayName: "Concerned Citizen", email: null }}
          onSuccess={() => {
            alert("Emergency SOS broadcasted successfully to on-ground volunteers!");
          }}
        />
      )}
    </>
  );
}
