interface FlashOverlayProps {
  active: boolean;
}

export const FlashOverlay = ({ active }: FlashOverlayProps) => {
  if (!active) return null;
  return (
    <div
      key={Date.now()}
      className="pointer-events-none fixed inset-0 z-[100] animate-flash"
      style={{
        background: "radial-gradient(circle, hsl(48 100% 75%) 0%, hsl(42 100% 55%) 60%, hsl(38 90% 50%) 100%)",
      }}
    />
  );
};
