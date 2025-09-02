'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'

export default function TestAuthOnlyPage() {
  const { supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testAuthOnly = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Test 1: Try to create user with minimal data
      console.log('Testing auth-only signup...')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
        // No additional options/data
      })

      console.log('Auth-only signup response:', { data, error })

      if (!error && data.user) {
        // Test 2: Try to manually insert into our tables
        console.log('User created successfully, testing table access...')
        
        try {
          const { data: insertData, error: insertError } = await supabase
            .from('characters')
            .insert({
              user_id: data.user.id,
              name: 'Test Character',
              species: 'Human'
            })
            .select()

          console.log('Character insert test:', { insertData, insertError })

          setResult({
            success: true,
            userCreated: true,
            tableAccess: !insertError,
            userData: data,
            insertResult: { insertData, insertError }
          })

        } catch (insertErr) {
          console.error('Table insert error:', insertErr)
          setResult({
            success: true,
            userCreated: true,
            tableAccess: false,
            userData: data,
            insertError: insertErr
          })
        }

      } else {
        setResult({
          success: false,
          userCreated: false,
          authError: error
        })
      }

    } catch (err) {
      console.error('Auth test error:', err)
      setResult({
        success: false,
        userCreated: false,
        generalError: err
      })
    } finally {
      setLoading(false)
    }
  }

  const testTableDirectly = async () => {
    if (!result?.userData?.user?.id) {
      alert('No user ID available - run auth test first')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('characters')
        .insert({
          user_id: result.userData.user.id,
          name: 'Direct Test Character',
          species: 'Elf'
        })
        .select()

      console.log('Direct table test:', { data, error })
      
      setResult(prev => ({
        ...prev,
        directTableTest: { data, error }
      }))

    } catch (err) {
      console.error('Direct table test error:', err)
      setResult(prev => ({
        ...prev,
        directTableError: err
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Auth-Only Test</h1>
        
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
                placeholder="test2@example.com"
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
            
            <div className="flex gap-4">
              <button
                onClick={testAuthOnly}
                disabled={loading || !email || !password}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Testing...' : 'Test Auth Only'}
              </button>

              {result?.userData?.user?.id && (
                <button
                  onClick={testTableDirectly}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Test Table Access
                </button>
              )}
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
            
            <div className="space-y-4">
              <div className={`p-4 rounded ${
                result.userCreated ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'
              }`}>
                <div className="text-sm">
                  <strong>User Created:</strong> {result.userCreated ? 'SUCCESS' : 'FAILED'}
                </div>
              </div>

              {result.userCreated && (
                <div className={`p-4 rounded ${
                  result.tableAccess ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'
                }`}>
                  <div className="text-sm">
                    <strong>Table Access:</strong> {result.tableAccess ? 'SUCCESS' : 'FAILED'}
                  </div>
                </div>
              )}
            </div>

            <details className="mt-4">
              <summary className="text-slate-400 cursor-pointer hover:text-white">
                Full Test Data
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