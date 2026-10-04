"use client";

import React, { useState } from "react";
import { GeoPoint } from "@/types/event";
import { MapPin, Navigation, Compass, ExternalLink, Flag, Info } from "lucide-react";

interface RouteMapProps {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  waypoints?: GeoPoint[];
  title?: string;
}

export function RouteMap({
  startPoint,
  endPoint,
  waypoints = [],
  title = "Procession Route",
}: RouteMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<GeoPoint>(startPoint);

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${startPoint.lat},${startPoint.lng}&destination=${endPoint.lat},${endPoint.lng}`;

  const allPoints = [
    { ...startPoint, type: "start", label: "Start Point" },
    ...waypoints.map((w, i) => ({ ...w, type: "waypoint", label: `Checkpoint ${i + 1}` })),
    { ...endPoint, type: "end", label: "Destination" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#ebebeb] p-6 space-y-5 font-sans shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-[#0070f3]" />
            <h3 className="text-base font-semibold tracking-tight text-[#171717]">{title}</h3>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            Verified corridor plotted from starting Imambargah to destination
          </p>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-[#ebebeb] bg-white text-xs font-medium text-[#171717] hover:bg-[#fafafa] transition-all w-fit shadow-xs"
        >
          <Navigation className="w-3.5 h-3.5 text-[#0070f3]" />
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3 h-3 text-[#888888]" />
        </a>
      </div>

      {/* Visual Route Canvas */}
      <div className="relative bg-[#111111] rounded-xl p-4 sm:p-6 overflow-hidden text-white min-h-[220px] flex flex-col justify-between border border-[#262626]">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 w-full my-auto py-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between relative min-w-[320px] sm:min-w-0 px-2">
            <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-gradient-to-r from-[#00dfd8] via-[#7928ca] to-[#ff0080] rounded-full" />

            {allPoints.map((point, idx) => {
              const isSelected = selectedPoint.name === point.name;
              const isStart = point.type === "start";
              const isEnd = point.type === "end";

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPoint(point)}
                  className="group relative z-20 flex flex-col items-center focus:outline-none cursor-pointer shrink-0"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all
                      ${
                        isStart
                          ? "bg-[#0070f3] border-white text-white"
                          : isEnd
                          ? "bg-[#ee0000] border-white text-white"
                          : "bg-[#7928ca] border-white text-white"
                      }
                      ${isSelected ? "scale-125 ring-4 ring-white/30" : "hover:scale-110"}
                    `}
                  >
                    {isStart ? (
                      <Flag className="w-3.5 h-3.5" />
                    ) : isEnd ? (
                      <MapPin className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-xs font-mono font-medium">{idx}</span>
                    )}
                  </div>

                  <span className="mt-2 text-[11px] font-mono text-[#888888] group-hover:text-white max-w-[80px] sm:max-w-[90px] text-center truncate">
                    {point.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <Info className="w-4 h-4 text-[#00dfd8] shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-white truncate">{selectedPoint.name}</span>
              {selectedPoint.address && (
                <span className="text-[#888888] ml-1.5 hidden sm:inline-block">
                  ({selectedPoint.address})
                </span>
              )}
            </div>
          </div>
          <span className="text-[#888888] font-mono text-[11px] shrink-0">
            {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-4 rounded-xl border border-[#ebebeb] bg-[#fafafa]">
          <div className="flex items-center space-x-2 text-[#0070f3] font-mono text-[11px] uppercase tracking-wider mb-1">
            <div className="w-2 h-2 rounded-full bg-[#0070f3]" />
            <span>Procession Origin (Start)</span>
          </div>
          <p className="font-semibold text-[#171717]">{startPoint.name}</p>
          <p className="text-[#666666] mt-0.5">{startPoint.address || "Main Gathering Hall"}</p>
        </div>

        <div className="p-4 rounded-xl border border-[#ebebeb] bg-[#fafafa]">
          <div className="flex items-center space-x-2 text-[#ee0000] font-mono text-[11px] uppercase tracking-wider mb-1">
            <div className="w-2 h-2 rounded-full bg-[#ee0000]" />
            <span>Final Destination (Conclusion)</span>
          </div>
          <p className="font-semibold text-[#171717]">{endPoint.name}</p>
          <p className="text-[#666666] mt-0.5">{endPoint.address || "Memorial Grounds"}</p>
        </div>
      </div>
    </div>
  );
}
