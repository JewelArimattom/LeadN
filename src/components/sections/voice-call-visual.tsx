"use client";

import { useState, type CSSProperties } from "react";
import { Pause, PhoneCall, Play, UserRound } from "lucide-react";

const audioDots = Array.from({ length: 22 }, (_, index) => index);
const waveform = [12, 21, 34, 25, 45, 30, 18, 38, 24, 44, 30, 18, 36, 25, 14];
type VoiceCallStyle = CSSProperties & {
  "--dot-index"?: number;
  "--wave-height"?: string;
  "--wave-index"?: number;
};

export function VoiceCallVisual() {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className={`voice-call-visual${paused ? " voice-call-visual-paused" : ""}`}
      role="group"
      aria-label="Animated voice call illustration"
    >
      <div className="voice-call-orbit" aria-hidden="true">
        {audioDots.map((dot) => (
          <span key={dot} style={{ "--dot-index": dot } as VoiceCallStyle} />
        ))}
        <div className="voice-call-person">
          <UserRound aria-hidden="true" />
        </div>
      </div>

      <div className="voice-call-waveform" aria-hidden="true">
        {waveform.map((height, index) => (
          <span key={index} style={{ "--wave-height": `${height}px`, "--wave-index": index } as VoiceCallStyle} />
        ))}
      </div>

      <div className="voice-call-controls">
        <span><PhoneCall aria-hidden="true" /> Voice call</span>
        <button
          type="button"
          aria-label={paused ? "Play voice call animation" : "Pause voice call animation"}
          aria-pressed={paused}
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
