import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WebcamFrameProps {
  children: ReactNode;
  sepia?: boolean;
  className?: string;
}

export const WebcamFrame = ({ children, sepia, className }: WebcamFrameProps) => {
  return (
    <div className={cn("wood-frame relative rounded-sm overflow-hidden", className)}>
      <span className="rivet-bl" />
      <span className="rivet-br" />
      <div className="relative bg-leather-dark p-1">
        <div
          className={cn(
            "relative aspect-[3/4] sm:aspect-video w-full overflow-hidden bg-black",
            "ring-2 ring-leather/60",
            sepia && "filter-sepia-western"
          )}
        >
          {children}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(0_0%_0%/0.7)_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,hsl(0_0%_0%/0.5)_2px,hsl(0_0%_0%/0.5)_3px)]" />
        </div>
      </div>
    </div>
  );
};
