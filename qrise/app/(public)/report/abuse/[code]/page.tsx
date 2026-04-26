
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AbuseReportPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [reason, setReason] = useState('phishing')
  const [details, setDetails] = useState('')
  const [qrId, setQrId] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(true)

  useEffect(() => {
    // Fetch QR info to get ID
    async function fetchQr() {
      try {
        const res = await fetch(`/api/qr/info/${code}`)
        if (res.ok) {
          const data = await res.json()
          setQrId(data.id)
        }
      } catch (err) {
        console.error('Error fetching QR info:', err)
      } finally {
        setLoadingQr(false)
      }
    }
    fetchQr()
  }, [code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrId) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reports/abuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_id: qrId,
          reason,
          details
        }),
      })

      if (!res.ok) throw new Error('Failed to submit')
      setIsSubmitted(true)
      toast.success('Report submitted. We will review it shortly.')
    } catch (err) {
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingQr) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Report Received</CardTitle>
            <CardDescription>
              Thank you for helping us keep the community safe. Our team will review the QR code <strong>{code}</strong> immediately.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pt-6">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/">Back to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-white border-b border-slate-100 p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Report Abuse</CardTitle>
              <CardDescription className="text-slate-500">
                Reporting QR code: <span className="font-mono text-blue-600 font-bold uppercase">{code}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-slate-900 font-bold">Why are you reporting this QR code?</Label>
              <Select value={reason} onValueChange={(val) => val && setReason(val)}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-14 rounded-2xl focus:ring-blue-500">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-2xl shadow-xl">
                  <SelectItem value="phishing">Phishing / Scam</SelectItem>
                  <SelectItem value="malware">Malware / Virus</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="details" className="text-slate-900 font-bold text-sm">Additional Details (Optional)</Label>
              <Textarea
                id="details"
                placeholder="Please provide more information about why this link is abusive..."
                className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-8 flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-2xl shadow-lg transition-all"
              disabled={isSubmitting || !qrId}
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Submit Report'}
            </Button>
            <p className="text-center text-[11px] text-slate-400 px-8">
              By submitting this report, you help us maintain a safe community. Abuse of the reporting system may lead to IP blocking.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
