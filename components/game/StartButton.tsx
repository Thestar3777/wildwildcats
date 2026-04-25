import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface StartButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const StartButton = ({ label = "START DUEL", className, ...props }: StartButtonProps) => {
  return (
    <button
      {...props}
      className={cn(
        "stamp-btn font-display text-2xl sm:text-3xl tracking-widest",
        "px-10 py-5 rounded-md select-none cursor-pointer",
        "border-2 border-ink/40",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:rotate-0 disabled:hover:scale-100",
        className
      )}
    >
      <span className="relative z-[1]">{label}</span>
    </button>
  );
};
