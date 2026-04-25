import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DesertBackdropProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Full-screen pure-CSS desert landscape: gradient sky, layered mountains,
 * dunes and silhouetted cacti. Sits behind every screen.
 */
export const DesertBackdrop = ({ children, className }: DesertBackdropProps) => {
  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
      {/* Sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, hsl(28 65% 65%) 0%, hsl(22 80% 58%) 35%, hsl(18 75% 48%) 60%, hsl(30 55% 38%) 100%)",
        }}
      />
      {/* Sun */}
      <div
        className="absolute left-1/2 top-[22%] -translate-x-1/2 w-56 h-56 rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(circle, hsl(48 100% 75%) 0%, hsl(42 95% 60%) 50%, transparent 75%)",
          filter: "blur(2px)",
        }}
      />

      {/* Atmospheric haze behind mountains */}
      <div
        className="absolute bottom-[26%] left-0 right-0 h-[20%] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, hsl(28 50% 55% / 0.35) 60%, hsl(24 45% 45% / 0.5) 100%)",
          filter: "blur(12px)",
        }}
      />

      {/* Far mountains — hazy silhouette with darker outline */}
      <svg
        className="absolute bottom-[28%] left-0 w-full h-[35%]"
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
        style={{ filter: "blur(2px)", opacity: 0.85 }}
      >
        <defs>
          <linearGradient id="farMtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(20 35% 22%)" />
            <stop offset="100%" stopColor="hsl(18 40% 14%)" />
          </linearGradient>
        </defs>
        <path
          d="M0,300 C80,220 140,180 200,190 C260,200 300,150 360,140 C420,130 480,180 540,170 C600,160 660,120 720,130 C780,140 840,180 900,170 C960,160 1020,140 1080,150 C1140,160 1180,180 1200,190 L1200,300 Z"
          fill="url(#farMtn)"
          stroke="hsl(15 50% 8%)"
          strokeWidth="2.5"
        />
      </svg>

      {/* Near mountains — very dark, sharp outline */}
      <svg
        className="absolute bottom-[20%] left-0 w-full h-[28%]"
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
        style={{ filter: "blur(0.8px)" }}
      >
        <defs>
          <linearGradient id="nearMtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(15 45% 14%)" />
            <stop offset="100%" stopColor="hsl(12 55% 6%)" />
          </linearGradient>
        </defs>
        <path
          d="M0,300 C100,240 180,200 280,210 C380,220 440,180 540,190 C640,200 720,230 820,215 C920,200 1000,220 1100,210 C1160,205 1190,215 1200,220 L1200,300 Z"
          fill="url(#nearMtn)"
          stroke="hsl(10 60% 4%)"
          strokeWidth="3"
        />
      </svg>

      {/* Sand dunes — soft rolling base */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[28%]"
        style={{
          background:
            "linear-gradient(180deg, hsl(38 70% 50%) 0%, hsl(32 65% 38%) 60%, hsl(24 60% 22%) 100%)",
        }}
      />
      {/* Wavy back dune */}
      <svg
        className="absolute bottom-[20%] left-0 w-full h-[18%]"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ filter: "blur(1.2px)" }}
      >
        <path
          d="M0,90 C90,55 180,75 280,60 C380,45 460,85 560,70 C660,55 740,30 850,45 C960,60 1050,80 1140,55 C1180,45 1195,55 1200,60 L1200,120 L0,120 Z"
          fill="hsl(34 68% 46%)"
        />
      </svg>
      {/* Mid dune */}
      <svg
        className="absolute bottom-[12%] left-0 w-full h-[16%]"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ filter: "blur(0.8px)" }}
      >
        <path
          d="M0,100 C120,70 220,95 340,80 C460,65 560,100 680,85 C800,70 900,95 1020,80 C1110,68 1170,85 1200,78 L1200,120 L0,120 Z"
          fill="hsl(36 72% 52%)"
        />
      </svg>
      {/* Foreground dune ripples */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[14%]"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,70 C80,40 180,60 280,45 C380,30 460,65 580,55 C700,45 800,75 920,60 C1040,45 1130,65 1200,50 L1200,100 L0,100 Z"
          fill="hsl(30 65% 38%)"
        />
        <path
          d="M0,90 C150,75 300,90 450,80 C600,70 750,92 900,82 C1050,72 1150,88 1200,80 L1200,100 L0,100 Z"
          fill="hsl(24 60% 26%)"
          opacity="0.85"
        />
      </svg>

      {/* Cacti — bigger, varied silhouettes */}
      <Cactus className="absolute bottom-[8%] left-[2%] w-44 h-[26rem] drop-shadow-[0_12px_12px_rgba(0,0,0,0.6)]" />
      <Cactus className="absolute bottom-[5%] right-[3%] w-52 h-[30rem] drop-shadow-[0_14px_14px_rgba(0,0,0,0.65)]" />
      <Cactus className="absolute bottom-[15%] left-[26%] w-16 h-40 opacity-90 drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)]" />
      <Cactus className="absolute bottom-[11%] right-[30%] w-20 h-48 opacity-95 drop-shadow-[0_8px_8px_rgba(0,0,0,0.55)]" />

      {/* Tumbleweeds rolling across the desert */}
      <Tumbleweed className="absolute bottom-[7%] w-20 h-20 animate-tumble-slow drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)]" />
      <Tumbleweed className="absolute bottom-[16%] w-12 h-12 opacity-75 animate-tumble-mid" />
      <Tumbleweed className="absolute bottom-[4%] w-16 h-16 opacity-95 animate-tumble-fast drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]" />

      {/* Dust particles overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_20%_30%,hsl(38_60%_50%/0.25),transparent_40%),radial-gradient(circle_at_80%_70%,hsl(18_70%_40%/0.25),transparent_40%)]" />

      {/* Warm color-grade wash — amber highlights, deep teal shadows */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-70"
        style={{
          background:
            "linear-gradient(180deg, hsl(36 90% 60% / 0.55) 0%, hsl(28 80% 50% / 0.25) 45%, hsl(220 40% 20% / 0.35) 100%)",
        }}
      />
      {/* Amber highlight bloom near the sun */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 28%, hsl(40 95% 70% / 0.55), transparent 70%)",
        }}
      />

      {/* Warm film vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 38%, hsl(20 70% 12% / 0.45) 75%, hsl(15 80% 6% / 0.85) 100%)",
        }}
      />

      {/* Film grain (pure SVG noise, no asset) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.75  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "160px 160px",
        }}
      />

      {children}
    </div>
  );
};

const Cactus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 140" preserveAspectRatio="xMidYMax meet">
    <defs>
      <linearGradient id="cactusBody" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(115 35% 14%)" />
        <stop offset="40%" stopColor="hsl(118 40% 24%)" />
        <stop offset="70%" stopColor="hsl(122 38% 30%)" />
        <stop offset="100%" stopColor="hsl(115 30% 12%)" />
      </linearGradient>
    </defs>
    <g stroke="hsl(118 50% 8%)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M26,138 Q22,90 24,55 Q26,28 30,18 Q34,28 36,55 Q38,90 34,138 Z" fill="url(#cactusBody)" />
      <path d="M10,80 Q8,70 9,60 Q10,52 14,50 Q18,50 19,58 L19,72 Q22,76 24,78 L24,84 Q18,86 14,84 Q10,82 10,80 Z" fill="url(#cactusBody)" />
      <path d="M50,68 Q52,58 51,48 Q50,40 46,38 Q42,38 41,46 L41,62 Q38,66 36,68 L36,74 Q42,76 46,74 Q50,72 50,68 Z" fill="url(#cactusBody)" />
      <g stroke="hsl(118 45% 10%)" strokeWidth="0.8" fill="none" opacity="0.7">
        <path d="M28,30 Q27,80 29,135" />
        <path d="M32,30 Q33,80 31,135" />
        <path d="M14,55 L14,82" />
        <path d="M46,42 L46,72" />
      </g>
      <g stroke="hsl(125 40% 38%)" strokeWidth="0.6" fill="none" opacity="0.55">
        <path d="M25,30 Q24,80 26,134" />
        <path d="M12,55 L12,80" />
        <path d="M44,42 L44,70" />
      </g>
      <g stroke="hsl(45 30% 70%)" strokeWidth="0.5" opacity="0.7">
        <path d="M22,40 l-2,-1 M22,55 l-2,-1 M22,70 l-2,-1 M22,85 l-2,-1 M22,100 l-2,-1 M22,115 l-2,-1" />
        <path d="M38,40 l2,-1 M38,55 l2,-1 M38,70 l2,-1 M38,85 l2,-1 M38,100 l2,-1 M38,115 l2,-1" />
        <path d="M11,62 l-1.5,0 M11,72 l-1.5,0" />
        <path d="M49,52 l1.5,0 M49,62 l1.5,0" />
      </g>
    </g>
  </svg>
);

const Tumbleweed = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 60">
    <defs>
      <radialGradient id="tw" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="hsl(38 55% 45% / 0.55)" />
        <stop offset="60%" stopColor="hsl(28 50% 28% / 0.35)" />
        <stop offset="100%" stopColor="hsl(20 60% 14% / 0.15)" />
      </radialGradient>
    </defs>
    <circle cx="30" cy="30" r="26" fill="url(#tw)" />
    <g fill="none" strokeLinecap="round" opacity="0.95">
      <g stroke="hsl(28 55% 22%)" strokeWidth="1.1">
        <path d="M6,28 Q18,12 32,22 T54,30" />
        <path d="M8,36 Q22,48 36,38 T54,32" />
        <path d="M14,8 Q24,24 22,44 T28,56" />
        <path d="M44,6 Q34,22 40,40 T34,56" />
        <path d="M4,30 Q30,32 56,28" />
        <path d="M30,4 Q32,30 28,56" />
        <path d="M10,14 Q28,28 50,44" />
        <path d="M50,14 Q30,30 10,46" />
      </g>
      <g stroke="hsl(35 50% 40%)" strokeWidth="0.7" opacity="0.85">
        <path d="M12,22 Q26,18 38,28" />
        <path d="M16,42 Q28,38 44,42" />
        <path d="M20,10 Q24,28 18,46" />
        <path d="M40,12 Q36,30 42,48" />
        <path d="M8,32 Q26,34 50,32" />
        <path d="M14,18 Q30,32 46,42" />
        <path d="M46,16 Q30,30 14,42" />
      </g>
      <g stroke="hsl(42 45% 55%)" strokeWidth="0.5" opacity="0.6">
        <path d="M22,16 Q28,30 26,46" />
        <path d="M36,18 Q32,30 36,44" />
        <path d="M14,28 Q30,30 46,30" />
      </g>
    </g>
  </svg>
);
