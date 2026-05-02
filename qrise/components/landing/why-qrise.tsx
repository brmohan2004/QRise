import { Check, X } from "lucide-react";
import landingData from "@/data/before-auth/landing.json";
import "./why-qrise.css";

const comparison = (landingData as any).comparison;

export function WhyQRise() {
  return (
    <section className="why-section" aria-label="Comparison">
      <div className="why-container">
        <div className="why-header">
          <h2 className="why-title">
            Why teams switch to QRise
          </h2>
          <p className="why-subtitle">
            See how we compare to other solutions
          </p>
        </div>

        <div className="table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Features</th>
                <th className="center-col">Free QR Tools</th>
                <th className="center-col">Basic SaaS</th>
                <th className="center-col qrise-header">QRise</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row: any) => (
                <tr key={row.feature}>
                  <td className="feature-col">
                    {row.feature}
                  </td>
                  <td className="center-col">
                    {row.free ? (
                      <Check className="icon-check h-5 w-5" />
                    ) : (
                      <X className="icon-x h-5 w-5" />
                    )}
                  </td>
                  <td className="center-col">
                    {row.basic ? (
                      <Check className="icon-check h-5 w-5" />
                    ) : (
                      <X className="icon-x h-5 w-5" />
                    )}
                  </td>
                  <td className="qrise-col">
                    {row.qrise ? (
                      <Check className="icon-qrise h-5 w-5" />
                    ) : (
                      <X className="icon-x h-5 w-5" />
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