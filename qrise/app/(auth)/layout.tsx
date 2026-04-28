import Link from "next/link";
import Image from "next/image";

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
            <Image 
              src="/logo.png" 
              alt="QRise Logo" 
              width={48} 
              height={48} 
              className="h-12 w-12 object-contain"
            />
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 uppercase">
            QRise
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}