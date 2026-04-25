"use client";

import { motion } from "framer-motion";
import { DesertBackdrop } from "@/components/game/DesertBackdrop";

interface LobbyScreenProps {
  /** Wire to your Next.js navigation, e.g. router.push('/play'). */
  onOnePlayer: () => void;
  onTwoPlayers: () => void;
}

export const LobbyScreen = ({ onOnePlayer, onTwoPlayers }: LobbyScreenProps) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center gap-16 py-10 px-6">
      <DesertBackdrop />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <h2
          className="font-display text-xl sm:text-3xl tracking-wide text-ink mb-[20px]"
          style={{ textShadow: "2px 2px 0 hsl(38 80% 70%), 4px 4px 8px rgba(0,0,0,0.4)" }}
        >
          Blink &amp; you'll lose
        </h2>

        <div className="text-center">
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl leading-none text-ink flex justify-center gap-x-6">
            <StampWord text="Wild" delay={0.2} />
            <StampWord text="Wild" delay={0.7} />
          </h1>
          <h1 className="font-display text-6xl sm:text-8xl md:text-9xl leading-none text-blood mt-1">
            <StampWord text="CATS!" delay={1.2} color="blood" />
          </h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-5 mb-6"
      >
        <CoinButton label="1 Player" onClick={onOnePlayer} />
        <CoinButton label="2 Players" onClick={onTwoPlayers} />
      </motion.div>
    </div>
  );
};

const StampWord = ({
  text,
  delay,
  color = "ink",
}: {
  text: string;
  delay: number;
  color?: "ink" | "blood";
}) => (
  <motion.span
    initial={{ scale: 4, opacity: 0, rotate: -12, filter: "blur(8px)" }}
    animate={{ scale: 1, opacity: 1, rotate: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.45, delay, ease: [0.34, 1.56, 0.64, 1] }}
    className="inline-block"
    style={{
      textShadow:
        color === "blood"
          ? "3px 3px 0 hsl(42 85% 60%), 6px 6px 0 hsl(20 60% 25%), 8px 10px 24px rgba(0,0,0,0.65)"
          : "3px 3px 0 hsl(42 85% 60%), 6px 6px 0 hsl(20 60% 25%), 8px 10px 20px rgba(0,0,0,0.6)",
    }}
  >
    {text}
  </motion.span>
);

const CoinButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="stamp-btn font-display text-2xl sm:text-3xl tracking-widest px-10 py-5 rounded-full select-none cursor-pointer border-2 border-ink/40"
  >
    <span className="relative z-[1]">{label}</span>
  </button>
);
