"use client";

import React, { useState } from "react";
import { Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user.store";
import { Loader2 } from "lucide-react";

import pricingData from "@/data/before-auth/pricing.json";
import "./pricing.css";

const staticComparisonFeatures = (pricingData as any).comparisonFeatures;
const staticFaqs = (pricingData as any).faqs;

interface Plan {
  id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_annual?: number;
  has_analytics: boolean;
  has_api_access: boolean;
  has_bulk_generator: boolean;
  has_design_studio: boolean;
  has_smart_routing: boolean;
  has_password_qr: boolean;
  has_multi_action_qr: boolean;
  has_form_builder: boolean;
  qr_limit: number;
  monthly_scan_limit: number;
}

export function PricingContent({ initialPlans }: { initialPlans: any[] }) {
  console.log('[PricingContent] initialPlans:', initialPlans);
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUserStore();

  const handlePlanClick = async (plan: any) => {
    if (plan.price === 0) {
      router.push("/register");
      return;
    }

    if (!user) {
      router.push(`/register?redirect=/pricing&plan=${plan.id}`);
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          isAnnual,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        // TODO: Show toast error
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingPlan(null);
    }
  };


  const plans = initialPlans.map(plan => {
    const features = [];
    if (plan.qr_limit === -1) features.push("Unlimited QR Codes");
    else features.push(`${plan.qr_limit} QR Codes`);

    if (plan.monthly_scan_limit === -1) features.push("Unlimited Scans");
    else features.push(`${plan.monthly_scan_limit} Scans /mo`);

    if (plan.has_analytics) features.push("Detailed Analytics");
    if (plan.has_design_studio) features.push("Advanced Design Studio");
    if (plan.has_api_access) features.push("API Access");
    if (plan.has_bulk_generator) features.push("Bulk Generation");
    if (plan.has_smart_routing) features.push("Smart Routing");
    if (plan.has_password_qr) features.push("Password Protection");
    if (plan.has_multi_action_qr) features.push("Multi-Action Menu");
    if (plan.has_form_builder) features.push("Custom Form Builder");
    if (plan.rpm) features.push(`${plan.rpm} API Req/min`);
    if (plan.design_studio_logo_limit) features.push(`${plan.design_studio_logo_limit} Logo Uploads`);

    return {
      ...plan,
      price: plan.price_monthly,
      annualPrice: plan.price_annual || Math.floor(plan.price_monthly * 0.8), // 20% discount if not specified
      features,
      cta: plan.price_monthly === 0 ? "Get Started" : "Choose Plan",
      href: "/register",
      popular: plan.name.toLowerCase() === 'pro' || plan.name.toLowerCase() === 'business'
    };
  });


  return (
    <div className="pricing-section">
      <div className="pricing-container">
        {/* Header */}
        <div className="pricing-header">
          <h1 className="pricing-title">
            Simple, transparent pricing
          </h1>
          <p className="pricing-description">
            Choose the plan that fits your needs
          </p>

          {/* Toggle */}
          <div className="pricing-toggle-wrapper">
            <span className={cn("toggle-label", !isAnnual && "is-active")}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn("toggle-switch", isAnnual && "is-annual")}
              aria-label="Toggle annual billing"
            >
              <span className="toggle-thumb" />
            </button>
            <span className={cn("toggle-label", isAnnual && "is-active")}>
              Annual
            </span>
            {isAnnual && (
              <span className="save-badge">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Plan cards */}
        <div className="plans-grid">
          {plans.map((plan: any) => (
            <div
              key={plan.name}
              className={cn(
                "plan-card",
                plan.popular && "is-popular"
              )}
            >
              {plan.popular && (
                <span className="popular-badge">
                  Most Popular
                </span>
              )}
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-price-row">
                <span className="plan-price">
                  ${isAnnual && plan.annualPrice ? plan.annualPrice : plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="plan-period">/month</span>
                )}
              </div>
              <ul className="plan-features">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="feature-item">
                    <Check className="feature-icon" />
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanClick(plan)}
                disabled={loadingPlan !== null}
                className={cn(
                  "plan-cta",
                  plan.popular ? "cta-primary" : "cta-secondary",
                  loadingPlan === plan.id && "opacity-80 cursor-not-allowed"
                )}
              >
                {loadingPlan === plan.id ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  plan.cta
                )}
              </button>

            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="comparison-section">
          <h2 className="comparison-title">
            Feature comparison
          </h2>
          <div className="table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Features</th>
                  {plans.map((plan: any) => (
                    <th key={plan.id} className="text-center">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'QR Code Limit', key: 'qr_limit', isLimit: true },
                  { label: 'Monthly Scans', key: 'monthly_scan_limit', isLimit: true },
                  { label: 'Analytics', key: 'has_analytics' },
                  { label: 'API Access', key: 'has_api_access' },
                  { label: 'Bulk Generator', key: 'has_bulk_generator' },
                  { label: 'Design Studio', key: 'has_design_studio' },
                  { label: 'Smart Routing', key: 'has_smart_routing' },
                  { label: 'Password Protection', key: 'has_password_qr' },
                  { label: 'Multi-Action Menu', key: 'has_multi_action_qr' },
                  { label: 'Form Builder', key: 'has_form_builder' },
                  
                  // Design Studio Section
                  { label: 'Design Studio: Color Limit', key: 'design_studio_color_limit', isLimit: true, section: 'Design Studio' },
                  { label: 'Design Studio: Logo Limit', key: 'design_studio_logo_limit', isLimit: true },
                  { label: 'Design Studio: Style Options', key: 'design_studio_style_limit', isLimit: true },
                  
                  // API Section
                  { label: 'API Calls /mo', key: 'api_calls_per_month', isLimit: true, section: 'API & Webhooks' },
                  { label: 'Webhook Endpoints', key: 'webhook_limit', isLimit: true },
                  { label: 'Custom API Domain', key: 'custom_domain_api' },
                  
                  // Infrastructure Section
                  { label: 'Requests Per Minute (RPM)', key: 'rpm', isLimit: true, section: 'Infrastructure' },
                  { label: 'Requests Per Day (RPD)', key: 'rpd', isLimit: true },
                  { label: 'Burst Limit', key: 'max_burst', isLimit: true },
                ].map((row: any) => (
                  <React.Fragment key={row.label}>
                    {row.section && (
                      <tr className="bg-gray-50">
                        <td colSpan={plans.length + 1} className="py-2 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50">
                          {row.section}
                        </td>
                      </tr>
                    )}
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      {plans.map((plan: any) => (
                        <td key={`${plan.id}-${row.key}`} className="text-center">
                          {row.isLimit ? (
                            <span className="feature-text">
                              {plan[row.key] === -1 || plan[row.key] === null ? 'Unlimited' : plan[row.key]}
                            </span>
                          ) : (
                            plan[row.key] ? (
                              <Check className="feature-icon" style={{ margin: "auto" }} />
                            ) : (
                              <span className="dash-icon">—</span>
                            )
                          )}
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section">
          <h2 className="faq-title">
            Frequently asked questions
          </h2>
          <div className="faq-list">
            {staticFaqs.map((faq: any, index: number) => (
              <div key={index} className="faq-item">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="faq-question"
                >
                  <span>{faq.question}</span>
                  <HelpCircle
                    className={cn(
                      "faq-icon",
                      openFaq === index && "is-open"
                    )}
                  />
                </button>
                {openFaq === index && (
                  <div className="faq-answer">
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
