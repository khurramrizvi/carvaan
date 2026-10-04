"use client";

import React, { useState } from "react";
import Image from "next/image";
import { reportEventSOS } from "@/lib/firebase/event-services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  user: { uid: string; displayName?: string | null; email?: string | null };
  onSuccess: () => void;
}

export function SOSModal({ isOpen, onClose, eventId, user, onSuccess }: SOSModalProps) {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [userName, setUserName] = useState(user.displayName || "Concerned Citizen");
  const [userPhone, setUserPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !location) return;

    setLoading(true);
    try {
      await reportEventSOS({
        eventId,
        userId: user.uid,
        userName,
        userPhone: userPhone || "Not provided",
        description,
        location,
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error("Error submitting SOS:", err);
      alert("Failed to send SOS alert. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#ebebeb] relative space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-1 rounded-full text-[#888888] hover:text-[#171717] hover:bg-[#f5f5f5]"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mx-auto border border-[#10b981]/25">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-[#171717]">Emergency Alert Dispatched!</h3>
            <p className="text-xs text-[#666666] max-w-xs mx-auto leading-relaxed">
              Your SOS notice has been transmitted immediately to the event organizing committee and nearby volunteers.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#ee0000]/30 bg-white flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/logo-white.png"
                  alt="Carvaan SOS"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#ee0000]">Carvaan Emergency SOS</h3>
                <p className="text-xs text-[#666666]">Instant dispatch to committee & on-duty volunteers</p>
              </div>
            </div>

            <div className="bg-[#ee0000]/5 border border-[#ee0000]/20 rounded-xl p-3 flex items-start space-x-2 text-xs text-[#ee0000]">
              <ShieldAlert className="w-4 h-4 text-[#ee0000] mt-0.5 shrink-0" />
              <span>
                Use this only for genuine emergencies (medical accidents, stampede risk, fire, or acute distress).
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <Input
                label="Exact Incident Location *"
                type="text"
                placeholder="e.g. Near Sabeel #2 / Opposite Civil Lines gate"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                helperText="Be as specific as possible with landmarks"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#4d4d4d]">
                  Incident Description & Nature of Emergency *
                </label>
                <textarea
                  rows={3}
                  className="w-full p-3 bg-white text-[#171717] placeholder-[#888888] text-xs rounded-lg border border-[#ebebeb] focus:border-[#ee0000] focus:ring-2 focus:ring-[#ee0000]/20 outline-none"
                  placeholder="Describe what occurred, number of individuals affected, whether an ambulance is needed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Reporter Name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
                <Input
                  label="Your Contact Phone *"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="danger"
                  size="md"
                  pill
                  fullWidth
                  isLoading={loading}
                >
                  DISPATCH SOS ALERT NOW
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
