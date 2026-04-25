import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <a href="/register" className="font-medium text-[#0F6E56] hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}