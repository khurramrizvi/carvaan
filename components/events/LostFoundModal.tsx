"use client";

import React, { useState } from "react";
import Image from "next/image";
import { reportEventLostAndFound } from "@/lib/firebase/event-services";
import { ItemType, ItemStatus } from "@/types/event";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, UserSearch, Package, CheckCircle2, UserCheck } from "lucide-react";

interface LostFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  user: { uid: string; displayName?: string | null; email?: string | null };
  userRole?: string;
  onSuccess: () => void;
}

export function LostFoundModal({
  isOpen,
  onClose,
  eventId,
  user,
  userRole = "volunteer",
  onSuccess,
}: LostFoundModalProps) {
  const [itemType, setItemType] = useState<ItemType>("person");
  const [status, setStatus] = useState<ItemStatus>("lost");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !location) return;

    setLoading(true);
    try {
      await reportEventLostAndFound({
        eventId,
        itemType,
        name,
        description,
        location,
        status,
        photoUrl: photoUrl || undefined,
        reportedBy: {
          uid: user.uid,
          name: user.displayName || "On-ground Volunteer",
          phone: reporterPhone || "Available on ground",
          role: userRole,
        },
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSubmitted(false);
      }, 1800);
    } catch (err) {
      console.error("Error creating report:", err);
      alert("Failed to report lost/found item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#ebebeb] shadow-[0_16px_50px_rgba(0,0,0,0.12)] relative space-y-5 max-h-[90vh] overflow-y-auto">
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
            <h3 className="text-xl font-semibold tracking-tight text-[#171717]">Report Published</h3>
            <p className="text-xs text-[#666666] max-w-xs mx-auto leading-relaxed">
              The {itemType === "person" ? "missing person" : "item"} report is now logged and
              visible to volunteers and the organizing committee.
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
                <h3 className="text-lg font-semibold tracking-tight text-[#171717]">Report Lost & Found</h3>
                <p className="text-xs text-[#666666]">Raise report for Missing Person or Found Item</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Type Toggle: Person vs Item */}
              <div>
                <label className="block text-xs font-medium text-[#171717] mb-1.5">
                  Report Category *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setItemType("person")}
                    className={`p-2.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-medium transition-all
                      ${
                        itemType === "person"
                          ? "border-[#171717] bg-[#171717] text-white shadow-xs"
                          : "border-[#ebebeb] bg-white text-[#666666] hover:border-[#171717]/30 hover:text-[#171717]"
                      }
                    `}
                  >
                    <UserSearch className="w-4 h-4" />
                    <span>Missing Person</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemType("item")}
                    className={`p-2.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-medium transition-all
                      ${
                        itemType === "item"
                          ? "border-[#171717] bg-[#171717] text-white shadow-xs"
                          : "border-[#ebebeb] bg-white text-[#666666] hover:border-[#171717]/30 hover:text-[#171717]"
                      }
                    `}
                  >
                    <Package className="w-4 h-4" />
                    <span>Belonging / Item</span>
                  </button>
                </div>
              </div>

              {/* Status Toggle: Lost vs Found */}
              <div>
                <label className="block text-xs font-medium text-[#171717] mb-1.5">
                  Current Status *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStatus("lost")}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all
                      ${
                        status === "lost"
                          ? "border-[#ee0000] bg-[#ee0000]/10 text-[#ee0000]"
                          : "border-[#ebebeb] bg-white text-[#666666] hover:border-[#171717]/30 hover:text-[#171717]"
                      }
                    `}
                  >
                    Lost (Searching)
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("found")}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all
                      ${
                        status === "found"
                          ? "border-[#10b981] bg-[#10b981]/10 text-[#10b981]"
                          : "border-[#ebebeb] bg-white text-[#666666] hover:border-[#171717]/30 hover:text-[#171717]"
                      }
                    `}
                  >
                    Found (In Custody)
                  </button>
                </div>
              </div>

              {/* Name */}
              <Input
                label={itemType === "person" ? "Person's Name & Age *" : "Item Name / Title *"}
                type="text"
                placeholder={
                  itemType === "person"
                    ? "e.g. Ali Reza (Age 9, wearing black kurta)"
                    : "e.g. Black Leather Wallet with Driving License"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* Location */}
              <Input
                label="Last Seen or Found Location *"
                type="text"
                placeholder="e.g. Near Sabeel #3 / Main Imambargah Gate 2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171717]">
                  Detailed Description *
                </label>
                <textarea
                  rows={2}
                  className="w-full p-3 bg-white text-[#171717] placeholder-[#888888] text-xs rounded-xl border border-[#ebebeb] focus:border-[#171717] focus:ring-1 focus:ring-[#171717]/10 outline-none transition-all"
                  placeholder="Distinctive marks, clothing colors, identifying characteristics, contact info..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Photo URL (optional) */}
              <Input
                label="Photo URL (Optional)"
                type="url"
                placeholder="https://..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />

              {/* Reporter Phone */}
              <Input
                label="Your Contact Phone (Volunteer) *"
                type="tel"
                placeholder="+91 98765 43210"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={loading}
                >
                  Submit Official Report
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
