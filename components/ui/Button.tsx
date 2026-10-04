import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "blue" | "buy-cta" | "emerald";
  size?: "sm" | "md" | "lg";
  pill?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  pill = false,
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Vercel Design System: crisp geometry, font-medium, hairline focus ring
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const roundedStyle = pill ? "rounded-full" : "rounded-md";

  const sizeStyles = {
    sm: "px-3 py-1 text-xs h-8",
    md: "px-4 py-2 text-sm h-10",
    lg: "px-6 py-2.5 text-base h-11",
  };

  const variantStyles = {
    // Vercel Ink Primary CTA ({colors.primary} — #171717)
    primary:
      "bg-[#171717] text-white hover:bg-[#2e2e2e] active:bg-[#000000] focus:ring-[#171717]/40 shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
    // Vercel Secondary: Pure White card with hairline border ({colors.canvas} + {colors.hairline})
    secondary:
      "bg-white text-[#171717] border border-[#ebebeb] hover:border-[#171717] hover:bg-[#fafafa] active:bg-[#f5f5f5] focus:ring-[#0070f3]/30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
    // Vercel Electric Blue CTA ({colors.link} — #0070f3)
    blue:
      "bg-[#0070f3] text-white hover:bg-[#0060df] active:bg-[#0050cf] focus:ring-[#0070f3]/40 shadow-[0_1px_2px_rgba(0,112,243,0.2)]",
    // Vercel Ghost: Clean minimal hover
    ghost:
      "bg-transparent text-[#4d4d4d] hover:text-[#171717] hover:bg-[#f5f5f5] active:bg-[#ebebeb] focus:ring-gray-200",
    // Vercel Destructive / SOS Red ({colors.error} — #ee0000)
    danger:
      "bg-[#ee0000] text-white hover:bg-[#c50000] active:bg-[#a00000] focus:ring-[#ee0000]/30",
    // Aliases for compatibility
    "buy-cta":
      "bg-[#171717] text-white hover:bg-[#2e2e2e] active:bg-[#000000] focus:ring-[#171717]/40",
    emerald:
      "bg-[#10b981] text-white hover:bg-[#059669] active:bg-[#047857] focus:ring-[#10b981]/30",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${roundedStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
