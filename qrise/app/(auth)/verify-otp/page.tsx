"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OTPInput } from "@/components/auth/otp-input";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(3);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    
    setLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (verifyError) {
        const remaining = attempts - 1;
        setAttempts(remaining);
        if (remaining <= 0) {
          setError("No attempts remaining. Please request a new code.");
        } else {
          setError(`Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining`);
        }
        setOtp("");
        return;
      }

      // Success - redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Verification error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const { error: resendError } = await supabase.auth.resetPasswordForEmail(email);
      if (resendError) {
        setError(resendError.message);
      } else {
        setResendCooldown(60);
        setError(null);
      }
    } catch (err) {
      console.error("Resend error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the 6-digit code sent to<br />
          <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      <OTPInput
        value={otp}
        onChange={setOtp}
        error={error || undefined}
      />

      <div className="text-center">
        <button
          onClick={handleResend}
          disabled={loading || resendCooldown > 0}
          className="text-sm text-[#0F6E56] hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Resend code"}
        </button>
      </div>

      {attempts < 3 && (
        <p className="text-center text-sm text-amber-600">
          {attempts} attempt{attempts !== 1 ? "s" : ""} remaining
        </p>
      )}

      {loading && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-[#0F6E56]" />
        </div>
      )}

      <p className="text-center text-sm text-gray-600">
        <Link href="/login" className="flex items-center justify-center gap-1 text-[#0F6E56] hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[#0F6E56]" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}