"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { fetchCommitteeEvents, createNewCommitteeEvent } from "@/lib/firebase/committee-event-services";
import { JuloosEvent } from "@/types/event";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Building2,
  Plus,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Shield,
  Loader2,
  Radio,
  X,
  Compass,
} from "lucide-react";

export default function CommitteeEventsPage() {
  const router = useRouter();
  const { user, userProfile, committeeProfile, loading: authLoading } = useAuth();

  const [events, setEvents] = useState<JuloosEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [startPointName, setStartPointName] = useState("");
  const [endPointName, setEndPointName] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/watch?v=ss-HcTBup88");

  const loadEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchCommitteeEvents(user.uid);
      setEvents(data);
    } catch (err) {
      console.error("Error loading committee events:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (userProfile?.role !== "committee") {
        router.push("/");
      } else if (userProfile?.status !== "approved") {
        router.push(`/auth/status?state=${userProfile?.status || "pending"}`);
      } else {
        loadEvents();
      }
    }
  }, [user, userProfile, authLoading, router, loadEvents]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const newEvent = await createNewCommitteeEvent({
        title,
        description,
        committeeId: user.uid,
        committeeName: committeeProfile?.name || "Organizing Committee",
        committeeLogo:
          committeeProfile?.logoUrl ||
          "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80",
        date: date || new Date().toISOString().split("T")[0],
        startTime: startTime || "09:00 AM",
        endTime: endTime || "06:00 PM",
        status: "upcoming",
        location: location || `${startPointName} to ${endPointName}`,
        route: {
          startPoint: {
            name: startPointName || "Main Imambargah",
            lat: 28.6139,
            lng: 77.209,
          },
          endPoint: {
            name: endPointName || "Karbala Grounds",
            lat: 28.62,
            lng: 77.215,
          },
          waypoints: [],
        },
        announcements: [],
        emergencyContacts: [
          { name: "Committee Helpdesk", phone: "112", role: "Central Police Liaison" },
          { name: "Medical Escort", phone: "108", role: "Ambulance Cell" },
        ],
        videoUrl: videoUrl || "https://www.youtube.com/watch?v=ss-HcTBup88",
        coverImage:
          coverImage ||
          "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80",
      });

      setEvents((prev) => [newEvent, ...prev]);
      setIsCreateModalOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setStartPointName("");
      setEndPointName("");
      setCoverImage("");
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (loading && events.length === 0)) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#0070f3] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-wider text-[#888888]">Loading committee workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-[#171717] selection:text-white">
      <Navbar />

      {/* Committee Sub-Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#ebebeb] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#ebebeb] bg-white flex items-center justify-center shadow-xs shrink-0">
              <Image
                src={committeeProfile?.logoUrl || "/logo-white.png"}
                alt="Committee Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-[#171717] leading-tight truncate max-w-[130px] sm:max-w-none">
                {committeeProfile?.name || "Committee"} Workspace
              </h1>
              <p className="text-[11px] font-mono text-[#888888] tracking-tight hidden sm:block">Procession Organization & Control Operations</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            <Link href="/" className="hidden sm:inline-block">
              <Button variant="secondary" size="sm" pill>
                Public Feed
              </Button>
            </Link>

            <Button
              variant="primary"
              size="sm"
              pill
              className="space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 text-xs"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Juloos</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Banner */}
        <section className="bg-white rounded-2xl border border-[#ebebeb] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="flex items-start space-x-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                committeeProfile?.logoUrl ||
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80"
              }
              alt="Logo"
              className="w-14 h-14 rounded-xl object-cover border border-[#ebebeb] shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#171717]">
                  {committeeProfile?.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25">
                  Verified Committee
                </span>
              </div>
              <p className="text-xs text-[#666666] mt-1 max-w-xl leading-relaxed">
                {committeeProfile?.description ||
                  "Manage all procession events, volunteers, Niyaz approvals, and emergency incidents."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 border-t md:border-t-0 md:border-l border-[#ebebeb] pt-4 md:pt-0 md:pl-6">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#888888]">
                Organized Events
              </p>
              <p className="text-3xl font-semibold text-[#171717] mt-0.5">{events.length}</p>
            </div>
          </div>
        </section>

        {/* Committee Events List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-[#171717]">Your Organized Juloos Events</h3>
              <p className="text-xs text-[#666666]">
                Select an event to open the management hub for volunteers, SOS alerts, and Niyaz permits
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-[#ebebeb] overflow-hidden hover:border-[#171717]/30 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="relative h-44 bg-[#111111]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      event.coverImage ||
                      "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3">
                    {event.status === "live" ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#ee0000] text-white">
                        <Radio className="w-3 h-3" />
                        <span>LIVE NOW</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/90 backdrop-blur-xs text-[#171717]">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-[#171717] group-hover:text-[#0070f3] transition-colors leading-snug">
                      {event.title}
                    </h4>
                    <p className="text-xs text-[#666666] line-clamp-2">
                      {event.description}
                    </p>

                    <div className="pt-1 space-y-1 text-xs text-[#888888]">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                        <span>{event.date}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-[#888888]" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-[#0070f3]" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#888888]">
                      {event.announcements?.length || 0} Alerts Active
                    </span>

                    <Link
                      href={`/committee/events/${event.id}`}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#171717] text-white hover:bg-[#2e2e2e] transition-all text-xs font-medium"
                    >
                      <span>Manage Event</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* CREATE EVENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 border border-[#ebebeb] shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative my-auto space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-[#888888] hover:text-[#171717] hover:bg-[#f5f5f5]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#0070f3]/10 text-[#0070f3] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-[#171717]">Create New Juloos</h3>
                <p className="text-xs text-[#666666]">Publish a procession schedule, certified route, and volunteer call</p>
              </div>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-left">
              <Input
                label="Procession Title *"
                type="text"
                placeholder="e.g. Central Youm-e-Ashura Procession"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#4d4d4d]">
                  Description & Historical Significance *
                </label>
                <textarea
                  rows={2}
                  className="w-full p-3 bg-white text-[#171717] placeholder-[#888888] text-xs rounded-lg border border-[#ebebeb] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10 outline-none"
                  placeholder="Detail traditional markers, alam participants, community sabeels..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Date *"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <Input
                  label="Start Time *"
                  type="text"
                  placeholder="09:00 AM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
                <Input
                  label="End Time *"
                  type="text"
                  placeholder="07:30 PM"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Starting Landmark / Imambargah *"
                  type="text"
                  placeholder="Old City Imambargah Gate"
                  value={startPointName}
                  onChange={(e) => setStartPointName(e.target.value)}
                  required
                />
                <Input
                  label="Final Destination / Karbala Grounds *"
                  type="text"
                  placeholder="Central Karbala Grounds"
                  value={endPointName}
                  onChange={(e) => setEndPointName(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Overall Route Location Description"
                type="text"
                placeholder="e.g. Starting from Main Imambargah to Karbala Ground via Grand Trunk Road"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <Input
                label="Cover Image URL (Optional)"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />

              <Input
                label="Live Stream / YouTube Broadcast Link (Optional)"
                type="url"
                placeholder="https://www.youtube.com/watch?v=ss-HcTBup88"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                helperText="Embeds an interactive video player on the public event page"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  pill
                  fullWidth
                  isLoading={submitting}
                >
                  Publish Juloos Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
