"use client";

import { motion } from "framer-motion";
import { DesertBackdrop } from "@/components/game/DesertBackdrop";
import { ResultTelegram } from "@/components/game/ResultTelegram";

interface ResultScreenProps {
  reactionMs: number;
  reactionMs2?: number;
  players?: 1 | 2;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

const rankFromMs = (ms: number) => {
  if (ms < 300) return { label: "Legendary Wildcat ", score: 5000 };
  if (ms <= 500) return { label: "Limestone Legend", score: 2500 };
  return { label: "Slow-poke Steer", score: 500 };
};

export const ResultScreen = ({
  reactionMs,
  reactionMs2,
  players = 1,
  onPlayAgain,
  onMainMenu,
}: ResultScreenProps) => {
  const isTwoPlayer = players === 2 && typeof reactionMs2 === "number";

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-10 px-6">
      <DesertBackdrop />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full max-w-xl"
      >
        {isTwoPlayer ? (
          <HeadToHeadCard p1={reactionMs} p2={reactionMs2!} />
        ) : (
          <>
            <ResultTelegram reactionMs={reactionMs} />
            <SinglePlayerScore reactionMs={reactionMs} />
          </>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={onPlayAgain}
          className="stamp-btn font-display text-xl tracking-widest px-8 py-4 rounded-md border-2 border-ink/40"
        >
          <span className="relative z-[1]">PLAY AGAIN</span>
        </button>
        <button
          onClick={onMainMenu}
          className="stamp-btn font-display text-xl tracking-widest px-8 py-4 rounded-md border-2 border-ink/40"
        >
          <span className="relative z-[1]">MAIN MENU</span>
        </button>
      </motion.div>
    </div>
  );
};

const SinglePlayerScore = ({ reactionMs }: { reactionMs: number }) => {
  const rank = rankFromMs(reactionMs);
  return (
    <div
      className="mt-6 paper-texture torn-edges px-6 py-5 text-center"
      style={{ boxShadow: "var(--shadow-poster)" }}
    >
      <div className="font-typewriter text-xs tracking-[0.3em] text-ink-soft mb-1">RANK</div>
      <div className="font-display text-2xl text-ink">{rank.label}</div>
      <div className="font-display text-3xl text-blood mt-1">SCORE: {rank.score}</div>
    </div>
  );
};

const HeadToHeadCard = ({ p1, p2 }: { p1: number; p2: number }) => {
  const winner = p1 <= p2 ? 1 : 2;
  const gap = Math.abs(p1 - p2);

  return (
    <div
      className="paper-texture torn-edges relative px-8 py-7 font-typewriter"
      style={{ boxShadow: "var(--shadow-poster)" }}
    >
      <div className="flex items-center justify-between border-b-2 border-ink/40 pb-3 mb-5">
        <div className="font-display text-xl tracking-wider text-ink">WESTERN UNION</div>
        <div className="text-xs text-ink-soft tracking-widest">DUEL · 2P</div>
      </div>

      <div className="text-[11px] uppercase tracking-[0.25em] text-ink-soft text-center mb-2">
        — HEAD-TO-HEAD VERDICT —
      </div>
      <div className="font-display text-3xl sm:text-4xl text-blood text-center mb-1">
        PLAYER {winner} WINS!
      </div>
      <div className="text-sm text-ink-soft italic text-center mb-5">
        {gap >= 9000 ? "Left the other outlaw in the dust." : `Beat the other outlaw by ${gap} ms.`}
      </div>

      <div className="grid grid-cols-2 gap-4 border-y border-dashed border-ink/40 py-4">
        <PlayerSlot label="Player 1" ms={p1} winner={winner === 1} />
        <PlayerSlot label="Player 2" ms={p2} winner={winner === 2} align="right" />
      </div>

      <div className="flex items-center justify-between mt-4 text-[10px] tracking-widest text-ink-soft">
        <span>STOP · FASTEST HAND IN LEXINGTON · STOP</span>
      </div>

      <div className="absolute -right-3 -bottom-3 sm:right-4 sm:bottom-4 rotate-[-14deg] opacity-80">
        <div className="border-4 border-blood rounded-full px-3 py-1 font-display text-blood text-sm tracking-widest">
          {winner === 1 ? "P1 WINS" : "P2 WINS"}
        </div>
      </div>
    </div>
  );
};

const PlayerSlot = ({
  label,
  ms,
  winner,
  align = "left",
}: {
  label: string;
  ms: number;
  winner: boolean;
  align?: "left" | "right";
}) => {
  const dnf = ms >= 9999;
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="text-[10px] uppercase tracking-widest text-ink-soft">{label}</div>
      <div className={`font-display text-3xl ${winner ? "text-blood" : "text-ink"}`}>
        {dnf ? "—" : ms}
        {!dnf && <span className="text-base text-ink-soft"> ms</span>}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-ink-soft mt-1">
        {winner ? "★ WINNER ★" : dnf ? "Too slow" : "Eats dust"}
      </div>
    </div>
  );
};
