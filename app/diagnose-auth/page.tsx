'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'

export default function DiagnoseAuthPage() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const runDiagnostics = async () => {
    setLoading(true)
    const diagnostics = []

    try {
      // Test 1: Basic connection
      diagnostics.push({ test: 'Basic Connection', status: 'Testing...', result: null })
      try {
        const { data, error } = await supabase.from('characters').select('*').limit(1)
        diagnostics[0] = {
          test: 'Basic Connection',
          status: error ? 'Failed' : 'Success',
          result: error ? error.message : 'Connection working',
          details: error || data
        }
      } catch (err) {
        diagnostics[0] = {
          test: 'Basic Connection',
          status: 'Failed',
          result: 'Connection error',
          details: err
        }
      }

      // Test 2: Check auth configuration
      diagnostics.push({ test: 'Auth Config', status: 'Testing...', result: null })
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        diagnostics[1] = {
          test: 'Auth Config',
          status: 'Success',
          result: `Auth accessible, current session: ${session ? 'Active' : 'None'}`,
          details: { hasSession: !!session, error }
        }
      } catch (err) {
        diagnostics[1] = {
          test: 'Auth Config',
          status: 'Failed',
          result: 'Auth system error',
          details: err
        }
      }

      // Test 3: Environment variables check
      diagnostics.push({ test: 'Environment', status: 'Testing...', result: null })
      const envCheck = {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        urlPattern: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase') || false
      }
      diagnostics[2] = {
        test: 'Environment',
        status: envCheck.hasSupabaseUrl && envCheck.hasAnonKey ? 'Success' : 'Failed',
        result: `URL: ${envCheck.hasSupabaseUrl ? 'Set' : 'Missing'}, Key: ${envCheck.hasAnonKey ? 'Set' : 'Missing'}`,
        details: envCheck
      }

      // Test 4: Check auth settings
      diagnostics.push({ test: 'Auth Settings', status: 'Testing...', result: null })
      try {
        // This will fail but might give us useful error info
        const { data, error } = await supabase.auth.signUp({
          email: 'test-diagnostic@example.com',
          password: 'temporary-password-for-diagnostic-only'
        })

        diagnostics[3] = {
          test: 'Auth Settings',
          status: error ? 'Failed' : 'Success',
          result: error ? `Auth Error: ${error.message}` : 'Auth signup accessible',
          details: { error, data }
        }
      } catch (err) {
        diagnostics[3] = {
          test: 'Auth Settings',
          status: 'Failed', 
          result: 'Auth signup failed',
          details: err
        }
      }

      // Test 5: Check auth.users access (might not work due to RLS)
      diagnostics.push({ test: 'Auth Schema', status: 'Testing...', result: null })
      try {
        const { data, error, count } = await supabase
          .from('auth.users')
          .select('*', { count: 'exact', head: true })

        diagnostics[4] = {
          test: 'Auth Schema',
          status: error ? 'Limited Access' : 'Success',
          result: error ? `Cannot access auth.users: ${error.message}` : `Auth users table accessible`,
          details: { error, count }
        }
      } catch (err) {
        diagnostics[4] = {
          test: 'Auth Schema',
          status: 'Limited Access',
          result: 'Cannot access auth schema (this is normal)',
          details: err
        }
      }

      // Test 6: Try to check Supabase client configuration
      diagnostics.push({ test: 'Client Config', status: 'Testing...', result: null })
      try {
        const clientDetails = {
          hasSupabase: !!supabase,
          hasAuth: !!supabase?.auth,
          hasFrom: !!supabase?.from,
          authUrl: supabase?.supabaseUrl || 'unknown',
          authKey: supabase?.supabaseKey ? supabase.supabaseKey.substring(0, 20) + '...' : 'unknown'
        }

        diagnostics[5] = {
          test: 'Client Config',
          status: 'Success',
          result: 'Supabase client properly initialized',
          details: clientDetails
        }
      } catch (err) {
        diagnostics[5] = {
          test: 'Client Config',
          status: 'Failed',
          result: 'Supabase client configuration error',
          details: err
        }
      }

    } catch (generalErr) {
      diagnostics.push({
        test: 'General Error',
        status: 'Failed',
        result: 'Unexpected error during diagnostics',
        details: generalErr
      })
    }

    setResults(diagnostics)
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Supabase Auth Diagnostics</h1>
        
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 mb-8">
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`bg-slate-900 p-4 rounded-lg border ${
                  result.status === 'Success' ? 'border-green-600' :
                  result.status === 'Failed' ? 'border-red-600' :
                  'border-yellow-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{result.test}</h3>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    result.status === 'Success' ? 'bg-green-600 text-white' :
                    result.status === 'Failed' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-black'
                  }`}>
                    {result.status}
                  </span>
                </div>
                <p className="text-slate-300 mb-2">{result.result}</p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-slate-400 cursor-pointer hover:text-white">
                      Technical Details
                    </summary>
                    <pre className="mt-2 p-2 bg-slate-800 rounded text-xs text-slate-300 overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Potential Solutions</h2>
          <div className="space-y-4 text-slate-300">
            <div>
              <h3 className="font-semibold text-blue-300">If Auth Settings fail:</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>Check Supabase Dashboard → Authentication → Settings</li>
                <li>Ensure "Enable email confirmations" is set correctly</li>
                <li>Check if custom SMTP is configured properly</li>
                <li>Verify Auth policies in Dashboard</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-300">If Environment fails:</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>Check <code className="bg-slate-800 px-1 rounded">.env.local</code> file</li>
                <li>Restart development server after env changes</li>
                <li>Verify URL format: https://xxx.supabase.co</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}