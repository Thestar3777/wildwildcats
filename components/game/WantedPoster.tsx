import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WantedPosterProps {
  children: ReactNode;
  className?: string;
  shake?: boolean;
}

export const WantedPoster = ({ children, className, shake }: WantedPosterProps) => {
  return (
    <div
      className={cn(
        "paper-texture torn-edges relative w-full max-w-3xl mx-auto px-6 py-8 sm:px-12 sm:py-12",
        "animate-sway",
        shake && "animate-camera-shake",
        className
      )}
      style={{ boxShadow: "var(--shadow-poster)" }}
    >
      <span className="absolute top-3 left-3 w-3 h-3 rounded-full bg-ink/80 shadow-[inset_0_-1px_2px_hsl(0_0%_0%/0.6),0_1px_2px_hsl(0_0%_0%/0.5)] z-10" />
      <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-ink/80 shadow-[inset_0_-1px_2px_hsl(0_0%_0%/0.6),0_1px_2px_hsl(0_0%_0%/0.5)] z-10" />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
};
