'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'

export default function DatabaseDebugPage() {
  const { supabase, user } = useSupabase()
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const runTests = async () => {
    setTesting(true)
    const testResults = []

    try {
      // Test 1: Basic connection
      testResults.push({ test: 'Connection', status: 'Testing...', result: null })
      
      const { data: connectionTest, error: connectionError } = await supabase
        .from('characters')
        .select('*', { count: 'exact', head: true })

      if (connectionError) {
        testResults[0] = { 
          test: 'Connection', 
          status: 'Failed', 
          result: connectionError.message,
          details: connectionError
        }
      } else {
        testResults[0] = { 
          test: 'Connection', 
          status: 'Success', 
          result: 'Connected to Supabase'
        }
      }

      // Test 2: Characters table exists
      const { data: tableTest, error: tableError } = await supabase
        .from('characters')
        .select('id')
        .limit(1)

      testResults.push({
        test: 'Characters Table',
        status: tableError ? 'Failed' : 'Success',
        result: tableError ? tableError.message : 'Table exists',
        details: tableError || null
      })

      // Test 3: Profiles table exists
      const { data: statusTest, error: statusError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      testResults.push({
        test: 'Profiles Table',
        status: statusError ? 'Failed' : 'Success',
        result: statusError ? statusError.message : 'Table exists',
        details: statusError || null
      })

      // Test 4: User authentication
      testResults.push({
        test: 'Authentication',
        status: user ? 'Success' : 'Info',
        result: user ? `Logged in as ${user.email}` : 'Not logged in',
        details: user || null
      })

      // Test 5: RLS Policies (if user is logged in)
      if (user) {
        const { data: rlsTest, error: rlsError } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', user.id)

        testResults.push({
          test: 'RLS Policies',
          status: rlsError ? 'Failed' : 'Success',
          result: rlsError ? rlsError.message : `Can access user characters (${rlsTest?.length || 0} found)`,
          details: rlsError || null
        })
      }

    } catch (err) {
      testResults.push({
        test: 'General Error',
        status: 'Failed',
        result: err instanceof Error ? err.message : 'Unknown error',
        details: err
      })
    }

    setResults(testResults)
    setTesting(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Database Debug</h1>
          <p className="text-xl text-slate-400">
            Test database connectivity and table setup
          </p>
        </header>

        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 mb-8">
          <button
            onClick={runTests}
            disabled={testing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {testing ? 'Running Tests...' : 'Run Database Tests'}
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
                      Details
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
          <h2 className="text-xl font-semibold text-white mb-4">Quick Setup Instructions</h2>
          <div className="space-y-4 text-slate-300">
            <div>
              <h3 className="font-semibold text-blue-300">If tables don't exist:</h3>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Run the migration files in this order:</li>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li><code className="bg-slate-800 px-1 rounded">001_create_characters_table.sql</code></li>
                  <li><code className="bg-slate-800 px-1 rounded">002_create_character_status_table.sql</code></li>
                </ul>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-blue-300">Environment Variables:</h3>
              <p>Make sure these are set in your <code className="bg-slate-800 px-1 rounded">.env.local</code>:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li><code className="bg-slate-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
                <li><code className="bg-slate-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}