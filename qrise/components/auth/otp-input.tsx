"use client";

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function OTPInput({ value, onChange, disabled, error }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, "");
    if (!digit) return;

    const newValue = value.split("");
    newValue[index] = digit.slice(-1);
    
    // Auto-advance to next input
    if (index < 5 && digit) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    const combined = newValue.join("");
    onChange(combined);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const currentValue = value.split("");
      
      if (currentValue[index]) {
        // Clear current
        currentValue[index] = "";
        onChange(currentValue.join(""));
      } else if (index > 0) {
        // Move to previous
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
        currentValue[index - 1] = "";
        onChange(currentValue.join(""));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    
    if (!pasteData) return;

    const newValue = value.split("").concat(Array(6).fill("")).slice(0, 6);
    const digits = pasteData.split("");
    
    digits.forEach((digit, i) => {
      newValue[i] = digit;
    });

    // Focus the last filled input or the next empty one
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
    setFocusedIndex(nextIndex);

    onChange(newValue.join(""));
  };

  const digits = value.padStart(6, "").split("");

  return (
    <div className="space-y-2">
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => setFocusedIndex(index)}
            className={cn(
              "w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
              digit ? "border-[#0F6E56] bg-[#0F6E56]/5" : "border-gray-200",
              focusedIndex === index ? "ring-[#0F6E56] ring-offset-2" : "",
              error ? "border-red-500" : "",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        ))}
      </div>
      {error && (
        <p className="text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}