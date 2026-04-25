"use client";

import { useState } from "react";
import { Lock, Gift, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import featuresData from "@/data/before-auth/features.json";

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
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900">
            All Features
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create, track, and optimize your QR codes
          </p>
        </div>

        {/* Current features grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-20">
          {currentFeatures.map((feature) => (
            <div
              key={feature.id}
              className="rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
              {feature.isNew && (
                <span className="inline-flex items-center mt-3 px-2 py-1 text-xs font-medium text-amber-800 bg-amber-100 rounded-full">
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Upcoming features */}
        <div className="border-t border-gray-200 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Guess what&apos;s coming
            </h2>
            <p className="mt-2 text-gray-600">
              Win a free Pro month by guessing the next features!
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingFeatures.map((feature) => {
              const guess = guesses[feature.id];
              const isLoading = loading[feature.id];

              return (
                <div
                  key={feature.id}
                  className={cn(
                    "rounded-xl border p-6 relative overflow-hidden",
                    guess?.correct
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-gray-50 blur-sm"
                  )}
                >
                  <Lock className="h-5 w-5 text-gray-400 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                  
                  {/* Hint */}
                  <p className="mt-3 text-xs text-gray-500">
                    Hint: {feature.hint}
                  </p>

                  {/* Guess form */}
                  {!guess && (
                    <div className="mt-4 space-y-2">
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                      />
                      <button
                        onClick={() => handleGuess(feature.id)}
                        disabled={isLoading}
                        className="w-full px-3 py-2 text-sm font-medium text-white bg-[#0F6E56] rounded-lg hover:bg-[#0d5c48] disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          "Guess"
                        )}
                      </button>
                    </div>
                  )}

                  {/* Correct guess */}
                  {guess?.correct && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <Gift className="h-4 w-4" />
                        <span className="font-medium">Correct!</span>
                      </div>
                      <p className="mt-1 text-sm text-green-700">
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