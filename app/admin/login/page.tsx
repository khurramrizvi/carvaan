"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await loginWithEmail(email, password, "admin");
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Invalid administrator credentials or unauthorized user."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#171717] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center items-center space-x-2.5">
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
            Carvaan Admin
          </span>
        </div>
        <h2 className="mt-4 text-center text-2xl font-semibold tracking-tight text-[#171717]">
          Administrator Portal
        </h2>
        <p className="mt-1 text-center text-xs text-[#666666]">
          Sign in to review and verify committee applications
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-[#ebebeb] shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-2xl sm:px-10">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-[#ee0000]/10 border border-[#ee0000]/20 flex items-start space-x-2 text-[#ee0000] text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <Input
              label="Admin Email Address"
              type="email"
              placeholder="admin@carvaan.com"
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
                Sign In to Dashboard
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#ebebeb] text-center">
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 text-xs text-[#666666] hover:text-[#171717] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to standard login</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
