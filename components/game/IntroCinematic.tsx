"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroCinematicProps {
  /** Called when the user finishes the intro (clicks Get Started or Skip). */
  onEnter: () => void;
}

type Slide =
  | { kind: "challenge" }
  | { kind: "text"; lines: string[] };

const SLIDES: Slide[] = [
  { kind: "challenge" },
  { kind: "text", lines: ["1880.", "Lexington", "Frontier."] },
  { kind: "text", lines: ["The trail is long", "and the bourbon", "is strong..."] },
  { kind: "text", lines: ["They say a Wildcat's", "strike is the", "fastest thing in", "the West..."] },
  { kind: "text", lines: ["Prove 'em", "right"] },
  { kind: "text", lines: ["Don't blink"] },
  { kind: "text", lines: ["Or you'll", "be history"] },
];

/**
 * Intro cinematic. CLICK to advance through slides — auto-advance timer was
 * removed so this component is pure UI with no game logic.
 *
 * If you want an auto-advance, wrap this component and use a setInterval in
 * the parent that increments the slide index, OR re-add the original useEffect.
 */
export const IntroCinematic = ({ onEnter }: IntroCinematicProps) => {
  const [index, setIndex] = useState(0);

  const advance = () => {
    if (index >= SLIDES.length - 1) onEnter();
    else setIndex((i) => i + 1);
  };

  const skip = () => onEnter();
  const slide = SLIDES[index];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[90] bg-black overflow-hidden"
      onClick={slide.kind === "text" ? advance : undefined}
    >
      {slide.kind === "challenge" && (
        <>
          <motion.div
            key="challenge-bg"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(/wildcat-cowboy-bg.png)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <motion.div
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              background:
                "radial-gradient(ellipse at 30% 70%, hsl(28 90% 55% / 0.35), transparent 55%), radial-gradient(ellipse at 75% 40%, hsl(45 95% 60% / 0.25), transparent 60%)",
            }}
            animate={{ opacity: [0.7, 1, 0.8, 1, 0.75] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <Sparkles />
          <Embers />
          <motion.div
            className="absolute top-0 right-0 pointer-events-none mix-blend-screen"
            style={{
              width: "12%",
              height: "20%",
              background:
                "radial-gradient(circle at 100% 0%, hsl(42 95% 70% / 0.35), hsl(35 90% 55% / 0.1) 30%, transparent 55%)",
            }}
            animate={{ opacity: [0.4, 0.65, 0.45, 0.65, 0.4], scale: [1, 1.04, 1] }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        </>
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative w-full h-full flex items-center justify-center px-6"
        >
          {slide.kind === "challenge" ? (
            <ChallengeSlide onGetStarted={advance} />
          ) : (
            <TextSlide lines={slide.lines} />
          )}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={skip}
        className="absolute top-5 right-5 z-10 font-typewriter text-[10px] tracking-[0.3em] text-white/50 hover:text-white/90 transition-colors uppercase"
      >
        Skip ›
      </button>
    </motion.div>
  );
};

const ChallengeSlide = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="relative flex flex-col items-end justify-start text-right w-full h-full pt-12 sm:pt-16 pr-6 sm:pr-12 px-6">
    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6 }}
      className="font-display text-3xl sm:text-5xl md:text-6xl text-white tracking-wide mb-4 max-w-md"
      style={{
        textShadow:
          "0 2px 4px rgba(0,0,0,0.95), 0 4px 18px rgba(0,0,0,0.85), 0 0 30px rgba(0,0,0,0.6)",
      }}
    >
      Ready for a challenge
    </motion.h2>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="flex items-center gap-3"
    >
      <span
        className="font-display text-xl sm:text-3xl text-white tracking-wide"
        style={{
          textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 4px 18px rgba(0,0,0,0.85)",
        }}
      >
        Made by UK Wildcats?
      </span>
    </motion.div>

    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      onClick={onGetStarted}
      className="mt-8 font-display text-xl sm:text-2xl tracking-widest text-white px-10 py-4 rounded-md border-2 border-white/70 uppercase"
      style={{
        backgroundColor: "rgba(0,0,0,0.35)",
        textShadow: "0 2px 6px rgba(0,0,0,0.8)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      }}
    >
      Get Started
    </motion.button>
  </div>
);

const TextSlide = ({ lines }: { lines: string[] }) => (
  <div className="text-center max-w-4xl">
    {lines.map((line, i) => (
      <motion.div
        key={`${line}-${i}`}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 + i * 0.18, duration: 0.55, ease: "easeOut" }}
        className="font-display text-white leading-[1.05] text-3xl sm:text-5xl md:text-6xl"
        style={{
          textShadow: "0 4px 14px rgba(0,0,0,0.9), 0 0 30px hsl(42 85% 52% / 0.15)",
          letterSpacing: "0.01em",
        }}
      >
        {line}
      </motion.div>
    ))}
  </div>
);

const SPARKLE_COUNT = 28;
const SPARKLES = Array.from({ length: SPARKLE_COUNT }).map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 1.5 + Math.random() * 2.5,
  delay: Math.random() * 4,
  duration: 1.8 + Math.random() * 2.4,
}));

const Sparkles = () => (
  <div className="absolute inset-0 pointer-events-none">
    {SPARKLES.map((s) => (
      <motion.div
        key={s.id}
        className="absolute rounded-full"
        style={{
          left: `${s.left}%`,
          top: `${s.top}%`,
          width: s.size,
          height: s.size,
          background: "hsl(45 100% 80%)",
          boxShadow: "0 0 6px hsl(45 100% 75% / 0.9), 0 0 12px hsl(35 100% 60% / 0.6)",
        }}
        animate={{ opacity: [0, 1, 0], scale: [0.6, 1.4, 0.6] }}
        transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const EMBER_COUNT = 14;
const EMBERS = Array.from({ length: EMBER_COUNT }).map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 6,
  duration: 6 + Math.random() * 6,
  drift: (Math.random() - 0.5) * 60,
}));

const Embers = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {EMBERS.map((e) => (
      <motion.div
        key={e.id}
        className="absolute rounded-full"
        style={{
          left: `${e.left}%`,
          bottom: -20,
          width: e.size,
          height: e.size,
          background: "hsl(28 100% 65%)",
          boxShadow: "0 0 8px hsl(28 100% 60% / 0.9), 0 0 16px hsl(15 100% 50% / 0.55)",
        }}
        animate={{
          y: ["0vh", "-110vh"],
          x: [0, e.drift, 0],
          opacity: [0, 0.9, 0.9, 0],
        }}
        transition={{
          duration: e.duration,
          delay: e.delay,
          repeat: Infinity,
          ease: "easeOut",
          times: [0, 0.15, 0.85, 1],
        }}
      />
    ))}
  </div>
);
