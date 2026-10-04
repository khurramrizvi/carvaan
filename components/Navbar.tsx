"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  LogOut,
  Building2,
  Shield,
  ArrowRight,
} from "lucide-react";

export function Navbar() {
  const { user, userProfile, committeeProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isCommittee = userProfile?.role === "committee";
  const isAdmin = userProfile?.role === "admin";

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#ebebeb] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Carvaan Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#ebebeb] bg-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 shrink-0">
              <Image
                src="/logo-white.png"
                alt="Carvaan Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="font-semibold text-base tracking-tight text-[#171717]">
              Carvaan
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider bg-[#fafafa] text-[#666666] rounded-full border border-[#ebebeb]">
              Operations
            </span>
          </Link>

          {/* Centered Desktop Nav Links (Vercel Style) */}
          {isAdmin && (
            <nav className="hidden md:flex items-center space-x-1 text-sm font-medium text-[#666666]">
              <Link
                href="/admin/dashboard"
                className="px-3.5 py-1.5 rounded-full hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
              >
                Admin
              </Link>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* User Session or Login */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden border border-[#ebebeb] bg-[#171717] text-white flex items-center justify-center text-xs font-semibold hover:border-[#171717] transition-all cursor-pointer"
                >
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
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#ebebeb] rounded-xl p-2 space-y-1 text-xs shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50">
                    <div className="px-2 py-1.5 border-b border-[#ebebeb] pb-2">
                      <p className="font-semibold text-[#171717] truncate">
                        {committeeProfile?.name || user.displayName || user.email}
                      </p>
                      <p className="text-[11px] text-[#888888] font-mono truncate">{user.email}</p>
                    </div>

                    <div className="space-y-0.5 pt-1">
                      {isCommittee && (
                        <Link
                          href="/committee/events"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[#171717] hover:bg-[#f5f5f5]"
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#0070f3]" />
                          <span>Committee Hub</span>
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[#171717] hover:bg-[#f5f5f5]"
                        >
                          <Shield className="w-3.5 h-3.5 text-[#0070f3]" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[#ee0000] hover:bg-[#ee0000]/10 font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link
                  href="/login"
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-medium text-[#666666] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#171717] hover:bg-[#2e2e2e] text-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)] items-center space-x-1"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-[#666666] hover:text-[#171717] rounded-md hover:bg-[#f5f5f5]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#ebebeb] px-4 py-3 space-y-2 text-sm animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2 px-3 py-1 mb-2 border-b border-[#ebebeb] pb-2.5">
              <div className="relative w-6 h-6 rounded-md overflow-hidden border border-[#ebebeb] bg-white shrink-0">
                <Image
                  src="/logo-white.png"
                  alt="Carvaan"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-sm text-[#171717]">Carvaan</span>
              <span className="text-[10px] font-mono text-[#888888] uppercase bg-[#fafafa] px-2 py-0.5 rounded-full border border-[#ebebeb]">Civic Ops</span>
            </div>



            {isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-[#171717] hover:bg-[#f5f5f5]"
              >
                <Shield className="w-4 h-4 text-[#0070f3]" />
                <span>Admin Portal</span>
              </Link>
            )}

            {user ? (
              <div className="pt-2 border-t border-[#ebebeb]">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-[#ee0000] hover:bg-[#ee0000]/10 font-medium text-xs rounded-lg"
                >
                  Sign Out ({user.email})
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#ebebeb] flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-full border border-[#ebebeb] bg-white text-[#171717] font-medium text-xs hover:bg-[#f5f5f5]"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-full bg-[#171717] text-white font-medium text-xs hover:bg-[#2e2e2e]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
