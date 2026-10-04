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
  user: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null };
  userProfile?: UserProfile | null;
  onSuccess: () => void;
}

export function VolunteerModal({
  isOpen,
  onClose,
  eventId,
  user,
  onSuccess,
}: VolunteerModalProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    try {
      await registerVolunteerForEvent(eventId, user, phone);
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
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#888888] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mx-auto border border-[#10b981]/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-[#171717]">Application Received</h3>
            <p className="text-xs text-[#666666] max-w-xs mx-auto">
              Your registration as a volunteer has been forwarded to the organizing committee.
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
                <li>Monitor live SOS emergency alerts in your zone</li>
                <li>Report missing persons or found items instantly</li>
                <li>Check in daily attendance with a single tap</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Full Name"
                type="text"
                value={user.displayName || "Community Volunteer"}
                disabled
              />

              <Input
                label="Registered Email"
                type="email"
                value={user.email || ""}
                disabled
              />

              <Input
                label="Contact Phone Number *"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                helperText="Required by organizers for on-ground coordination"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={loading}
                >
                  Submit Volunteer Request
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
