"use client";

import { useState } from "react";
import { Lock, Gift, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import featuresData from "@/data/before-auth/features.json";
import "./features.css";

const allFeatures = featuresData.allFeatures;

export default function FeaturesPage() {
  const [guesses, setGuesses] = useState<Record<string, { correct: boolean; giftCode?: string }>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handleGuess = async (featureId: string) => {
    const guess = inputValues[featureId]?.toLowerCase().trim();
    if (!guess) return;

    setLoading((prev) => ({ ...prev, [featureId]: true }));

    try {
      const response = await fetch("/api/features/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureId, guess }),
      });

      const data = await response.json();
      setGuesses((prev) => ({ ...prev, [featureId]: data }));
    } catch (error) {
      console.error("Guess error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [featureId]: false }));
    }
  };

  const currentFeatures = allFeatures.filter((f) => !f.isNew);
  const upcomingFeatures = allFeatures.filter((f) => f.isNew);

  return (
    <div className="features-section">
      <div className="features-container">
        {/* Header */}
        <div className="features-header">
          <h1 className="features-title">
            All Features
          </h1>
          <p className="features-description">
            Everything you need to create, track, and optimize your QR codes
          </p>
        </div>

        {/* Current features grid */}
        <div className="features-grid">
          {currentFeatures.map((feature) => (
            <div
              key={feature.id}
              className="feature-card"
            >
              <h3 className="feature-card-title">
                {feature.name}
              </h3>
              <p className="feature-card-description">{feature.description}</p>
              {feature.isNew && (
                <span className="badge-upcoming">
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Upcoming features */}
        <div className="upcoming-section">
          <div className="upcoming-header">
            <h2 className="upcoming-title">
              Guess what&apos;s coming
            </h2>
            <p className="upcoming-subtitle">
              Win a free Pro month by guessing the next features!
            </p>
          </div>

          <div className="upcoming-grid">
            {upcomingFeatures.map((feature) => {
              const guess = guesses[feature.id];
              const isLoading = loading[feature.id];

              return (
                <div
                  key={feature.id}
                  className={cn(
                    "locked-card",
                    !guess?.correct && "is-blurred",
                    guess?.correct && "is-correct"
                  )}
                >
                  <Lock className="lock-icon" />
                  <h3 className="feature-card-title">
                    {feature.name}
                  </h3>
                  <p className="feature-card-description">{feature.description}</p>
                  
                  {/* Hint */}
                  <p className="hint-text">
                    Hint: {feature.hint}
                  </p>

                  {/* Guess form */}
                  {!guess && (
                    <div className="guess-form">
                      <input
                        type="text"
                        value={inputValues[feature.id] || ""}
                        onChange={(e) =>
                          setInputValues((prev) => ({
                            ...prev,
                            [feature.id]: e.target.value,
                          }))
                        }
                        placeholder="Your guess..."
                        className="guess-input"
                      />
                      <button
                        onClick={() => handleGuess(feature.id)}
                        disabled={isLoading}
                        className="guess-button"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Guess"
                        )}
                      </button>
                    </div>
                  )}

                  {/* Correct guess */}
                  {guess?.correct && (
                    <div className="success-badge">
                      <div className="success-title">
                        <Gift className="h-4 w-4" />
                        <span>Correct!</span>
                      </div>
                      <p className="success-code">
                        Your gift code: <strong>{guess.giftCode}</strong>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}