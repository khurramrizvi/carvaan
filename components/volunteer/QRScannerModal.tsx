"use client";

import React, { useState } from "react";
import Image from "next/image";
import { verifyNiyazQRCode } from "@/lib/firebase/event-services";
import { NiyazRegistration } from "@/types/event";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  X,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Scan,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export function QRScannerModal({ isOpen, onClose, eventId }: QRScannerModalProps) {
  const [codeData, setCodeData] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    status: "approved" | "pending" | "rejected" | "invalid";
    niyaz?: NiyazRegistration;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (textToVerify?: string) => {
    const data = textToVerify || codeData;
    if (!data.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await verifyNiyazQRCode(data);
      setResult(res);
    } catch (err) {
      console.error("Verification error:", err);
      setResult({
        valid: false,
        status: "invalid",
        message: "Failed to verify QR permit. Please check network connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSampleScan = (sample: string) => {
    setCodeData(sample);
    handleVerify(sample);
  };

  const reset = () => {
    setResult(null);
    setCodeData("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#ebebeb] shadow-[0_16px_50px_rgba(0,0,0,0.12)] relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#888888] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
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
            <h3 className="text-lg font-semibold tracking-tight text-[#171717]">Volunteer Niyaz Scanner</h3>
            <p className="text-xs text-[#666666]">Scan & verify authorized distributor passes</p>
          </div>
        </div>

        {/* Viewfinder Display */}
        <div className="relative h-44 bg-[#0a0a0a] rounded-xl overflow-hidden flex flex-col items-center justify-center text-white border border-[#262626]">
          <div className="absolute inset-0 bg-radial from-transparent to-black/70" />

          {/* Reticle / Target corners */}
          <div className="relative z-10 w-28 h-28 border-2 border-dashed border-[#0070f3] rounded-xl flex flex-col items-center justify-center">
            <div className="w-full h-0.5 bg-[#00dfd8] animate-pulse shadow-[0_0_12px_#00dfd8]" />
            <Scan className="w-7 h-7 text-[#0070f3]/80 mt-2" />
          </div>

          <p className="relative z-10 text-[11px] font-mono text-[#888888] mt-2">
            Target Sabeel QR code in camera view
          </p>
        </div>

        {/* Verification Result Card */}
        {result && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2.5 animate-in slide-in-from-top-2
              ${
                result.valid
                  ? "bg-[#10b981]/10 border-[#10b981]/25 text-[#10b981]"
                  : "bg-[#ee0000]/10 border-[#ee0000]/25 text-[#ee0000]"
              }
            `}
          >
            <div className="flex items-center space-x-2">
              {result.valid ? (
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#ee0000] shrink-0" />
              )}
              <span className="font-mono text-xs font-semibold tracking-wide uppercase">
                {result.valid ? "AUTHORIZED DISTRIBUTION PASS" : "UNAUTHORIZED / EXPIRED PASS"}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-[#171717]">{result.message}</p>

            {result.niyaz && (
              <div className="bg-white rounded-xl p-3 border border-[#ebebeb] shadow-xs space-y-1.5 text-[11px] text-[#171717]">
                <div className="font-semibold text-[#171717] text-xs">{result.niyaz.niyazName}</div>
                <div className="flex items-center justify-between text-[#666666]">
                  <span>Distributor: <strong className="text-[#171717] font-medium">{result.niyaz.distributorName}</strong></span>
                  <a
                    href={`tel:${result.niyaz.distributorPhone}`}
                    className="font-mono text-[#0070f3] flex items-center space-x-1 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                </div>
                <div className="flex items-center space-x-1 text-[#666666]">
                  <MapPin className="w-3 h-3 text-[#0070f3] shrink-0" />
                  <span>{result.niyaz.distributorAddress}</span>
                </div>
                <div className="flex items-center space-x-1 text-[#888888] font-mono text-[10px]">
                  <Clock className="w-3 h-3 text-[#f5a623] shrink-0" />
                  <span>Valid until: {result.niyaz.expirationDate}</span>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="text-[11px] font-mono text-[#0070f3] hover:underline flex items-center space-x-1 pt-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Scan another permit</span>
            </button>
          </div>
        )}

        {/* Input & Quick Code Triggers */}
        {!result && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                placeholder="Paste code (e.g. CARVAAN-NIYAZ:...)"
                value={codeData}
                onChange={(e) => setCodeData(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="primary"
                size="md"
                isLoading={loading}
                onClick={() => handleVerify()}
              >
                Verify
              </Button>
            </div>

            {/* Quick Demo QR Simulator */}
            <div className="p-3.5 bg-[#fafafa] rounded-xl border border-[#ebebeb] space-y-2 text-xs text-[#666666]">
              <div className="flex items-center space-x-1.5 text-[#171717] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#0070f3]" />
                <span>Simulate Scan on Device:</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    handleSampleScan(
                      `CARVAAN-NIYAZ:niyaz_${eventId}_1:${eventId}:Mirza Hasan`
                    )
                  }
                  className="px-3 py-1.5 bg-white rounded-full border border-[#ebebeb] text-[11px] font-mono text-[#10b981] hover:border-[#10b981]/40 hover:bg-[#10b981]/5 transition-all shadow-xs"
                >
                  Simulate Approved Sabeel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSampleScan(
                      `CARVAAN-NIYAZ:unauthorized_99:${eventId}:Unknown`
                    )
                  }
                  className="px-3 py-1.5 bg-white rounded-full border border-[#ebebeb] text-[11px] font-mono text-[#ee0000] hover:border-[#ee0000]/40 hover:bg-[#ee0000]/5 transition-all shadow-xs"
                >
                  Simulate Invalid Permit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
