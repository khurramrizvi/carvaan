"use client";

import React, { useState } from "react";
import Image from "next/image";
import { registerNiyazForEvent } from "@/lib/firebase/event-services";
import { DistributorType } from "@/types/event";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, UtensilsCrossed, CheckCircle2, QrCode } from "lucide-react";

interface NiyazModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  user: { uid: string; displayName?: string | null; email?: string | null };
  onSuccess: () => void;
}

export function NiyazModal({ isOpen, onClose, eventId, user, onSuccess }: NiyazModalProps) {
  const [niyazName, setNiyazName] = useState("");
  const [distributorType, setDistributorType] = useState<DistributorType>("booth");
  const [distributorName, setDistributorName] = useState(user.displayName || "");
  const [distributorPhone, setDistributorPhone] = useState("");
  const [distributorEmail, setDistributorEmail] = useState(user.email || "");
  const [distributorAddress, setDistributorAddress] = useState("");
  const [distributorWebsite, setDistributorWebsite] = useState("");
  const [distributorDescription, setDistributorDescription] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerNiyazForEvent({
        eventId,
        userId: user.uid,
        niyazName,
        distributorType,
        distributorName,
        distributorPhone,
        distributorEmail,
        distributorAddress,
        distributorWebsite: distributorWebsite || undefined,
        distributorDescription,
        expirationDate: expirationDate || "Event Day (Midnight)",
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSubmitted(false);
      }, 1800);
    } catch (err) {
      console.error("Error registering Niyaz:", err);
      alert("Failed to submit Niyaz registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#ebebeb] shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative my-8 space-y-5">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-1 rounded-full text-[#888888] hover:text-[#171717] hover:bg-[#f5f5f5]"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mx-auto border border-[#10b981]/25">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-[#171717]">Niyaz Permit Requested!</h3>
            <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed">
              Your Niyaz / Sabeel distribution request has been submitted to the committee for verification.
              Once approved, you will receive an official QR verification permit.
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
                <h3 className="text-lg font-semibold tracking-tight text-[#171717]">Register Niyaz / Sabeel</h3>
                <p className="text-xs text-[#666666]">Apply for official distribution clearance & QR pass</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Distributor Type Selector */}
              <div>
                <label className="block text-xs font-medium text-[#4d4d4d] mb-1.5">
                  Distribution Setup *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDistributorType("booth")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-medium
                      ${
                        distributorType === "booth"
                          ? "border-[#171717] bg-[#fafafa] text-[#171717] shadow-xs"
                          : "border-[#ebebeb] text-[#666666] hover:border-[#d4d4d4]"
                      }
                    `}
                  >
                    Sabeel / Fixed Stall
                  </button>

                  <button
                    type="button"
                    onClick={() => setDistributorType("individual")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-medium
                      ${
                        distributorType === "individual"
                          ? "border-[#171717] bg-[#fafafa] text-[#171717] shadow-xs"
                          : "border-[#ebebeb] text-[#666666] hover:border-[#d4d4d4]"
                      }
                    `}
                  >
                    Individual / Mobile
                  </button>
                </div>
              </div>

              {/* Niyaz Item Name */}
              <Input
                label="Niyaz / Food Item Name *"
                type="text"
                placeholder="e.g. Bottled Water, Chilled Milk Sharbat, Biryani Packets"
                value={niyazName}
                onChange={(e) => setNiyazName(e.target.value)}
                required
              />

              {/* Distributor Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Distributor / Lead Name *"
                  type="text"
                  placeholder="Full Name"
                  value={distributorName}
                  onChange={(e) => setDistributorName(e.target.value)}
                  required
                />
                <Input
                  label="Contact Phone *"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={distributorPhone}
                  onChange={(e) => setDistributorPhone(e.target.value)}
                  required
                />
              </div>

              {/* Distributor Email & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Email Address *"
                  type="email"
                  value={distributorEmail}
                  onChange={(e) => setDistributorEmail(e.target.value)}
                  required
                />
                <Input
                  label="Website / Social (Optional)"
                  type="url"
                  placeholder="https://..."
                  value={distributorWebsite}
                  onChange={(e) => setDistributorWebsite(e.target.value)}
                />
              </div>

              {/* Stall / Distribution Location */}
              <Input
                label="Proposed Distribution Location / Address *"
                type="text"
                placeholder="e.g. Corner of Grand Trunk Road, opposite Gate 3"
                value={distributorAddress}
                onChange={(e) => setDistributorAddress(e.target.value)}
                required
              />

              {/* Expiration Date / Time */}
              <Input
                label="Estimated Distribution End Time *"
                type="text"
                placeholder="e.g. 2026-10-04 at 8:00 PM"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                required
              />

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#4d4d4d]">
                  Distribution Details / Items Description *
                </label>
                <textarea
                  rows={2}
                  className="w-full p-3 bg-white text-[#171717] placeholder-[#888888] text-xs rounded-lg border border-[#ebebeb] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10 outline-none"
                  placeholder="Number of estimated packets/liters, hygiene precautions, distribution crew size..."
                  value={distributorDescription}
                  onChange={(e) => setDistributorDescription(e.target.value)}
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#fafafa] border border-[#ebebeb] flex items-center space-x-2 text-xs text-[#666666]">
                <QrCode className="w-5 h-5 text-[#0070f3] shrink-0" />
                <span>
                  Approved distributors receive a secure QR code on their dashboard to display at the sabeel.
                </span>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  pill
                  fullWidth
                  isLoading={loading}
                >
                  Submit Niyaz Registration
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
