"use client"

import Link from "next/link"
import { Lock } from "lucide-react"

interface AuthBadgeProps {
  scope: string
}

export function AuthBadge({ scope }: AuthBadgeProps) {
  return (
    <Link
      href="/docs/authentication"
      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
    >
      <Lock className="h-4 w-4" />
      <span>Requires authentication</span>
      <span className="bg-white px-2 py-0.5 rounded font-mono text-xs border border-gray-200">
        {scope}
      </span>
    </Link>
  )
}