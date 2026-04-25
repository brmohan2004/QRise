import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  fullName: z.string().min(1).max(200),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
  rememberMe: z.boolean().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const VerifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const UpdatePasswordSchema = z.object({
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
