"use client";

import { useState, useEffect } from "react";
import { Lock, Gift, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import featuresData from "@/data/before-auth/features.json";
import "./features.css";

const staticFeatures = featuresData.allFeatures.filter(f => !f.isNew);

export default function FeaturesPage() {
  const [guesses, setGuesses] = useState<Record<string, { correct: boolean; giftCode?: string }>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [quizFeatures, setQuizFeatures] = useState<any[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch('/api/features-quiz');
        if (res.ok) {
          const data = await res.json();
          setQuizFeatures(data);
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
      } finally {
        setIsQuizLoading(false);
      }
    };
    fetchQuiz();
  }, []);

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
      if (data.correct) {
        setGuesses((prev) => ({ ...prev, [featureId]: data }));
        toast.success("Correct guess!");
      } else {
        toast.error("Incorrect guess! Try again.");
      }
    } catch (error) {
      console.error("Guess error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [featureId]: false }));
    }
  };

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
          {staticFeatures.map((feature) => (
            <div
              key={feature.id}
              className="feature-card"
            >
              <h3 className="feature-card-title">
                {feature.name}
              </h3>
              <p className="feature-card-description">{feature.description}</p>
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

          {isQuizLoading ? (
            <div className="flex justify-center py-12">
               <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : quizFeatures.length === 0 ? (
            <div className="text-center py-12">
               <p className="text-gray-500 italic">No features guess is there.</p>
            </div>
          ) : (
            <div className="upcoming-grid">
              {quizFeatures.map((feature) => {
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
                    
                    {guess?.correct ? (
                      <>
                        <h3 className="feature-card-title">
                          {feature.feature_name}
                        </h3>
                        <p className="feature-card-description">This new feature is now revealed!</p>
                      </>
                    ) : (
                      <>
                        <h3 className="feature-card-title">
                          Hidden Feature
                        </h3>
                        <p className="feature-card-description">Guess the name of this feature to unlock rewards.</p>
                      </>
                    )}
                    
                    {/* Hint */}
                    <p className="hint-text">
                      Hint: {feature.hint_text}
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
                          onKeyDown={(e) => e.key === 'Enter' && handleGuess(feature.id)}
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
          )}
        </div>
      </div>
    </div>
  );
}