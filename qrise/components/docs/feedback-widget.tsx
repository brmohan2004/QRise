"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeedbackWidgetProps {
  page: string
}

export function FeedbackWidget({ page }: FeedbackWidgetProps) {
  const [voted, setVoted] = useState<boolean | null>(null)

  const handleVote = async (helpful: boolean) => {
    setVoted(helpful)
    try {
      await fetch("/api/docs/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, helpful }),
      })
    } catch (e) {
      // Silent fail
    }
  }

  if (voted !== null) {
    return (
      <div className="mt-12 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-600">Thanks for your feedback!</p>
      </div>
    )
  }

  return (
    <div className="mt-12 pt-6 border-t border-gray-200">
      <p className="text-sm text-gray-600 mb-3">Was this page helpful?</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleVote(true)}>
          <ThumbsUp className="h-4 w-4 mr-1" />
          Yes
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleVote(false)}>
          <ThumbsDown className="h-4 w-4 mr-1" />
          No
        </Button>
      </div>
    </div>
  )
}