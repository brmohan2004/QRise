import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Start creating QR codes for free
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-[#0F6E56] hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}