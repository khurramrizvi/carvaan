import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[#4d4d4d]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-10 px-3 bg-white text-[#171717] placeholder-[#888888] text-sm rounded-md border transition-all outline-none
            ${
              error
                ? "border-[#ee0000] focus:border-[#ee0000] focus:ring-2 focus:ring-[#ee0000]/20"
                : "border-[#ebebeb] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10"
            }
            disabled:bg-[#fafafa] disabled:text-[#888888] disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[#ee0000] font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#888888]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
