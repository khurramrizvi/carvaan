import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-white text-[#666666] border-t border-[#ebebeb] mt-auto pt-10 pb-24 md:pb-10 px-6 sm:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm">
        {/* Brand & Mission */}
        <div className="flex items-center space-x-3">
          <div className="relative w-7 h-7 rounded-md overflow-hidden border border-[#ebebeb] bg-white flex items-center justify-center shadow-xs shrink-0">
            <Image
              src="/logo-white.png"
              alt="Carvaan Logo"
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-[#171717]">Carvaan</span>
          <span className="text-[#ebebeb]">/</span>
          <span className="text-xs text-[#888888]">Civic Processions & Live Crowd Safety</span>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#666666]">
          <Link href="/" className="hover:text-[#171717] transition-colors">
            Processions
          </Link>
          <Link href="/committee/events" className="hover:text-[#171717] transition-colors">
            Committee Hub
          </Link>
          <Link href="/events/juloos-ashura-central/volunteer" className="hover:text-[#171717] transition-colors">
            Volunteer Force
          </Link>
          <Link href="/admin/login" className="hover:text-[#171717] transition-colors">
            Admin Console
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-[#888888] font-mono">
          © {new Date().getFullYear()} Carvaan. Real-Time Telemetry.
        </div>
      </div>
    </footer>
  );
}
