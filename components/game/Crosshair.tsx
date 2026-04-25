import { cn } from "@/lib/utils";

interface CrosshairProps {
  /** 0..1 normalized coordinates */
  x: number;
  y: number;
  active?: boolean;
  className?: string;
}

export const Crosshair = ({ x, y, active = true, className }: CrosshairProps) => {
  if (!active) return null;
  return (
    <div
      className={cn(
        "pointer-events-none absolute z-20 transition-[left,top] duration-150 ease-out",
        "animate-crosshair",
        className
      )}
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
      }}
    >
      <svg width="84" height="84" viewBox="0 0 84 84" className="drop-shadow-[0_0_8px_hsl(var(--rust-glow)/0.8)]">
        <circle cx="42" cy="42" r="30" fill="none" stroke="hsl(var(--gold))" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="42" cy="42" r="18" fill="none" stroke="hsl(var(--rust-glow))" strokeWidth="1.5" />
        <circle cx="42" cy="42" r="2.5" fill="hsl(var(--rust-glow))" />
        <line x1="42" y1="0" x2="42" y2="22" stroke="hsl(var(--gold))" strokeWidth="2" />
        <line x1="42" y1="62" x2="42" y2="84" stroke="hsl(var(--gold))" strokeWidth="2" />
        <line x1="0" y1="42" x2="22" y2="42" stroke="hsl(var(--gold))" strokeWidth="2" />
        <line x1="62" y1="42" x2="84" y2="42" stroke="hsl(var(--gold))" strokeWidth="2" />
      </svg>
    </div>
  );
};
