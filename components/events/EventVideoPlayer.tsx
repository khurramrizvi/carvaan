"use client";

import React from "react";
import { Tv, ExternalLink, Play, Radio } from "lucide-react";

interface EventVideoPlayerProps {
  videoUrl?: string;
  title?: string;
  isLive?: boolean;
}

/**
 * Extracts standard YouTube Embed URL from any valid YouTube format:
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/embed/ID
 */
export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}?rel=0&modestbranding=1`;
  }
  if (url.includes("embed")) {
    return url;
  }
  return null;
}

export function EventVideoPlayer({
  videoUrl = "https://www.youtube.com/watch?v=ss-HcTBup88",
  title = "Official Event Live Stream & Coverage",
  isLive = false,
}: EventVideoPlayerProps) {
  const effectiveUrl = videoUrl || "https://www.youtube.com/watch?v=ss-HcTBup88";
  const embedUrl = getYouTubeEmbedUrl(effectiveUrl);

  return (
    <div className="bg-white rounded-2xl border border-[#ebebeb] p-5 sm:p-6 space-y-4 shadow-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0070f3]/10 text-[#0070f3] flex items-center justify-center shrink-0 border border-[#0070f3]/20">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#171717]">{title}</h3>
            <p className="text-xs text-[#666666]">
              Real-time media telemetry & verified on-ground feed
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {isLive ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#ee0000]/10 text-[#ee0000] border border-[#ee0000]/25">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ee0000] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ee0000]"></span>
              </span>
              <span>LIVE TRANSMISSION</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#fafafa] text-[#666666] border border-[#ebebeb]">
              <Play className="w-3 h-3 text-[#0070f3]" />
              <span>RECORDED STREAM</span>
            </span>
          )}

          <a
            href={effectiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-xs font-medium text-[#666666] hover:text-[#0070f3] transition-colors p-1.5 rounded-lg hover:bg-[#fafafa]"
            title="Open in YouTube"
          >
            <span className="hidden sm:inline">YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Video Container (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#262626] shadow-sm">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-2 p-6 text-center">
            <Radio className="w-8 h-8 text-gray-500 animate-pulse" />
            <p className="text-sm font-medium text-white">Stream Unavailable</p>
            <p className="text-xs text-gray-400 max-w-xs">
              The broadcast URL provided could not be parsed into an embed player.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-[#888888] font-mono pt-1 border-t border-[#ebebeb]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          <span>720p / 1080p Stream Synchronization</span>
        </div>
        <div className="text-right">
          Official Media Cell Coverage
        </div>
      </div>
    </div>
  );
}
