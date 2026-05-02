'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordEntryFormProps {
  qrId: string;
  label: string;
}

export function PasswordEntryForm({ qrId, label }: PasswordEntryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' },
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: data.password, qrId }),
      });

      const resData = await response.json();

      if (response.ok && resData.valid) {
        toast.success('Password verified! Redirecting...');
        // Redirect to the target URL
        window.location.href = resData.redirectUrl;
      } else {
        toast.error(resData.error || 'Invalid password');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Password Protected</CardTitle>
          <CardDescription className="text-slate-500 mt-2">
            This QR code for <span className="font-semibold text-slate-900">{label}</span> is protected.
            Please enter the password to proceed.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter password"
                {...register("password")}
                className="h-11"
                autoFocus
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Access Destination
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
