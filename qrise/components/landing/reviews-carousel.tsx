"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import landingData from "@/data/before-auth/landing.json";
import "./reviews-carousel.css";

const reviews = landingData.reviews;

export function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="reviews-section" aria-label="Customer Reviews">
      <div className="reviews-container">
        <div className="reviews-header">
          <h2 className="reviews-title">
            Loved by teams everywhere
          </h2>
        </div>

        {/* Carousel */}
        <div 
          className="carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {reviews.map((review, index) => (
              <div 
                key={index} 
                className="review-slide"
              >
                <div className="review-card">
                  {/* Rating */}
                  <div className="rating-row">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="star-icon h-5 w-5" />
                    ))}
                  </div>

                  {/* Review text */}
                  <p className="review-text">
                    &ldquo;{review.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="author-row">
                    <div className="author-avatar">
                      {review.initials}
                    </div>
                    <div>
                      <p className="author-name">{review.name}</p>
                      <p className="author-info">
                        {review.role}, {review.company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="carousel-dots">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`dot-btn ${index === currentIndex ? "active" : ""}`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}