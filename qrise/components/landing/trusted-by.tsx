"use client";

import landingData from "@/data/before-auth/landing.json";

const companies = landingData.companies;

export function TrustedBy() {
  return (
    <section className="pb-20 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px w-12 bg-gray-200" />
          <p className="text-center text-sm font-semibold tracking-wider text-gray-400 uppercase">
            Trusted by forward-thinking teams
          </p>
          <div className="h-px w-12 bg-gray-200" />
        </div>
        
        <div className="relative">
          {/* Gradient Overlays for smooth fading */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

          <div className="flex overflow-hidden group">
            <div className="flex gap-16 items-center animate-marquee whitespace-nowrap py-4">
              {[...companies, ...companies, ...companies].map((company, index) => (
                <div
                  key={`${company}-${index}`}
                  className="flex items-center gap-2 group/item cursor-default"
                >
                  <span className="text-2xl font-bold text-gray-300 group-hover/item:text-[#0F6E56] transition-colors duration-300 select-none">
                    {company}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}