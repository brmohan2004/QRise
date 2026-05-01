"use client"

import { useEffect, useState } from "react"

interface ResolverFlowDiagramProps {
  className?: string
}

export function ResolverFlowDiagram({ className }: ResolverFlowDiagramProps) {
  const [step, setStep] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev >= 4 ? 1 : prev + 1))
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const steps = [
    { id: 1, label: "QR Code Scanned", x: "10%", y: "20%" },
    { id: 2, label: "QRise Edge Worker", x: "35%", y: "20%" },
    { id: 3, label: "Your Resolver Endpoint", x: "60%", y: "20%" },
    { id: 4, label: "QRise Serves Result", x: "85%", y: "20%" },
  ]

  const getLineOpacity = (stepId: number) => {
    if (stepId <= step) return "opacity-100"
    return "opacity-20"
  }

  const getBoxStyle = (stepId: number) => {
    const base = "px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all duration-1000"
    if (stepId === step) {
      return `${base} bg-[#0F6E56] text-white scale-110 ring-4 ring-[#0F6E56]/20`
    }
    return `${base} bg-gray-100 text-gray-500`
  }

  return (
    <div className={`relative bg-gradient-to-r from-gray-50 to-white rounded-2xl p-8 border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Resolver Call Flow</h3>
        <p className="text-sm text-gray-600">
          How QRise resolves custom type QR codes at the edge
        </p>
      </div>

      {/* Flow Diagram */}
      <div className="relative h-32">
        {/* Horizontal connecting line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Background line (dim) */}
          <line
            x1="10" y1="50" x2="90" y2="50"
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          {/* Animated progress line */}
          <line
            x1="10" y1="50" x2={`${10 + (step - 1) * 26.67}`} y2="50"
            stroke="#0F6E56"
            strokeWidth="0.75"
            className="transition-all duration-1000 ease-out"
          />
          {/* Arrow heads */}
          {[1, 2, 3].map((i) => (
            <polygon
              key={i}
              points={`${10 + i * 26.67 - 2},48 ${10 + i * 26.67 + 2},50 ${10 + i * 26.67 - 2},52`}
              fill={step > i ? "#0F6E56" : "#e5e7eb"}
              className="transition-all duration-1000"
            />
          ))}
        </svg>

        {/* Step boxes */}
        {steps.map((s, index) => (
          <div
            key={s.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: s.x, top: s.y }}
          >
            <div className={getBoxStyle(s.id)}>
              {s.label}
            </div>
            {s.id < 4 && (
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-xs text-gray-400 hidden sm:block">
                POST (signed)
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current step description */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F6E56]/5 rounded-full">
          <span className="text-sm text-[#0F6E56] font-medium">
            Step {step} of 4:
          </span>
          <span className="text-sm text-gray-700">
            {steps[step - 1].label}
          </span>
        </div>
      </div>

      {/* Step explanations */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-600">
        <div className="text-center">
          <span className="font-semibold text-gray-900">1. Scan</span>
          <p className="mt-1">User scans a custom type QR code</p>
        </div>
        <div className="text-center">
          <span className="font-semibold text-gray-900">2. Edge</span>
          <p className="mt-1">QRise Cloudflare Worker fetches config from KV cache</p>
        </div>
        <div className="text-center">
          <span className="font-semibold text-gray-900">3. Resolver</span>
          <p className="mt-1">Signed POST with scan context to your endpoint (5s timeout)</p>
        </div>
        <div className="text-center">
          <span className="font-semibold text-gray-900">4. Serve</span>
          <p className="mt-1">QRise renders redirect, HTML, or template result</p>
        </div>
      </div>
    </div>
  )
}
