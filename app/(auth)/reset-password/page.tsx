'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/components/SupabaseProvider'

export default function ResetPasswordPage() {
  const { supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-white">
              Check your email
            </h2>
          </div>
          
          <div className="bg-slate-800 rounded-lg shadow-xl p-8">
            <div className="bg-green-900/50 border border-green-700 rounded-md p-4 mb-6">
              <div className="text-sm text-green-200">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your email and follow the instructions to reset your password.
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">
                Didn't receive an email? Check your spam folder or try again.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  className="inline-flex justify-center py-2 px-4 border border-slate-600 text-sm font-medium rounded-md text-gray-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-800 transition-colors mr-3"
                >
                  Try again
                </button>
                <Link
                  href="/login"
                  className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-800 transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-md p-4">
                <div className="flex">
                  <div className="text-sm text-red-200">
                    {error}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending reset link...' : 'Send reset link'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Back to sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}