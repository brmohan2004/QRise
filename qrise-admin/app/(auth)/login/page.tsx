'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithMagicLink, signInWithCredentials } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  
  // Initialize error with URL query param if it exists
  const queryError = searchParams.get('error')
  const [error, setError] = useState<string | null>(queryError)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'magic_link' | 'password'>('magic_link')
  
  useEffect(() => {
    // If URL query changes to have an error, update state and stop loading
    if (queryError) {
      setError(queryError)
      setIsLoading(false)
    }
  }, [queryError])

  useEffect(() => {
    const supabase = createClient()
    
    // Check if there is an error in the hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const hashError = hashParams.get('error_description') || hashParams.get('error')
      if (hashError) {
        setError(decodeURIComponent(hashError.replace(/\+/g, ' ')))
        setIsLoading(false)
        // Clear the hash so it doesn't persist
        window.history.replaceState(null, '', window.location.pathname)
      }
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      // Only redirect to dashboard if there's a session AND no error in the URL
      if (session && !queryError) {
        router.push('/dashboard')
      }
    }
    
    checkSession()

    // Listen for auth state changes (e.g., when the hash is parsed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    
    if (loginMethod === 'password') {
      const result = await signInWithCredentials(formData)
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else {
        router.push('/dashboard')
      }
    } else {
      const result = await signInWithMagicLink(formData)
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else {
        setIsSuccess(true)
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#111] border-[#222] text-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">QRise Admin</CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Enter your email to receive a secure login link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <Alert className="bg-green-900/20 border-green-900/50 text-green-400">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Check your email for a magic link to complete your login.
              </AlertDescription>
            </Alert>
          ) : (
              <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@qrise.com"
                  required
                  disabled={isLoading}
                  className="bg-[#0a0a0a] border-[#333] text-white focus:ring-1 focus:ring-gray-500"
                />
              </div>
              
              {loginMethod === 'password' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="bg-[#0a0a0a] border-[#333] text-white focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              )}

              {error && (
                <div className="text-sm text-red-500 font-medium">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-gray-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {loginMethod === 'password' ? 'Sign In' : 'Send Magic Link'}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod(prev => prev === 'magic_link' ? 'password' : 'magic_link')
                    setError(null)
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {loginMethod === 'password' ? 'Use Magic Link instead' : 'Log in with Password'}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

