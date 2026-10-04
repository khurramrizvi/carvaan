"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RoleSelector } from "@/components/ui/RoleSelector";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Shield,
  AlertCircle,
  ArrowLeft,
  Compass,
  QrCode,
  HeartHandshake,
  CheckCircle2,
  Radio,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, loginWithEmail } = useAuth();

  const [role, setRole] = useState<"committee" | "user">("committee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to sign in with Google."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCommitteeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await loginWithEmail(email, password, "committee");
      if (res.status === "approved") {
        router.push("/committee/events");
      } else if (res.status === "pending") {
        router.push("/auth/status?state=pending");
      } else if (res.status === "rejected") {
        router.push("/auth/status?state=rejected");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      console.error(err);
      const status = (err as { status?: string })?.status;
      if (status === "pending") {
        router.push("/auth/status?state=pending");
      } else if (status === "rejected") {
        router.push("/auth/status?state=rejected");
      } else {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Invalid credentials or unauthorized account."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fafafa] font-sans selection:bg-[#171717] selection:text-white">
      {/* LEFT COLUMN: VERCEL DARK POLARITY SHOWCASE */}
      <div className="lg:w-1/2 bg-[#000000] text-white p-6 sm:p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#262626]">
        {/* Vercel subtle grid & glow */}
        <div className="absolute inset-0 vercel-dot-grid-dark opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#007cf0]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[#7928ca]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform border border-white/20 shrink-0">
              <Image
                src="/logo-white.png"
                alt="Carvaan Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-lg"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-semibold tracking-tight text-white">
                  Carvaan
                </span>
                <span className="w-2 h-2 rounded-full bg-[#00dfd8] animate-pulse" />
              </div>
              <span className="text-[10px] text-[#888888] font-mono tracking-wider uppercase">
                Connecting Community in Motion
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Value Proposition */}
        <div className="relative z-10 my-8 lg:my-0 space-y-6 max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/10 text-gray-200 border border-white/15 backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-[#00dfd8] animate-pulse" />
            <span>Civic Telemetry & Operations</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
            Coordinate processions with{" "}
            <span className="bg-gradient-to-r from-[#00dfd8] via-[#0070f3] to-[#ff0080] bg-clip-text text-transparent">
              real-time clarity.
            </span>
          </h1>

          <p className="text-sm text-[#888888] leading-relaxed">
            High-performance infrastructure for certified organizing committees, volunteer command forces, and civic attendees tracking live Juloos.
          </p>

          {/* Feature Checklist */}
          <div className="hidden sm:grid grid-cols-1 gap-3 pt-2">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <Compass className="w-4 h-4 text-[#00dfd8] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Sub-Second GPS Telemetry</p>
                <p className="text-[11px] text-[#888888]">Turn-by-turn route tracking with certified checkpoint markers.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <QrCode className="w-4 h-4 text-[#ff0080] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Cryptographic Niyaz Passes</p>
                <p className="text-[11px] text-[#888888]">Anti-counterfeit digital permits for safe food & beverage stalls.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <HeartHandshake className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Volunteer Command Corps</p>
                <p className="text-[11px] text-[#888888]">Instant triage, missing children assistance, and medical alerts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Social Proof Footer */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#888888]">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span>DPDP Act 2023 Compliant</span>
          </div>
          <span className="font-mono text-[11px] text-[#888888]">Operations Console</span>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE AUTH FORM */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-[#ebebeb] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-6">
          {/* Back to Home Link */}
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#666666] hover:text-[#171717] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Feed</span>
          </Link>

          <div>
            <h2 className="text-2xl font-semibold text-[#171717] tracking-tight">
              Sign in to Carvaan
            </h2>
            <p className="text-xs text-[#666666] mt-1">
              Select your role below to access your operations dashboard.
            </p>
          </div>

          {/* Role Selector */}
          <RoleSelector
            selectedRole={role}
            onChange={(newRole) => {
              setRole(newRole);
              setErrorMessage("");
            }}
            disabled={loading}
          />

          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#ee0000]/10 border border-[#ee0000]/20 flex items-start space-x-2 text-[#ee0000] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ee0000]" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Conditional Forms */}
          {role === "committee" ? (
            <form onSubmit={handleCommitteeLogin} className="space-y-4">
              <Input
                label="Committee Email"
                type="email"
                placeholder="committee@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  pill
                  fullWidth
                  isLoading={loading}
                >
                  Sign In as Committee
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-xs text-[#666666] text-center">
                Citizens and on-ground volunteers sign in securely with Google authentication.
              </p>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 px-4 py-2.5 bg-white border border-[#ebebeb] rounded-full hover:border-[#171717] hover:bg-[#fafafa] active:bg-[#f5f5f5] transition-all select-none font-medium text-xs text-[#171717] shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* Registration Navigation & Super Admin Access */}
          <div className="pt-4 border-t border-[#ebebeb] text-center space-y-2">
            <p className="text-xs text-[#666666]">
              New organizing committee?{" "}
              <Link
                href="/register"
                className="font-medium text-[#0070f3] hover:underline"
              >
                Register here
              </Link>
            </p>
            <div>
              <Link
                href="/admin/login"
                className="inline-flex items-center space-x-1 text-xs text-[#888888] hover:text-[#171717] transition-colors"
              >
                <Shield className="w-3 h-3" />
                <span>Super Admin Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
