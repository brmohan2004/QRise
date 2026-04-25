"use client"

import { Info, AlertTriangle, AlertCircle, Lightbulb } from "lucide-react"

interface CalloutProps {
  type: "info" | "warning" | "danger" | "tip"
  title?: string
  children: React.ReactNode
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  tip: Lightbulb,
}

const styles = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  danger: "bg-red-50 border-red-200 text-red-800",
  tip: "bg-green-50 border-green-200 text-green-800",
}

export function Callout({ type, title, children }: CalloutProps) {
  const Icon = icons[type]

  return (
    <div className={`my-6 p-4 rounded-lg border ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5" />
        <div>
          {title && <p className="font-medium mb-1">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}