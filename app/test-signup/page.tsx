'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'

export default function TestSignupPage() {
  const { supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testSignup = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('Attempting signup with:', { email, password: '***' })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: 'test-user',
          }
        }
      })

      console.log('Signup response:', { data, error })

      setResult({
        success: !error,
        data: data,
        error: error ? {
          message: error.message,
          status: error.status,
          details: error
        } : null
      })

    } catch (err) {
      console.error('Signup catch block:', err)
      setResult({
        success: false,
        error: {
          message: err instanceof Error ? err.message : 'Unknown error',
          details: err
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Signup Debug Test</h1>
        
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Test Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                placeholder="test@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Test Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                placeholder="password123"
              />
            </div>
            
            <button
              onClick={testSignup}
              disabled={loading || !email || !password}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Testing Signup...' : 'Test Signup'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
            
            <div className={`p-4 rounded mb-4 ${
              result.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'
            }`}>
              <div className="text-sm">
                <strong>Status:</strong> {result.success ? 'SUCCESS' : 'FAILED'}
              </div>
            </div>

            {result.error && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-300 mb-2">Error Details:</h3>
                <div className="bg-slate-800 p-3 rounded">
                  <div className="text-sm text-red-200 mb-2">
                    <strong>Message:</strong> {result.error.message}
                  </div>
                  {result.error.status && (
                    <div className="text-sm text-red-200 mb-2">
                      <strong>Status:</strong> {result.error.status}
                    </div>
                  )}
                </div>
              </div>
            )}

            <details className="mt-4">
              <summary className="text-slate-400 cursor-pointer hover:text-white">
                Full Response Data
              </summary>
              <pre className="mt-2 p-3 bg-slate-800 rounded text-xs text-slate-300 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}