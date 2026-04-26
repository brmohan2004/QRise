"use client";

import { useState } from "react";
import { Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import pricingData from "@/data/before-auth/pricing.json";

const plans = (pricingData as any).plans;
const comparisonFeatures = (pricingData as any).comparisonFeatures;
const faqs = (pricingData as any).faqs;

export function PricingContent() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that fits your needs
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={cn("text-sm", !isAnnual ? "font-medium text-gray-900" : "text-gray-500")}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                isAnnual ? "bg-[#0F6E56]" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  isAnnual ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <span className={cn("text-sm", isAnnual ? "font-medium text-gray-900" : "text-gray-500")}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-2 text-xs text-green-600 font-medium">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan: any) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-2xl border p-8",
                plan.popular
                  ? "border-[#0F6E56] ring-2 ring-[#0F6E56] relative"
                  : "border-gray-200"
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium text-white bg-[#0F6E56] rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${isAnnual && plan.annualPrice ? plan.annualPrice : plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-500">/month</span>
                )}
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-[#0F6E56] flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={cn(
                  "mt-8 block w-full py-3 text-center rounded-lg font-medium transition-colors",
                  plan.popular
                    ? "bg-[#0F6E56] text-white hover:bg-[#0d5c48]"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Feature comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 text-left text-sm font-medium text-gray-500">
                    Features
                  </th>
                  <th className="py-4 text-center text-sm font-medium text-gray-500">
                    Free
                  </th>
                  <th className="py-4 text-center text-sm font-medium text-gray-500">
                    Pro
                  </th>
                  <th className="py-4 text-center text-sm font-medium text-gray-500">
                    Business
                  </th>
                  <th className="py-4 text-center text-sm font-medium text-gray-500">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonFeatures.map((row: any) => (
                  <tr key={row.feature}>
                    <td className="py-4 text-sm text-gray-900">{row.feature}</td>
                    <td className="py-4 text-center">
                      {typeof row.free === "boolean" ? (
                        row.free ? (
                          <Check className="h-5 w-5 text-[#0F6E56] mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        <span className="text-sm text-gray-600">{row.free}</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <Check className="h-5 w-5 text-[#0F6E56] mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        <span className="text-sm text-gray-600">{row.pro}</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {typeof row.business === "boolean" ? (
                        row.business ? (
                          <Check className="h-5 w-5 text-[#0F6E56] mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        <span className="text-sm text-gray-600">{row.business}</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? (
                          <Check className="h-5 w-5 text-[#0F6E56] mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        <span className="text-sm text-gray-600">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <HelpCircle
                    className={cn(
                      "h-5 w-5 text-gray-400 transition-transform",
                      openFaq === index && "rotate-180"
                    )}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-sm text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
