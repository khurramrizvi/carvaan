"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { GeoPoint } from "@/types/event";
import {
  MapPin,
  Navigation,
  Compass,
  ExternalLink,
  Flag,
  Loader2,
  Route as RouteIcon,
  CheckCircle2,
  Layers,
} from "lucide-react";

// Dynamically import the Leaflet map with SSR disabled to prevent `window is not defined`
const ActualLeafletMap = dynamic(() => import("./ActualLeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] sm:h-[430px] rounded-2xl bg-[#fafafa] flex flex-col items-center justify-center border border-[#ebebeb] space-y-3">
      <Loader2 className="w-6 h-6 animate-spin text-[#0070f3]" />
      <span className="text-xs text-[#888888] font-mono">Loading interactive route map...</span>
    </div>
  ),
});

interface RouteMapProps {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  waypoints?: GeoPoint[];
  title?: string;
}

// Approximate distance calculator between lat/lng coordinates (Haversine formula)
function calculateTotalDistance(points: GeoPoint[]): string {
  if (points.length < 2) return "0.0 km";
  let totalKm = 0;
  const R = 6371; // Earth radius in km

  for (let i = 0; i < points.length - 1; i++) {
    const lat1 = (points[i].lat * Math.PI) / 180;
    const lat2 = (points[i + 1].lat * Math.PI) / 180;
    const dLat = ((points[i + 1].lat - points[i].lat) * Math.PI) / 180;
    const dLng = ((points[i + 1].lng - points[i].lng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalKm += R * c;
  }

  return totalKm > 0 ? `${totalKm.toFixed(1)} km` : "N/A";
}

export function RouteMap({
  startPoint,
  endPoint,
  waypoints = [],
  title = "Procession Route & Checkpoints",
}: RouteMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<GeoPoint>(startPoint);
  const [mapMode, setMapMode] = useState<"google" | "interactive">("google");

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${startPoint.lat},${startPoint.lng}&destination=${endPoint.lat},${endPoint.lng}`;

  // Google Maps directions embed URL (works directly in iframes with no API key)
  const googleEmbedUrl = `https://maps.google.com/maps?saddr=${startPoint.lat},${startPoint.lng}&daddr=${endPoint.lat},${endPoint.lng}&hl=en&z=14&output=embed`;

  const allPoints = [
    { ...startPoint, type: "start", label: "Start Point" },
    ...waypoints.map((w, i) => ({ ...w, type: "waypoint", label: `Checkpoint ${i + 1}` })),
    { ...endPoint, type: "end", label: "Destination" },
  ];

  const estimatedDistance = calculateTotalDistance([startPoint, ...waypoints, endPoint]);

  return (
    <div className="bg-white rounded-2xl border border-[#ebebeb] p-4 sm:p-6 space-y-4 font-sans shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-[#0070f3]" />
            <h3 className="text-base font-semibold tracking-tight text-[#171717]">{title}</h3>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            Verified street corridor plotted with live start point, checkpoints, and destination
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f5] text-xs font-mono text-[#666666] border border-[#ebebeb]">
            <RouteIcon className="w-3.5 h-3.5 text-[#0070f3]" />
            <span>Est. {estimatedDistance}</span>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-[#ebebeb] bg-white text-xs font-medium text-[#171717] hover:bg-[#fafafa] transition-all w-fit shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5 text-[#0070f3]" />
            <span className="hidden sm:inline">Open in Google Maps</span>
            <span className="sm:hidden">Directions</span>
            <ExternalLink className="w-3 h-3 text-[#888888]" />
          </a>
        </div>
      </div>

      {/* Map Mode Selector Tabs */}
      <div className="flex items-center justify-between">
        <div className="bg-[#f0f0f0] p-1 rounded-xl flex items-center text-xs">
          <button
            type="button"
            onClick={() => setMapMode("google")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 cursor-pointer
              ${mapMode === "google" ? "bg-white text-[#171717] shadow-xs" : "text-[#666666] hover:text-[#171717]"}
            `}
          >
            <svg className="w-3.5 h-3.5 text-[#0070f3]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
            <span>Google Maps Embed</span>
          </button>
          <button
            type="button"
            onClick={() => setMapMode("interactive")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 cursor-pointer
              ${mapMode === "interactive" ? "bg-white text-[#171717] shadow-xs" : "text-[#666666] hover:text-[#171717]"}
            `}
          >
            <Layers className="w-3.5 h-3.5 text-[#7928ca]" />
            <span>Interactive Landmarks</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-[#888888] hidden sm:inline-block">
          {mapMode === "google" ? "Live Google Directions" : "Pinpoints & Checkpoints"}
        </span>
      </div>

      {/* Active Map View */}
      {mapMode === "google" ? (
        <div className="relative w-full h-[360px] sm:h-[430px] rounded-2xl overflow-hidden border border-[#ebebeb] shadow-xs bg-[#f5f5f5]">
          <iframe
            title="Google Maps Procession Route"
            width="100%"
            height="100%"
            className="border-0 w-full h-full"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={googleEmbedUrl}
          />

          {/* Top overlay badge */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#ebebeb] shadow-md flex items-center space-x-1.5 text-[11px] font-medium text-[#171717]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>Google Maps Route Active</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <ActualLeafletMap
            startPoint={startPoint}
            endPoint={endPoint}
            waypoints={waypoints}
            selectedPoint={selectedPoint}
            onSelectPoint={(point) => setSelectedPoint(point)}
          />
        </div>
      )}

      {/* Interactive Checkpoint Timeline Navigator */}
      <div className="bg-[#fafafa] p-3.5 sm:p-4 rounded-xl border border-[#ebebeb] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#171717] flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Procession Corridor Points (Tap to Locate)</span>
          </span>
          <span className="text-[11px] font-mono text-[#888888]">
            {allPoints.length} Key Landmarks
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {allPoints.map((point, idx) => {
            const isSelected = selectedPoint.name === point.name;
            const isStart = point.type === "start";
            const isEnd = point.type === "end";

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedPoint(point);
                  if (mapMode !== "interactive") {
                    setMapMode("interactive");
                  }
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all shrink-0 cursor-pointer text-left
                  ${
                    isSelected
                      ? "bg-[#171717] text-white border-[#171717] shadow-sm"
                      : "bg-white text-[#404040] border-[#ebebeb] hover:border-[#171717]/40"
                  }
                `}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono
                    ${
                      isSelected
                        ? "bg-white text-[#171717]"
                        : isStart
                        ? "bg-[#0070f3] text-white"
                        : isEnd
                        ? "bg-[#ee0000] text-white"
                        : "bg-[#7928ca] text-white"
                    }
                  `}
                >
                  {isStart ? (
                    <Flag className="w-2.5 h-2.5" />
                  ) : isEnd ? (
                    <MapPin className="w-2.5 h-2.5" />
                  ) : (
                    idx
                  )}
                </div>
                <div>
                  <p className="leading-tight font-semibold truncate max-w-[120px] sm:max-w-[160px]">
                    {point.name}
                  </p>
                  <p className={`text-[10px] leading-none mt-0.5 ${isSelected ? "text-gray-300" : "text-[#888888]"}`}>
                    {point.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start & End Point Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div
          onClick={() => {
            setSelectedPoint(startPoint);
            setMapMode("interactive");
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedPoint.name === startPoint.name
              ? "bg-[#0070f3]/5 border-[#0070f3]/40 ring-1 ring-[#0070f3]/20"
              : "border-[#ebebeb] bg-[#fafafa] hover:bg-white"
          }`}
        >
          <div className="flex items-center space-x-2 text-[#0070f3] font-mono text-[11px] uppercase tracking-wider mb-1">
            <div className="w-2 h-2 rounded-full bg-[#0070f3]" />
            <span>Procession Origin (Start Point)</span>
          </div>
          <p className="font-semibold text-[#171717]">{startPoint.name}</p>
          <p className="text-[#666666] mt-0.5">{startPoint.address || "Main Gathering Hall"}</p>
          <p className="text-[10px] font-mono text-[#888888] mt-2">
            Coordinates: {startPoint.lat.toFixed(4)}, {startPoint.lng.toFixed(4)}
          </p>
        </div>

        <div
          onClick={() => {
            setSelectedPoint(endPoint);
            setMapMode("interactive");
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedPoint.name === endPoint.name
              ? "bg-[#ee0000]/5 border-[#ee0000]/40 ring-1 ring-[#ee0000]/20"
              : "border-[#ebebeb] bg-[#fafafa] hover:bg-white"
          }`}
        >
          <div className="flex items-center space-x-2 text-[#ee0000] font-mono text-[11px] uppercase tracking-wider mb-1">
            <div className="w-2 h-2 rounded-full bg-[#ee0000]" />
            <span>Final Destination (Conclusion)</span>
          </div>
          <p className="font-semibold text-[#171717]">{endPoint.name}</p>
          <p className="text-[#666666] mt-0.5">{endPoint.address || "Memorial Grounds"}</p>
          <p className="text-[10px] font-mono text-[#888888] mt-2">
            Coordinates: {endPoint.lat.toFixed(4)}, {endPoint.lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}
