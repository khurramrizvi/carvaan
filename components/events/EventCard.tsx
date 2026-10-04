import React from "react";
import Link from "next/link";
import { JuloosEvent } from "@/types/event";
import { Calendar, Clock, MapPin, Radio, ArrowRight, ShieldCheck, Users, QrCode } from "lucide-react";

interface EventCardProps {
  event: JuloosEvent;
}

export function EventCard({ event }: EventCardProps) {
  const isLive = event.status === "live";

  return (
    <div className="bg-white rounded-xl border border-[#ebebeb] overflow-hidden hover:border-[#171717]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between group">
      {/* Cover / Media Banner */}
      <div className="relative h-44 bg-[#f5f5f5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.coverImage || "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          {isLive ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-black/70 text-white border border-white/20 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ee0000] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ee0000]"></span>
              </span>
              <span>LIVE GPS</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-white/90 text-[#171717] border border-[#ebebeb] backdrop-blur-xs">
              {event.status === "upcoming" ? "Scheduled" : "Completed"}
            </span>
          )}
        </div>

        {/* Organizing Committee Bar */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center space-x-2 text-white text-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.committeeLogo}
            alt={event.committeeName}
            className="w-5 h-5 rounded-full object-cover border border-white/60 bg-white"
          />
          <div className="flex items-center space-x-1 truncate">
            <span className="font-medium text-xs truncate">{event.committeeName}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#00dfd8] shrink-0" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <h3 className="text-base font-semibold text-[#171717] group-hover:text-[#0070f3] transition-colors leading-snug line-clamp-2">
            {event.title}
          </h3>

          <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Time & Location details */}
          <div className="pt-1 space-y-1.5 text-xs text-[#888888]">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[#666666]">
              <span className="flex items-center space-x-1 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                <span>{event.date}</span>
              </span>
              <span className="text-[#ebebeb]">•</span>
              <span className="flex items-center space-x-1 shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                <span>{event.startTime} - {event.endTime}</span>
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#0070f3] shrink-0 mt-0.5" />
              <span className="line-clamp-1 font-medium text-[#171717]">{event.location}</span>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="pt-1 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#f5f5f5] text-[#666666] border border-[#ebebeb]">
              <QrCode className="w-3 h-3 text-[#0070f3]" />
              <span>Niyaz Token</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#f5f5f5] text-[#666666] border border-[#ebebeb]">
              <Users className="w-3 h-3 text-[#10b981]" />
              <span>Volunteer Force</span>
            </span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-[#888888] truncate">
            {event.announcements?.length || 0} alerts active
          </span>

          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-[#171717] hover:bg-[#2e2e2e] text-white transition-all text-xs font-medium shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
