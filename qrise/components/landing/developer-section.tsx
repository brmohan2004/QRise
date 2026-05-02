import { Code2, Key, Shield, Zap, Terminal, ArrowRight, Lock, Database } from "lucide-react";
import Link from "next/link";
import "./developer-section.css";

export function DeveloperSection() {
  const items = [
    { 
      title: "Environment Keys", 
      desc: "Live and Sandbox (qr_test_) keys for safe testing and production isolation.", 
      icon: Key 
    },
    { 
      title: "HMAC Webhooks", 
      desc: "Secure SHA-256 signed events for real-time automation and sync.", 
      icon: Zap 
    },
    { 
      title: "Type Resolvers", 
      desc: "Custom industry-specific logic with built-in timeout protection.", 
      icon: Database 
    },
    { 
      title: "Granular Scopes", 
      desc: "Fine-grained permissions (qr:read, bulk:write) for ultimate control.", 
      icon: Lock 
    },
  ];

  return (
    <section className="developer-section" aria-label="Developer API">
      <div className="developer-container">
        <div className="developer-header">
          <h2 className="developer-title">
            Enterprise API Infrastructure
          </h2>
          <p className="developer-subtitle">
            Scale your QR operations with our v2 API. Built for performance, security, and developer happiness.
          </p>
        </div>

        <div className="developer-grid">
          {items.map((item) => (
            <div key={item.title} className="developer-card">
              <div className="developer-icon-wrapper">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="developer-card-title">{item.title}</h3>
              <p className="developer-card-description">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="developer-footer">
          <Link 
            href="/developer" 
            className="developer-cta"
          >
            Open Developer Hub <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
