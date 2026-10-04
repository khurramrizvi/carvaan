"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, XCircle, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

function StatusContent() {
  const searchParams = useSearchParams();
  const state = searchParams.get("state") || "pending";

  const isPending = state === "pending";

  return (
    <div className="bg-white py-10 px-6 border border-[#ebebeb] shadow-xs rounded-2xl sm:px-10 text-center">
      {isPending ? (
        <>
          <div className="w-14 h-14 rounded-2xl bg-[#f5a623]/10 text-[#ab570a] flex items-center justify-center mx-auto mb-4 border border-[#f5a623]/25">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#171717]">
            Application Under Review
          </h2>
          <p className="mt-2 text-xs text-[#666666] leading-relaxed max-w-sm mx-auto">
            Thank you for registering your committee with Carvaan. Your application has been
            forwarded to our administrator for verification.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-[#fafafa] border border-[#ebebeb] text-xs text-[#666666] text-left space-y-1.5">
            <p className="font-semibold text-[#171717]">What happens next?</p>
            <p>1. Our admin team verifies committee credentials and official documents.</p>
            <p>2. Once verified, your account status will transition to Approved.</p>
            <p>3. You can then sign in directly with your email and password.</p>
          </div>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-[#ee0000]/10 text-[#ee0000] flex items-center justify-center mx-auto mb-4 border border-[#ee0000]/25">
            <XCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#171717]">
            Application Not Approved
          </h2>
          <p className="mt-2 text-xs text-[#666666] leading-relaxed max-w-sm mx-auto">
            Your committee registration could not be approved at this time based on the submitted credentials.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-[#fafafa] border border-[#ebebeb] text-xs text-[#666666] text-left flex items-start space-x-2">
            <Mail className="w-4 h-4 text-[#888888] mt-0.5 shrink-0" />
            <span>
              If you believe this was an error, please reach out to the Carvaan team at{" "}
              <strong className="text-[#171717]">support@carvaan.com</strong> with your committee documentation.
            </span>
          </div>
        </>
      )}

      <div className="mt-8">
        <Link href="/login">
          <Button variant="secondary" size="md" pill className="space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#171717] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-2.5 mb-6">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#ebebeb] bg-white flex items-center justify-center shadow-xs shrink-0">
            <Image
              src="/logo-white.png"
              alt="Carvaan Logo"
              width={36}
              height={36}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="text-xl font-semibold tracking-tight text-[#171717]">
            Carvaan
          </span>
        </div>
        <Suspense fallback={<div className="text-center text-[#888888] font-mono text-xs">Loading status...</div>}>
          <StatusContent />
        </Suspense>
      </div>
    </main>
  );
}
