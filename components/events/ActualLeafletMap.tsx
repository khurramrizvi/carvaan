"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { GeoPoint } from "@/types/event";
import { Navigation, LocateFixed, Layers } from "lucide-react";

interface ActualLeafletMapProps {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  waypoints?: GeoPoint[];
  selectedPoint?: GeoPoint | null;
  onSelectPoint?: (point: GeoPoint) => void;
}

export default function ActualLeafletMap({
  startPoint,
  endPoint,
  waypoints = [],
  selectedPoint,
  onSelectPoint,
}: ActualLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  const [activeTileType, setActiveTileType] = useState<"voyager" | "osm">("voyager");
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization if already exists
    if (mapInstanceRef.current) return;

    const startLat = startPoint?.lat || 28.6139;
    const startLng = startPoint?.lng || 77.209;

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: 14,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Default Tile Layer: CartoDB Voyager (clean, modern, highly legible street map)
    const voyagerTiles = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: "abcd",
      }
    );

    voyagerTiles.addTo(map);
    tileLayerRef.current = voyagerTiles;

    // Custom DivIcons
    const startIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative flex flex-col items-center cursor-pointer group">
          <div class="px-2 py-0.5 rounded-full bg-[#0070f3] text-white text-[10px] font-bold tracking-wider uppercase shadow-md border border-white whitespace-nowrap mb-1">
            START
          </div>
          <div class="w-8 h-8 rounded-full bg-[#0070f3] text-white flex items-center justify-center shadow-lg border-2 border-white ring-3 ring-[#0070f3]/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
          </div>
          <div class="w-2 h-2 bg-[#0070f3] rotate-45 -mt-1 border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [80, 58],
      iconAnchor: [40, 58],
      popupAnchor: [0, -58],
    });

    const endIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="relative flex flex-col items-center cursor-pointer group">
          <div class="px-2 py-0.5 rounded-full bg-[#ee0000] text-white text-[10px] font-bold tracking-wider uppercase shadow-md border border-white whitespace-nowrap mb-1">
            DESTINATION
          </div>
          <div class="w-8 h-8 rounded-full bg-[#ee0000] text-white flex items-center justify-center shadow-lg border-2 border-white ring-3 ring-[#ee0000]/30 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div class="w-2 h-2 bg-[#ee0000] rotate-45 -mt-1 border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [96, 58],
      iconAnchor: [48, 58],
      popupAnchor: [0, -58],
    });

    const createWaypointIcon = (index: number) =>
      L.divIcon({
        className: "custom-leaflet-marker",
        html: `
        <div class="relative flex flex-col items-center cursor-pointer group">
          <div class="w-7 h-7 rounded-full bg-[#7928ca] text-white font-mono font-bold text-xs flex items-center justify-center shadow-md border-2 border-white ring-2 ring-[#7928ca]/30">
            ${index}
          </div>
          <div class="w-1.5 h-1.5 bg-[#7928ca] rotate-45 -mt-0.5 border-r border-b border-white"></div>
        </div>
      `,
        iconSize: [30, 36],
        iconAnchor: [15, 36],
        popupAnchor: [0, -36],
      });

    // All route points in sequence
    const routeCoords: [number, number][] = [
      [startPoint.lat, startPoint.lng],
      ...waypoints.map((w): [number, number] => [w.lat, w.lng]),
      [endPoint.lat, endPoint.lng],
    ];

    // Build Route Polylines (Casing line + Inner colored line for crisp aesthetic)
    L.polyline(routeCoords, {
      color: "#0051b3",
      weight: 8,
      opacity: 0.35,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    const innerPolyline = L.polyline(routeCoords, {
      color: "#0070f3",
      weight: 5,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
      dashArray: "1, 10",
    }).addTo(map);

    polylineRef.current = innerPolyline;

    // Helper for popup content
    const createPopupContent = (title: string, sub: string, type: "start" | "waypoint" | "end", lat: number, lng: number) => {
      const typeBadge =
        type === "start"
          ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0070f3]/10 text-[#0070f3] border border-[#0070f3]/25 uppercase font-mono">Origin Point</span>`
          : type === "end"
          ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ee0000]/10 text-[#ee0000] border border-[#ee0000]/25 uppercase font-mono">Final Destination</span>`
          : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7928ca]/10 text-[#7928ca] border border-[#7928ca]/25 uppercase font-mono">Route Checkpoint</span>`;

      return `
        <div class="p-3.5 space-y-2 text-[#171717] min-w-[200px] font-sans">
          <div class="flex items-center justify-between gap-2">
            ${typeBadge}
            <span class="text-[10px] font-mono text-[#888888]">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
          </div>
          <div>
            <h4 class="font-bold text-xs text-[#171717] leading-tight">${title}</h4>
            <p class="text-[11px] text-[#666666] mt-0.5 leading-snug">${sub}</p>
          </div>
          <div class="pt-2 border-t border-[#f0f0f0] flex items-center justify-between">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
              target="_blank" 
              rel="noreferrer"
              class="inline-flex items-center space-x-1 text-[11px] font-medium text-[#0070f3] hover:underline"
            >
              <span>Get Directions</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      `;
    };

    // Add Start Marker
    const startMarker = L.marker([startPoint.lat, startPoint.lng], { icon: startIcon }).addTo(map);
    startMarker.bindPopup(
      createPopupContent(startPoint.name, startPoint.address || "Main Assembly Area", "start", startPoint.lat, startPoint.lng)
    );
    startMarker.on("click", () => {
      onSelectPoint?.(startPoint);
    });
    markersRef.current["start"] = startMarker;

    // Add Waypoint Markers
    waypoints.forEach((wp, idx) => {
      const wpMarker = L.marker([wp.lat, wp.lng], { icon: createWaypointIcon(idx + 1) }).addTo(map);
      wpMarker.bindPopup(
        createPopupContent(wp.name, wp.address || `Intermediate Stop #${idx + 1}`, "waypoint", wp.lat, wp.lng)
      );
      wpMarker.on("click", () => {
        onSelectPoint?.(wp);
      });
      markersRef.current[`wp-${idx}`] = wpMarker;
    });

    // Add End Marker
    const endMarker = L.marker([endPoint.lat, endPoint.lng], { icon: endIcon }).addTo(map);
    endMarker.bindPopup(
      createPopupContent(endPoint.name, endPoint.address || "Procession Memorial Grounds", "end", endPoint.lat, endPoint.lng)
    );
    endMarker.on("click", () => {
      onSelectPoint?.(endPoint);
    });
    markersRef.current["end"] = endMarker;

    // Fit map bounds to encompass all points comfortably
    const bounds = L.latLngBounds(routeCoords);
    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 16,
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [startPoint, endPoint, waypoints, onSelectPoint]);

  // Handle switching between map tile layers
  const toggleMapTile = (type: "voyager" | "osm") => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let newLayer: L.TileLayer;
    if (type === "osm") {
      newLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
    } else {
      newLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: "abcd",
      });
    }

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
    setActiveTileType(type);
  };

  // Recenter map view to bounds
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const routeCoords: [number, number][] = [
      [startPoint.lat, startPoint.lng],
      ...waypoints.map((w): [number, number] => [w.lat, w.lng]),
      [endPoint.lat, endPoint.lng],
    ];

    const bounds = L.latLngBounds(routeCoords);
    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 16,
    });
  };

  // Fly to point when selectedPoint changes
  useEffect(() => {
    if (!selectedPoint || !mapInstanceRef.current) return;

    mapInstanceRef.current.flyTo([selectedPoint.lat, selectedPoint.lng], 16, {
      duration: 1.2,
    });

    // Open matching popup
    if (selectedPoint.lat === startPoint.lat && selectedPoint.lng === startPoint.lng) {
      markersRef.current["start"]?.openPopup();
    } else if (selectedPoint.lat === endPoint.lat && selectedPoint.lng === endPoint.lng) {
      markersRef.current["end"]?.openPopup();
    } else {
      const idx = waypoints.findIndex(
        (w) => w.lat === selectedPoint.lat && w.lng === selectedPoint.lng
      );
      if (idx !== -1) {
        markersRef.current[`wp-${idx}`]?.openPopup();
      }
    }
  }, [selectedPoint, startPoint, endPoint, waypoints]);

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-[#ebebeb] shadow-xs">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end space-y-2">
        {/* Recenter Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="p-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#ebebeb] text-[#171717] hover:bg-[#fafafa] shadow-md transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-medium"
          title="Recenter Route Corridor"
        >
          <LocateFixed className="w-4 h-4 text-[#0070f3]" />
          <span className="hidden sm:inline">Recenter Route</span>
        </button>

        {/* Tile Style Switcher */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 border border-[#ebebeb] shadow-md flex items-center text-xs">
          <button
            type="button"
            onClick={() => toggleMapTile("voyager")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer text-[11px]
              ${activeTileType === "voyager" ? "bg-[#171717] text-white shadow-xs" : "text-[#666666] hover:text-[#171717]"}
            `}
          >
            Clean Map
          </button>
          <button
            type="button"
            onClick={() => toggleMapTile("osm")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer text-[11px]
              ${activeTileType === "osm" ? "bg-[#171717] text-white shadow-xs" : "text-[#666666] hover:text-[#171717]"}
            `}
          >
            OSM
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend / Quick Stats */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-[#ebebeb] shadow-lg flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0070f3] ring-2 ring-[#0070f3]/30" />
              <span className="font-medium text-[#171717] truncate max-w-[90px] sm:max-w-[140px]">
                {startPoint.name}
              </span>
            </div>
            <span className="text-[#a3a3a3]">→</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ee0000] ring-2 ring-[#ee0000]/30" />
              <span className="font-medium text-[#171717] truncate max-w-[90px] sm:max-w-[140px]">
                {endPoint.name}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#fafafa] border border-[#ebebeb] text-[#666666] hidden sm:inline-block">
              {waypoints.length + 2} Checkpoints
            </span>
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${startPoint.lat},${startPoint.lng}&destination=${endPoint.lat},${endPoint.lng}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#0070f3] text-white text-xs font-medium hover:bg-[#0060df] transition-colors flex items-center space-x-1 shadow-xs"
              title="Navigate in Google Maps"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Directions</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
