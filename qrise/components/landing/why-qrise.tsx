import { Check, X } from "lucide-react";

import landingData from "@/data/before-auth/landing.json";

const comparison = (landingData as any).comparison;

export function WhyQRise() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Why teams switch to QRise
          </h2>
          <p className="mt-2 text-gray-600">
            See how we compare to other solutions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="pb-4 text-left text-sm font-medium text-gray-500">
                  Features
                </th>
                <th className="pb-4 text-center text-sm font-medium text-gray-500">
                  Free QR Tools
                </th>
                <th className="pb-4 text-center text-sm font-medium text-gray-500">
                  Basic SaaS
                </th>
                <th className="pb-4 text-center text-sm font-medium text-[#0F6E56] bg-[#0F6E56]/5 px-4 rounded-t-lg">
                  QRise
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comparison.map((row: any) => (
                <tr key={row.feature}>
                  <td className="py-4 text-sm font-medium text-gray-900">
                    {row.feature}
                  </td>
                  <td className="py-4 text-center">
                    {row.free ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-4 text-center">
                    {row.basic ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-4 text-center bg-[#0F6E56]/5">
                    {row.qrise ? (
                      <Check className="h-5 w-5 text-[#0F6E56] mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}