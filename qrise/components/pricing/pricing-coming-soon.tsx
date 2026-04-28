import { CreditCard, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";
import "./pricing.css";

export function PricingComingSoon() {
  return (
    <div className="pricing-section coming-soon-wrapper">
      <div className="pricing-container coming-soon-container">
        <div className="coming-soon-icon-box">
          <CreditCard className="coming-soon-icon" />
        </div>
        
        <h1 className="pricing-title coming-soon-title">
          Pricing Plans Coming Soon
        </h1>
        
        <p className="pricing-description coming-soon-description">
          We're putting the finishing touches on our pricing plans to ensure you get the best value. 
          For now, enjoy all features for free!
        </p>
        
        <div className="offer-card">
          <div className="offer-content">
            <div className="offer-icon-box">
              <Rocket className="offer-icon" />
            </div>
            <div className="offer-text-box">
              <p className="offer-label">Limited Time Offer</p>
              <p className="offer-sublabel">All users get a free Pro trial automatically.</p>
            </div>
          </div>
        </div>
        
        <div className="coming-soon-actions">
          <Link
            href="/register"
            className="plan-cta cta-primary action-btn"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/"
            className="action-link"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
