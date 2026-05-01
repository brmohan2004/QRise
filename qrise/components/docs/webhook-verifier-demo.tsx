"use client"

import { useState } from "react"
import { Verified, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface WebhookVerifierDemoProps {
  className?: string
}

export function WebhookVerifierDemo({ className }: WebhookVerifierDemoProps) {
  const [secret, setSecret] = useState("")
  const [payload, setPayload] = useState("")
  const [signature, setSignature] = useState("")
  const [result, setResult] = useState<"idle" | "valid" | "invalid" | "replay">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const verifySignature = async () => {
    if (!secret || !payload || !signature) {
      setResult("invalid")
      setErrorMsg("Please fill in all fields")
      return
    }

    try {
      // Parse signature format: t=timestamp,v1=hmac
      const parts = signature.split(",")
      const v1Part = parts.find((p) => p.trim().startsWith("v1="))
      if (!v1Part) {
        setResult("invalid")
        setErrorMsg("Invalid signature format")
        return
      }

      const receivedSig = v1Part.trim().substring(3)
      const timestamp = parts.find((p) => p.trim().startsWith("t="))?.trim().substring(2) || ""

      // Check timestamp age (5 minute tolerance)
      const ts = parseInt(timestamp) * 1000
      const now = Date.now()
      if (isNaN(ts) || Math.abs(now - ts) > 5 * 60 * 1000) {
        setResult("replay")
        setErrorMsg("Replay attack detected: timestamp older than 5 minutes")
        return
      }

      // Compute expected signature using Web Crypto API
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      )
      const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`))
      const expectedHex = Buffer.from(signatureBuffer).toString("hex")

      // Timing-safe comparison using Buffer
      const receivedBuf = Buffer.from(receivedSig, "hex")
      const expectedBuf = Buffer.from(expectedHex, "hex")
      
      if (receivedBuf.length !== expectedBuf.length) {
        setResult("invalid")
        setErrorMsg("Signature length mismatch")
        return
      }
      
      let resultBool = 0
      for (let i = 0; i < receivedBuf.length; i++) {
        resultBool |= receivedBuf[i] ^ expectedBuf[i]
      }
      
      if (resultBool === 0) {
        setResult("valid")
        setErrorMsg("")
      } else {
        setResult("invalid")
        setErrorMsg("Signature mismatch")
      }
    } catch (err) {
      setResult("invalid")
      setErrorMsg(err instanceof Error ? err.message : "Verification failed")
    }
  }

  const reset = () => {
    setResult("idle")
    setErrorMsg("")
  }

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-6", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Verified className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Verify a Webhook Signature</h3>
          <p className="text-sm text-gray-600">
            Test signature verification locally using your webhook secret
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Secret input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Webhook Secret
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="whsec_..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
          />
        </div>

        {/* Payload input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Raw Request Body (JSON)
          </label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder='{"id":"evt_...","type":"qr.scanned",...}'
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent resize-none"
          />
        </div>

        {/* Signature input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            X-QRise-Signature Header Value
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder='t=1714000000,v1=abc123...'
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
          />
        </div>

        {/* Result display */}
        {result !== "idle" && (
          <div
            className={cn(
              "p-4 rounded-lg flex items-start gap-3",
              result === "valid"
                ? "bg-green-50 border border-green-200"
                : result === "replay"
                ? "bg-amber-50 border border-amber-200"
                : "bg-red-50 border border-red-200"
            )}
          >
            {result === "valid" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={cn(
                  "font-medium",
                  result === "valid"
                    ? "text-green-800"
                    : result === "replay"
                    ? "text-amber-800"
                    : "text-red-800"
                )}
              >
                {result === "valid"
                  ? "✅ Signature valid"
                  : result === "replay"
                  ? "⚠️ Replay attack detected"
                  : "❌ Invalid signature"}
              </p>
              {errorMsg && <p className="text-sm mt-1 text-gray-600">{errorMsg}</p>}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={verifySignature}
            className="px-4 py-2 bg-[#0F6E56] text-white rounded-lg text-sm font-medium hover:bg-[#0D5E4A] transition-colors"
          >
            Verify Signature
          </button>
          {result !== "idle" && (
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Info callout */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>How it works:</strong> QRise signs every webhook with{" "}
          <code className="px-1 py-0.5 bg-blue-100 rounded">HMAC-SHA256</code> of{" "}
          <code className="px-1 py-0.5 bg-blue-100 rounded">timestamp.body</code>. The signature header
          format is <code className="px-1 py-0.5 bg-blue-100 rounded">t=1714000000,v1=...</code>. This demo
          verifies the signature client-side using the Web Crypto API.
        </p>
      </div>
    </div>
  )
}
