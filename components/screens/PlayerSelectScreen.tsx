"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DesertBackdrop } from "@/components/game/DesertBackdrop";

interface PlayerSelectScreenProps {
  /** Called when both players have tapped READY. */
  onReady: () => void;
  onBack: () => void;
}

const KENTUCKY_BLUE = "hsl(218 100% 32%)";

export const PlayerSelectScreen = ({ onReady, onBack }: PlayerSelectScreenProps) => {
  const [p1, setP1] = useState(false);
  const [p2, setP2] = useState(false);
  const both = p1 && p2;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-10 px-6">
      <DesertBackdrop />

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl sm:text-5xl text-ink mb-10 text-center"
        style={{ textShadow: "2px 2px 0 hsl(42 85% 60%), 4px 4px 12px rgba(0,0,0,0.5)" }}
      >
        Saddle Up, Partners
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
        <PlayerCard label="Player 1" ready={p1} onToggle={() => setP1((v) => !v)} />
        <PlayerCard label="Player 2" ready={p2} onToggle={() => setP2((v) => !v)} />
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
        <button
          onClick={onReady}
          disabled={!both}
          className="stamp-btn font-display text-2xl tracking-widest px-10 py-5 rounded-md border-2 border-ink/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-[1]">{both ? "TO THE DUEL" : "Both must be ready"}</span>
        </button>
        <button
          onClick={onBack}
          className="font-typewriter text-xs uppercase tracking-widest text-parchment hover:text-white transition-colors underline underline-offset-4"
        >
          ← Back to Lobby
        </button>
      </div>
    </div>
  );
};

const PlayerCard = ({
  label,
  ready,
  onToggle,
}: {
  label: string;
  ready: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className="paper-texture torn-edges relative px-6 py-8 text-center transition-transform hover:-translate-y-1"
    style={{ boxShadow: "var(--shadow-poster)" }}
  >
    <div className="font-display text-3xl text-ink mb-3">{label}</div>
    <div
      className="inline-block font-display text-xl px-4 py-2 rounded text-white"
      style={{
        backgroundColor: ready ? KENTUCKY_BLUE : "hsl(20 30% 35%)",
        boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
      }}
    >
      {ready ? "READY!" : "Tap when ready"}
    </div>
  </button>
);
