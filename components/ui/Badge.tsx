import React from "react";
import { AccountStatus } from "@/types/auth";

interface BadgeProps {
  status: AccountStatus | "committee" | "user" | "admin";
  className?: string;
}

export function Badge({ status, className = "" }: BadgeProps) {
  // Vercel Design System Status Badges
  const styles: Record<string, string> = {
    // Approved / Active -> Vercel Success Green / Blue
    approved: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/25",
    active: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/25",
    // Pending -> Vercel Amber Warning
    pending: "bg-[#f5a623]/10 text-[#ab570a] border-[#f5a623]/30",
    // Rejected / Error -> Vercel Red Error
    rejected: "bg-[#ee0000]/10 text-[#ee0000] border-[#ee0000]/25",
    // Committee -> Vercel Electric Blue
    committee: "bg-[#0070f3]/10 text-[#0070f3] border-[#0070f3]/25",
    // User / Citizen -> Minimal Gray
    user: "bg-[#f5f5f5] text-[#666666] border-[#ebebeb]",
    // Admin -> Vercel Violet
    admin: "bg-[#7928ca]/10 text-[#7928ca] border-[#7928ca]/25",
  };

  const labels: Record<string, string> = {
    approved: "Approved",
    active: "Active",
    pending: "Pending Review",
    rejected: "Declined",
    committee: "Committee",
    user: "Citizen",
    admin: "Super Admin",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
        styles[status] || "bg-[#f5f5f5] text-[#666666] border-[#ebebeb]"
      } ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {labels[status] || status}
    </span>
  );
}
