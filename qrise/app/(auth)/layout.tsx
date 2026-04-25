import { QrCode } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F6E56]">
              <QrCode className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            QRise
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}