"use client";

import React, { useState } from "react";
import Image from "next/image";
import { EventDonationConfig } from "@/types/event";
import {
  QrCode,
  CheckCircle2,
  Copy,
  ExternalLink,
  Heart,
  ShieldCheck,
  Smartphone,
  Info,
  Building,
  Sparkles,
} from "lucide-react";

interface EventDonationCardProps {
  donationConfig?: EventDonationConfig;
  committeeName: string;
  eventTitle: string;
}

export function EventDonationCard({
  donationConfig,
  committeeName,
  eventTitle,
}: EventDonationCardProps) {
  // Fallbacks if not explicitly provided by committee
  const upiId = donationConfig?.upiId || "carvaan.juloos@upi";
  const payeeName = donationConfig?.payeeName || committeeName;
  const suggestedAmounts = donationConfig?.suggestedAmounts || [100, 250, 500, 1000];
  const note = donationConfig?.note || `Hadiya for ${eventTitle.slice(0, 30)}`;

  const [selectedAmount, setSelectedAmount] = useState<number | null>(250);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Calculate effective amount
  const activeAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  // Generate standard UPI payload URL
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&tn=${encodeURIComponent(note)}${
    activeAmount && !isNaN(activeAmount) && activeAmount > 0
      ? `&am=${activeAmount.toFixed(2)}`
      : ""
  }&cu=INR`;

  // QR Code Image URL (standard, highly compatible QR generator)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(upiUri)}`;

  const handleCopyUpi = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    setSelectedAmount(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ebebeb] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#ebebeb] pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center shrink-0 border border-[#10b981]/20">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171717]">
                Donate to Juloos Fund
              </h3>
              <p className="text-xs text-[#666666]">
                Direct UPI contributions for Sabeel, Niyaz & First-Aid
              </p>
            </div>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25 shrink-0">
          <ShieldCheck className="w-3 h-3 mr-0.5" />
          <span>Verified UPI</span>
        </span>
      </div>

      {/* Suggested Quick Amount Pills */}
      <div className="space-y-2">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#888888]">
          Select Contribution Amount
        </label>
        <div className="grid grid-cols-4 gap-2">
          {suggestedAmounts.map((amt) => {
            const isSelected = selectedAmount === amt && !customAmount;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handleSelectPreset(amt)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#171717] text-white shadow-xs scale-102"
                    : "bg-[#fafafa] hover:bg-[#f5f5f5] text-[#171717] border border-[#ebebeb]"
                }`}
              >
                ₹{amt}
              </button>
            );
          })}
        </div>

        {/* Custom Amount Input */}
        <div className="relative mt-2">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#888888]">
            ₹
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Or enter custom amount in INR..."
            value={customAmount}
            onChange={handleCustomChange}
            className="w-full pl-8 pr-3.5 py-2 bg-[#fafafa] border border-[#ebebeb] rounded-xl text-xs text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#171717] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* UPI QR Code Display Card */}
      <div className="p-4 bg-[#fafafa] border border-[#ebebeb] rounded-2xl flex flex-col items-center justify-center text-center space-y-3 relative group">
        <div className="relative bg-white p-3 rounded-xl border border-[#ebebeb] shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeUrl}
            alt="Scan UPI QR Code to Donate"
            width={200}
            height={200}
            className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
          />
          {/* Mini Center Emblem */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-white p-0.5 shadow-md border border-[#ebebeb] flex items-center justify-center">
              <Image
                src="/logo-white.png"
                alt="Carvaan"
                width={24}
                height={24}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center space-x-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#10b981]" />
            <p className="text-xs font-semibold text-[#171717]">
              Scan with any UPI App
            </p>
          </div>
          <p className="text-[11px] text-[#888888]">
            Google Pay • PhonePe • Paytm • BHIM • Cred
          </p>
        </div>
      </div>

      {/* UPI ID Details Strip & Copy Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#fafafa] border border-[#ebebeb] text-xs">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] block">
              Official Committee UPI ID
            </span>
            <span className="font-mono font-semibold text-[#171717] truncate block text-[13px]">
              {upiId}
            </span>
            <span className="text-[11px] text-[#666666] truncate block">
              Payee: {payeeName}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyUpi}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              copied
                ? "bg-[#10b981] text-white"
                : "bg-white text-[#171717] border border-[#ebebeb] hover:bg-[#f5f5f5]"
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile One-Tap Pay Link */}
        <a
          href={upiUri}
          className="w-full py-2.5 px-4 rounded-full bg-[#10b981] hover:bg-[#059669] text-white text-xs font-medium transition-all flex items-center justify-center space-x-2 shadow-xs"
        >
          <Smartphone className="w-4 h-4" />
          <span>
            {activeAmount && !isNaN(activeAmount) && activeAmount > 0
              ? `Pay ₹${activeAmount} via UPI App`
              : "Open in UPI Payment App"}
          </span>
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
        </a>
      </div>

      {/* Sabeel & Causes Breakdown */}
      <div className="p-3 bg-[#fafafa] rounded-xl border border-[#ebebeb] text-[11px] space-y-1.5 text-[#666666]">
        <div className="flex items-center space-x-1.5 font-medium text-[#171717]">
          <Sparkles className="w-3.5 h-3.5 text-[#0070f3]" />
          <span>How your contribution helps this Juloos:</span>
        </div>
        <ul className="grid grid-cols-2 gap-1.5 text-[10px] text-[#666666] pt-0.5">
          <li className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3]" />
            <span>Water & Sabeel Stalls</span>
          </li>
          <li className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ee0000]" />
            <span>Emergency Paramedics</span>
          </li>
          <li className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span>Volunteer Supplies</span>
          </li>
          <li className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7928ca]" />
            <span>Tabarruk Distribution</span>
          </li>
        </ul>
      </div>

      {/* Optional Bank Account Details Toggle */}
      {donationConfig?.accountNumber && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowBankDetails(!showBankDetails)}
            className="text-xs text-[#0070f3] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Building className="w-3 h-3" />
            <span>
              {showBankDetails ? "Hide Bank Transfer Details" : "View Bank Account & NEFT/IMPS Details"}
            </span>
          </button>

          {showBankDetails && (
            <div className="mt-2 p-3 bg-[#fafafa] rounded-xl border border-[#ebebeb] text-xs space-y-1 font-mono text-[#666666] animate-in fade-in">
              <p>
                <strong className="text-[#171717]">Bank:</strong> {donationConfig.bankName || "National Bank"}
              </p>
              <p>
                <strong className="text-[#171717]">A/C Number:</strong> {donationConfig.accountNumber}
              </p>
              <p>
                <strong className="text-[#171717]">IFSC:</strong> {donationConfig.ifscCode}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
