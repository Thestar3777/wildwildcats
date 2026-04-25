import { cn } from "@/lib/utils";

type GameState = "idle" | "countdown" | "waiting" | "draw" | "result";

interface StateTextProps {
  state: GameState;
  countdown?: number;
}

export const StateText = ({ state, countdown }: StateTextProps) => {
  if (state === "idle") return null;

  if (state === "countdown") {
    return (
      <div
        key={`cd-${countdown}`}
        className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
      >
        <span className="font-display text-[8rem] sm:text-[10rem] leading-none text-gold text-shadow-stamp animate-zoom-stamp">
          {countdown}
        </span>
      </div>
    );
  }

  if (state === "waiting") {
    return (
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        <span className="font-display text-3xl sm:text-5xl text-parchment text-shadow-stamp tracking-[0.3em] animate-ticker">
          STEADY...
        </span>
      </div>
    );
  }

  if (state === "draw") {
    return (
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        <span
          className={cn(
            "font-display text-6xl sm:text-9xl text-blood text-shadow-stamp",
            "animate-draw-burst tracking-widest"
          )}
          style={{ textShadow: "0 0 30px hsl(var(--rust-glow)), 4px 4px 0 hsl(var(--ink))" }}
        >
          DRAW!
        </span>
      </div>
    );
  }

  return null;
};
