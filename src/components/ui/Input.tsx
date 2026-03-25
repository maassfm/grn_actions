"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-bold uppercase tracking-wide text-black mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 border-2 bg-white transition-shadow focus:outline-none focus-visible:outline-[3px] focus-visible:outline-black placeholder:text-gray-400 ${
            error
              ? "border-signal"
              : "border-black"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm font-bold text-signal">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
