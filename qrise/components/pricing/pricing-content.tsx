"use client";

import { useState } from "react";
import { Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import pricingData from "@/data/before-auth/pricing.json";
import "./pricing.css";

const plans = (pricingData as any).plans;
const comparisonFeatures = (pricingData as any).comparisonFeatures;
const faqs = (pricingData as any).faqs;

export function PricingContent() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
              <Link
                href={plan.href}
                className={cn(
                  "plan-cta",
                  plan.popular ? "cta-primary" : "cta-secondary"
                )}
              >
                {plan.cta}
              </Link>
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
                  <th className="text-center">Free</th>
                  <th className="text-center">Pro</th>
                  <th className="text-center">Business</th>
                  <th className="text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row: any) => (
                  <tr key={row.feature}>
                    <td>{row.feature}</td>
                    <td className="text-center">
                      {typeof row.free === "boolean" ? (
                        row.free ? (
                          <Check className="feature-icon" style={{ margin: "auto" }} />
                        ) : (
                          <span className="dash-icon">—</span>
                        )
                      ) : (
                        <span className="feature-text">{row.free}</span>
                      )}
                    </td>
                    <td className="text-center">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <Check className="feature-icon" style={{ margin: "auto" }} />
                        ) : (
                          <span className="dash-icon">—</span>
                        )
                      ) : (
                        <span className="feature-text">{row.pro}</span>
                      )}
                    </td>
                    <td className="text-center">
                      {typeof row.business === "boolean" ? (
                        row.business ? (
                          <Check className="feature-icon" style={{ margin: "auto" }} />
                        ) : (
                          <span className="dash-icon">—</span>
                        )
                      ) : (
                        <span className="feature-text">{row.business}</span>
                      )}
                    </td>
                    <td className="text-center">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? (
                          <Check className="feature-icon" style={{ margin: "auto" }} />
                        ) : (
                          <span className="dash-icon">—</span>
                        )
                      ) : (
                        <span className="feature-text">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
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
            {faqs.map((faq: any, index: number) => (
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
