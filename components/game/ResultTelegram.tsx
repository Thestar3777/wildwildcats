import { cn } from "@/lib/utils";

interface ResultTelegramProps {
  reactionMs: number;
  className?: string;
}

const verdict = (ms: number) => {
  if (ms < 300)
    return {
      title: "Legendary Wildcat ",
      note: "Faster than a rattlesnake's whisper.",
      bounty: "$5,000",
    };
  if (ms <= 500)
    return {
      title: "Limestone Legend",
      note: "Earned your spurs, partner.",
      bounty: "$2,500",
    };
  return {
    title: "Slow-poke Steer",
    note: "Better keep practicin'.",
    bounty: "$500",
  };
};

export const ResultTelegram = ({ reactionMs, className }: ResultTelegramProps) => {
  const v = verdict(reactionMs);
  const stamp = new Date().toUTCString().slice(5, 22);

  return (
    <div className={cn("animate-fade-up w-full max-w-md mx-auto", className)}>
      <div className="telegram-card paper-texture torn-edges relative px-8 py-7 font-typewriter">
        <div className="flex items-center justify-between border-b-2 border-ink/40 pb-3 mb-4">
          <div className="font-display text-xl tracking-wider text-ink">WESTERN UNION</div>
          <div className="text-xs text-ink-soft tracking-widest">N° 0427</div>
        </div>

        <div className="text-[11px] uppercase tracking-[0.25em] text-ink-soft mb-1">— WINNER · BOUNTY NOTICE —</div>
        <div
          className="font-display text-3xl sm:text-4xl text-shadow-ink mb-1"
          style={{ color: "hsl(var(--ink))" }}
        >
          {v.title}
        </div>
        <div className="text-sm text-ink-soft mb-5 italic">"{v.note}"</div>

        <div className="grid grid-cols-2 gap-4 border-y border-dashed border-ink/40 py-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink-soft">Reaction Time</div>
            <div className="font-display text-3xl text-blood">
              {reactionMs} <span className="text-base text-ink-soft">ms</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-ink-soft">Reward</div>
            <div className="font-display text-3xl text-ink">{v.bounty}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 text-[10px] tracking-widest text-ink-soft">
          <span>STOP · DEAD OR ALIVE · STOP</span>
          <span>{stamp}</span>
        </div>

        <div className="absolute -right-3 -bottom-3 sm:right-4 sm:bottom-4 rotate-[-14deg] opacity-80">
          <div className="border-4 border-blood rounded-full px-3 py-1 font-display text-blood text-sm tracking-widest">
            APPROVED
          </div>
        </div>
      </div>
    </div>
  );
};
