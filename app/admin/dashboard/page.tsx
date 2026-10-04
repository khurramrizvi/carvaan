"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { CommitteeProfile } from "@/types/auth";
import {
  fetchAllCommittees,
  approveCommitteeApplication,
  rejectCommitteeApplication,
} from "@/lib/firebase/auth-services";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, logout } = useAuth();

  const [committees, setCommittees] = useState<CommitteeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadCommittees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllCommittees();
      setCommittees(data);
    } catch (err) {
      console.error("Failed to load committees:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/admin/login");
      } else if (userProfile && userProfile.role !== "admin" && user.email !== "admin@carvaan.com") {
        router.push("/admin/login");
      } else {
        loadCommittees();
      }
    }
  }, [user, userProfile, authLoading, router, loadCommittees]);

  const handleApprove = async (committeeId: string) => {
    if (!user) return;
    setActionLoadingId(committeeId);
    try {
      await approveCommitteeApplication(committeeId, user.uid);
      setCommittees((prev) =>
        prev.map((c) => (c.id === committeeId ? { ...c, status: "approved" } : c))
      );
    } catch (err) {
      console.error("Error approving committee:", err);
      alert("Failed to approve committee. Please check permissions.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (committeeId: string) => {
    if (!user) return;
    const reason = prompt("Enter a reason for rejection (optional):");
    setActionLoadingId(committeeId);
    try {
      await rejectCommitteeApplication(committeeId, user.uid, reason || undefined);
      setCommittees((prev) =>
        prev.map((c) => (c.id === committeeId ? { ...c, status: "rejected" } : c))
      );
    } catch (err) {
      console.error("Error rejecting committee:", err);
      alert("Failed to reject committee.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metric Computations
  const totalCount = committees.length;
  const approvedCount = committees.filter((c) => c.status === "approved").length;
  const rejectedCount = committees.filter((c) => c.status === "rejected").length;
  const pendingCount = committees.filter((c) => c.status === "pending").length;

  // Filtered List
  const filteredCommittees = committees.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || (loading && committees.length === 0)) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0070f3] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-wider text-[#888888]">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-[#171717] selection:text-white">
      <Navbar />

      {/* Admin Sub-Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#ebebeb] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#ebebeb] bg-white flex items-center justify-center shadow-xs shrink-0">
              <Image
                src="/logo-white.png"
                alt="Carvaan Admin"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-[#171717] leading-tight truncate">
                Administration Portal
              </h1>
              <p className="text-[11px] font-mono text-[#888888] tracking-tight hidden sm:block">Organizing Committee Verification & Approvals</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={loadCommittees}
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#ebebeb] bg-white text-xs font-medium text-[#171717] hover:bg-[#fafafa] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh Data</span>
              <span className="sm:hidden">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* 4 Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total */}
          <div className="bg-white p-5 rounded-2xl border border-[#ebebeb] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                Total Committees
              </p>
              <h3 className="text-3xl font-semibold text-[#171717] mt-1">{totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] text-[#171717] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Approved */}
          <div className="bg-white p-5 rounded-2xl border border-[#ebebeb] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                Approved
              </p>
              <h3 className="text-3xl font-semibold text-[#10b981] mt-1">{approvedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white p-5 rounded-2xl border border-[#ebebeb] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                Pending Requests
              </p>
              <h3 className="text-3xl font-semibold text-[#f5a623] mt-1">{pendingCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#f5a623]/10 text-[#ab570a] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Rejected */}
          <div className="bg-white p-5 rounded-2xl border border-[#ebebeb] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                Rejected
              </p>
              <h3 className="text-3xl font-semibold text-[#ee0000] mt-1">{rejectedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ee0000]/10 text-[#ee0000] flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Committee Review Table Section */}
        <section className="bg-white rounded-2xl border border-[#ebebeb] shadow-xs overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 sm:p-6 border-b border-[#ebebeb] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#171717]">Committee Applications</h2>
              <p className="text-xs text-[#666666]">
                Review registrations, verify credentials, and grant access
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search committee or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-[#fafafa] border border-[#ebebeb] rounded-full text-xs text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10 w-full sm:w-64 transition-all"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#fafafa] border border-[#ebebeb] rounded-full text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
              >
                <option value="all">All Statuses ({totalCount})</option>
                <option value="pending">Pending ({pendingCount})</option>
                <option value="approved">Approved ({approvedCount})</option>
                <option value="rejected">Rejected ({rejectedCount})</option>
              </select>

              {/* Refresh button */}
              <button
                onClick={loadCommittees}
                disabled={loading}
                title="Refresh table"
                className="p-2 border border-[#ebebeb] rounded-full text-[#171717] hover:bg-[#fafafa] transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#ebebeb] text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                  <th className="py-3 px-6">Logo</th>
                  <th className="py-3 px-6">Committee Name</th>
                  <th className="py-3 px-6">Contact Info</th>
                  <th className="py-3 px-6">Address & Web</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb] text-xs">
                {filteredCommittees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#888888] font-mono">
                      No committee applications found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCommittees.map((comm) => (
                    <tr key={comm.id} className="hover:bg-[#fafafa] transition-colors">
                      {/* Logo */}
                      <td className="py-3.5 px-6 align-top">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={comm.logoUrl || "https://ui-avatars.com/api/?name=C&background=171717&color=fff"}
                          alt={comm.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#ebebeb] bg-[#f5f5f5]"
                        />
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-6 align-top">
                        <div className="font-semibold text-[#171717]">{comm.name}</div>
                        <div className="text-[10px] font-mono text-[#888888] mt-0.5">
                          ID: {comm.id.slice(0, 8)}...
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-6 align-top space-y-1">
                        <div className="flex items-center space-x-1.5 text-xs text-[#666666]">
                          <Mail className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                          <span>{comm.email}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-xs text-[#666666]">
                          <Phone className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                          <span className="font-mono">{comm.phone}</span>
                        </div>
                      </td>

                      {/* Address & Web */}
                      <td className="py-3.5 px-6 align-top space-y-1 max-w-xs">
                        <div className="flex items-start space-x-1.5 text-xs text-[#666666]">
                          <MapPin className="w-3.5 h-3.5 text-[#888888] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{comm.address}</span>
                        </div>
                        {comm.website && (
                          <div className="flex items-center space-x-1.5 text-xs text-[#0070f3]">
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            <a
                              href={comm.website}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline truncate max-w-[160px]"
                            >
                              {comm.website.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-6 align-top max-w-xs">
                        <p className="text-xs text-[#666666] line-clamp-3 leading-relaxed">
                          {comm.description}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6 align-top">
                        <Badge status={comm.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 align-top text-right space-x-2 whitespace-nowrap">
                        {comm.status === "pending" ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              pill
                              isLoading={actionLoadingId === comm.id}
                              onClick={() => handleApprove(comm.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              pill
                              isLoading={actionLoadingId === comm.id}
                              onClick={() => handleReject(comm.id)}
                            >
                              Reject
                            </Button>
                          </>
                        ) : comm.status === "approved" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            pill
                            isLoading={actionLoadingId === comm.id}
                            onClick={() => handleReject(comm.id)}
                          >
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            pill
                            isLoading={actionLoadingId === comm.id}
                            onClick={() => handleApprove(comm.id)}
                          >
                            Re-Approve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
