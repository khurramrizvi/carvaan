"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UserProfile } from "@/types/auth";
import { registerVolunteerForEvent } from "@/lib/firebase/event-services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, HeartHandshake, CheckCircle2, ShieldCheck } from "lucide-react";

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  user: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null } | null;
  userProfile?: UserProfile | null;
  onSuccess: () => void;
}

const ROLES = [
  "Crowd Safety & Route Guide",
  "Sabeel & Water Distribution",
  "Medical & First Aid Escort",
  "General Assistance & Security",
];

export function VolunteerModal({
  isOpen,
  onClose,
  eventId,
  user,
  onSuccess,
}: VolunteerModalProps) {
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [rolePreference, setRolePreference] = useState(ROLES[0]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sync state if user prop changes
  React.useEffect(() => {
    if (user) {
      if (user.displayName && !fullName) setFullName(user.displayName);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    try {
      const activeUid = user?.uid || (typeof window !== "undefined" ? (localStorage.getItem("carvaan_guest_uid") || (() => {
        const gid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        localStorage.setItem("carvaan_guest_uid", gid);
        return gid;
      })()) : `guest_${Date.now()}`);

      const candidateUser = {
        uid: activeUid,
        displayName: fullName.trim() || user?.displayName || "Community Volunteer",
        email: email.trim() || user?.email || "",
        photoURL: user?.photoURL || null,
      };

      await registerVolunteerForEvent(eventId, candidateUser, phone.trim(), rolePreference);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSubmitted(false);
      }, 1500);
    } catch (err) {
      console.error("Error registering as volunteer:", err);
      alert("Failed to submit volunteer application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 border border-[#ebebeb] shadow-[0_16px_50px_rgba(0,0,0,0.12)] relative space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#888888] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mx-auto border border-[#10b981]/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-[#171717]">Application Received!</h3>
            <p className="text-xs text-[#666666] max-w-xs mx-auto leading-relaxed">
              Your registration as a volunteer has been forwarded to the organizing committee for approval.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#ebebeb] bg-white flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/logo-white.png"
                  alt="Carvaan Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-[#171717]">Register as Volunteer</h3>
                <p className="text-xs text-[#666666]">Serve in crowd safety, sabeel & assistance</p>
              </div>
            </div>

            <div className="bg-[#fafafa] rounded-xl p-3.5 border border-[#ebebeb] space-y-2 text-xs text-[#666666]">
              <div className="flex items-center space-x-2 font-medium text-[#171717]">
                <ShieldCheck className="w-4 h-4 text-[#0070f3]" />
                <span>Volunteer Privileges & Responsibilities</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-[#666666]">
                <li>Verify Niyaz permits using the Carvaan QR scanner</li>
                <li>Monitor live SOS emergency alerts along the route</li>
                <li>Report missing persons or found items instantly</li>
                <li>Check in daily attendance with a single tap</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Full Name *"
                type="text"
                placeholder="e.g. Syed Ali Haider"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Email Address *"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Contact Phone Number *"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                helperText="Required by committee organizers for on-ground team coordination"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171717]">
                  Preferred Role / Service
                </label>
                <select
                  value={rolePreference}
                  onChange={(e) => setRolePreference(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-[#ebebeb] rounded-xl text-[#171717] focus:outline-none focus:border-[#171717] transition-colors"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={loading}
                >
                  Submit Volunteer Application
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
