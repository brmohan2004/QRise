"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RegisterSchema } from "@/lib/validations/auth.schema";
import { GoogleSignInButton, AppleSignInButton } from "./provider-buttons";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type RegisterFormData = {
  email: string;
  password: string;
  fullName: string;
};

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (signUpError) {
        // Show human-readable error messages
        const errorMessage = signUpError.message.toLowerCase();
        if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
          setError("An account with this email already exists");
        } else if (errorMessage.includes("weak password") || errorMessage.includes("password")) {
          setError("Password is too weak. Use at least 8 characters");
        } else if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
          setError("Too many attempts. Please wait a moment and try again");
        } else if (errorMessage.includes("invalid email")) {
          setError("Please enter a valid email address");
        } else {
          setError("Registration failed. Please try again");
        }
        return;
      }

      // Redirect to OTP verification
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Provider buttons */}
      <div className="space-y-3">
        <GoogleSignInButton />
        <AppleSignInButton />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">or continue with email</span>
        </div>
      </div>

      {/* Registration form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            {...register("fullName")}
            className={cn(
              "mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm",
              errors.fullName
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#0F6E56]"
            )}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={cn(
              "mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm",
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#0F6E56]"
            )}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={cn(
                "mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm pr-10",
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[#0F6E56]"
              )}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p role="alert" className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 p-3 rounded-lg bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center px-4 py-3 text-sm font-medium text-white bg-[#0F6E56] rounded-lg hover:bg-[#0d5c48] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F6E56] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </div>
  );
}