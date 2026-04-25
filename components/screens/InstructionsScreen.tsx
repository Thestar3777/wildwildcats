"use client";

import { motion } from "framer-motion";
import { DesertBackdrop } from "@/components/game/DesertBackdrop";

interface InstructionsScreenProps {
  onContinue: () => void;
  players?: 1 | 2;
}

const RULES_ONE = [
  "Hold yer hand in plain view of the camera.",
  "Wait for the signal — eyes wide, breath steady.",
  "When the screen flashes DRAW! — reach for iron.",
  "Fastest hand wins the bounty. Blink and you'll lose.",
];

const RULES_TWO = [
  "Both outlaws — hands in plain view of the camera.",
  "Stand your ground. Eyes locked, breath steady.",
  "Wait for the signal — no twitchin' early, ya cheat.",
  "When the screen flashes DRAW! — reach for iron.",
  "First hand to draw wins the duel. Loser eats dust.",
];

export const InstructionsScreen = ({ onContinue, players = 1 }: InstructionsScreenProps) => {
  const RULES = players === 2 ? RULES_TWO : RULES_ONE;
  const subtitle =
    players === 2 ? "— Two outlaws, one winner —" : "— Read carefully, partner —";
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-10 px-6">
      <DesertBackdrop />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="paper-texture torn-edges relative w-full max-w-2xl px-10 py-12"
        style={{ boxShadow: "var(--shadow-poster)" }}
      >
        <span className="absolute top-3 left-3 w-3 h-3 rounded-full bg-ink/80 z-10" />
        <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-ink/80 z-10" />

        <header className="text-center mb-6">
          <div className="font-typewriter text-[10px] tracking-[0.4em] text-ink-soft mb-2">
            ★ THE MARSHAL'S CODE ★
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-ink leading-none">
            Instructions
          </h1>
          <div className="font-stamp text-2xl text-blood mt-1">{subtitle}</div>
        </header>

        <ol className="font-typewriter text-ink space-y-4 text-base sm:text-lg pl-2">
          {RULES.map((rule, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="border-b border-dashed border-ink/40 pb-3 flex gap-3"
            >
              <span className="font-display text-blood text-xl">{i + 1}.</span>
              <span>{rule}</span>
            </motion.li>
          ))}
        </ol>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onContinue}
            className="stamp-btn font-display text-2xl tracking-widest px-10 py-4 rounded-md border-2 border-ink/40"
          >
            <span className="relative z-[1]">I'M READY</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
