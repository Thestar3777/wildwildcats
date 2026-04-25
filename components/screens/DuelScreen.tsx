"use client";

import { ReactNode, RefObject } from "react";
import { motion } from "framer-motion";
import { DesertBackdrop } from "@/components/game/DesertBackdrop";
import { WebcamFrame } from "@/components/game/WebcamFrame";
import { Crosshair } from "@/components/game/Crosshair";
import { StateText } from "@/components/game/StateText";
import { FlashOverlay } from "@/components/game/FlashOverlay";

export type DuelPhase = "wait" | "countdown" | "steady" | "draw";

interface DuelScreenProps {
  phase: DuelPhase;
  countdown?: number;
  flash?: boolean;
  shake?: boolean;
  hand?: { x: number; y: number };
  hand2?: { x: number; y: number } | null;
  /**
   * Pass a ref to a <video> element you control. The parent owns the webcam
   * stream — this component will not call getUserMedia.
   */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  players?: 1 | 2;
  children?: ReactNode;
}

const TOP_TEXT_ONE: Record<DuelPhase, string> = {
  wait: "Ready for the Duel?",
  countdown: "Steady your hand…",
  steady: "Prove them you're ready!",
  draw: "DRAW!",
};

const TOP_TEXT_TWO: Record<DuelPhase, string> = {
  wait: "Two outlaws. One winner.",
  countdown: "Eyes locked, hands steady…",
  steady: "Hold yer fire, partners…",
  draw: "DRAW!",
};

/**
 * Pure presentational duel screen. ALL game logic — webcam access, the
 * countdown timer, the random "draw" delay, the reaction-time mock — has
 * been removed. The parent owns:
 *
 *   - the <video> ref + webcam stream
 *   - the `phase` state machine
 *   - countdown values
 *   - flash / shake triggers
 *   - hand-tracking coordinates
 */
export const DuelScreen = ({
  phase,
  countdown,
  flash,
  shake,
  hand = { x: 0.5, y: 0.5 },
  hand2,
  videoRef,
  players = 1,
  children,
}: DuelScreenProps) => {
  const TOP_TEXT = players === 2 ? TOP_TEXT_TWO : TOP_TEXT_ONE;
  const sepia = phase !== "wait";
  const showCrosshair = phase !== "wait";
  const stateForOverlay =
    phase === "countdown"
      ? "countdown"
      : phase === "steady"
      ? "waiting"
      : phase === "draw"
      ? "draw"
      : "idle";

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-8 px-4">
      <DesertBackdrop />
      <FlashOverlay active={!!flash} />

      <motion.h2
        key={phase}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="font-display text-3xl sm:text-5xl text-ink text-center mb-6"
        style={{ textShadow: "2px 2px 0 hsl(42 85% 60%), 4px 4px 12px rgba(0,0,0,0.6)" }}
      >
        {TOP_TEXT[phase]}
      </motion.h2>

      <div className={`w-full max-w-[78%] sm:max-w-3xl mx-auto px-2 sm:px-0 ${shake ? "animate-camera-shake" : ""}`}>
        <WebcamFrame sepia={sepia}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,hsl(28_40%_18%),hsl(20_50%_6%))]" />
          <Crosshair x={hand.x} y={hand.y} active={showCrosshair} />
          {players === 2 && hand2 && (
            <Crosshair x={hand2.x} y={hand2.y} active={showCrosshair} className="hue-rotate-[200deg]" />
          )}
          <StateText state={stateForOverlay} countdown={countdown} />
        </WebcamFrame>
      </div>

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
};
