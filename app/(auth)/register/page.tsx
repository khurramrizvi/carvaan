"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RoleSelector } from "@/components/ui/RoleSelector";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UploadCloud, Image as ImageIcon, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithGoogle, registerCommittee } = useAuth();

  const [role, setRole] = useState<"committee" | "user">("committee");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Committee form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Logo image size must be less than 5MB.");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to sign up with Google."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCommitteeRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) {
      setErrorMessage("Please upload your committee's official logo.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await registerCommittee({
        name,
        email,
        password,
        phone,
        address,
        website,
        description,
        logoFile,
      });

      router.push("/auth/status?state=pending");
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
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
              <NextImage
                src="/logo-white.png"
                alt="Carvaan Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-lg"
                priority
              />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">
              Carvaan
            </span>
          </Link>

          <div className="mt-8 lg:mt-14 max-w-lg space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono uppercase tracking-wider text-[#00dfd8] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>Organizer Verification Protocol</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight text-white">
              Empower your community with unified procession intelligence.
            </h1>
            <p className="text-sm text-[#888888] leading-relaxed">
              Register your organizing committee to publish verified routes, issue digital Niyaz permits, dispatch volunteer teams, and manage crowd safety in real time.
            </p>
          </div>
        </div>

        {/* Middle Feature Highlights - Desktop only */}
        <div className="hidden lg:grid grid-cols-1 gap-3 my-8 relative z-10">
          <div className="flex items-start space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-[#007cf0]/20 text-[#00dfd8] flex items-center justify-center shrink-0">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Official Verification & Badge</div>
              <div className="text-[11px] text-[#888888] mt-0.5">Admin-approved badges protect community trust and prevent fraudulent alerts.</div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-[#7928ca]/20 text-[#ff0080] flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Live Broadcast & Emergency Triage</div>
              <div className="text-[11px] text-[#888888] mt-0.5">Stream live procession telemetry and manage Lost & Found or SOS reports directly.</div>
            </div>
          </div>
        </div>

        {/* Bottom Status / Trust Statement */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#888888]">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span>DPDP Act 2023 Compliant</span>
          </div>
          <span className="font-mono text-[10px]">Encrypted Committee Vault</span>
        </div>
      </div>

      {/* RIGHT COLUMN: REGISTRATION FORM */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-14 overflow-y-auto">
        <div className="w-full max-w-xl">
          {/* Top navigation link */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#666666] hover:text-[#171717] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Feed</span>
            </Link>
            <Link
              href="/login"
              className="text-xs font-medium text-[#0070f3] hover:underline"
            >
              Already registered? Log in
            </Link>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#ebebeb] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-[#171717] tracking-tight">
                Create an Account
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Select your role to proceed with Carvaan civic operations
              </p>
            </div>

            {/* Role Selector Radio */}
            <div className="mb-5">
              <RoleSelector
                selectedRole={role}
                onChange={(newRole) => {
                  setRole(newRole);
                  setErrorMessage("");
                }}
                disabled={loading}
              />
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-[#ee0000]/10 border border-[#ee0000]/20 flex items-start space-x-2 text-[#ee0000] text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#ee0000]" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {role === "committee" ? (
              <form onSubmit={handleCommitteeRegister} className="space-y-4 text-left">
                {/* Logo Upload Field */}
                <div>
                  <label className="block text-xs font-medium text-[#4d4d4d] mb-1">
                    Official Committee Logo *
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-3.5 p-3.5 border border-dashed border-[#ebebeb] rounded-xl hover:border-[#171717] transition-colors cursor-pointer bg-[#fafafa]"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    {logoPreview ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-12 h-12 rounded-lg object-cover border border-[#ebebeb]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white border border-[#ebebeb] flex items-center justify-center text-[#888888]">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-1.5 text-xs font-medium text-[#0070f3]">
                        <UploadCloud className="w-4 h-4" />
                        <span>{logoFile ? "Change Logo" : "Upload Official Emblem"}</span>
                      </div>
                      <p className="text-[11px] text-[#888888] mt-0.5">PNG, JPG, or WebP (max 5MB)</p>
                    </div>
                  </div>
                </div>

                {/* Committee Name */}
                <Input
                  label="Committee / Organization Name *"
                  type="text"
                  placeholder="e.g. Markazi Anjuman-e-Hussaini"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />

                {/* Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Official Email *"
                    type="email"
                    placeholder="contact@anjuman.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Input
                    label="Account Password *"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    helperText="Minimum 6 characters"
                  />
                </div>

                {/* Phone & Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Contact Phone Number *"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Input
                    label="Official Website (Optional)"
                    type="url"
                    placeholder="https://anjuman.org"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* Physical Address */}
                <Input
                  label="Registered Address / Office *"
                  type="text"
                  placeholder="Office #102, Imambargah Road, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={loading}
                />

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#4d4d4d]">
                    About Committee / Description *
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-3 bg-white text-[#171717] placeholder-[#888888] text-xs rounded-lg border border-[#ebebeb] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10 outline-none transition-all"
                    placeholder="Briefly describe your committee, traditions, and event organization history..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={loading}
                  />
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
                    Submit Registration for Verification
                  </Button>
                  <p className="text-[11px] text-[#888888] text-center mt-2 font-mono">
                    Applications are verified by the Carvaan admin team before credentials activate.
                  </p>
                </div>
              </form>
            ) : (
              <div className="space-y-4 py-4 text-center">
                <p className="text-xs text-[#666666]">
                  Citizens register and sign in effortlessly using their Google account without waiting for verification.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleSignup}
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
          </div>
        </div>
      </div>
    </div>
  );
}
