'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'

interface TableInfo {
  name: string
  exists: boolean
  error?: string
  sampleCount?: number
  structure?: string[]
}

export default function SchemaDebugPage() {
  const { supabase, user } = useSupabase()
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [sqlCommands, setSqlCommands] = useState<string[]>([])

  useEffect(() => {
    async function checkSchema() {
      if (!supabase) return

      const tableChecks: TableInfo[] = []

      // Check characters table
      try {
        const { data, error } = await supabase
          .from('characters')
          .select('id, name, user_id')
          .limit(1)
        
        tableChecks.push({
          name: 'characters',
          exists: !error,
          error: error?.message,
          sampleCount: data?.length || 0
        })
      } catch (e: any) {
        tableChecks.push({
          name: 'characters',
          exists: false,
          error: e.message
        })
      }

      // Check profiles table
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
        
        tableChecks.push({
          name: 'profiles',
          exists: !error,
          error: error?.message,
          sampleCount: data?.length || 0,
          structure: data?.[0] ? Object.keys(data[0]) : []
        })
      } catch (e: any) {
        tableChecks.push({
          name: 'profiles',
          exists: false,
          error: e.message
        })
      }

      // Check character_profiles table
      try {
        const { data, error } = await supabase
          .from('character_profiles')
          .select('*')
          .limit(1)
        
        tableChecks.push({
          name: 'character_profiles',
          exists: !error,
          error: error?.message,
          sampleCount: data?.length || 0,
          structure: data?.[0] ? Object.keys(data[0]) : []
        })
      } catch (e: any) {
        tableChecks.push({
          name: 'character_profiles',
          exists: false,
          error: e.message
        })
      }

      setTables(tableChecks)

      // Generate SQL commands based on findings
      const commands: string[] = []
      
      const charactersExists = tableChecks.find(t => t.name === 'characters')?.exists
      const profilesExists = tableChecks.find(t => t.name === 'profiles')?.exists
      const characterProfilesExists = tableChecks.find(t => t.name === 'character_profiles')?.exists

      if (!characterProfilesExists && !profilesExists) {
        // Need to create the table from scratch
        commands.push(`-- Create character_profiles table
CREATE TABLE IF NOT EXISTS character_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  current_hp INTEGER,
  current_sp INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, character_id)
);

-- Create indexes for better performance
CREATE INDEX idx_character_profiles_user_id ON character_profiles(user_id);
CREATE INDEX idx_character_profiles_character_id ON character_profiles(character_id);

-- Enable Row Level Security
ALTER TABLE character_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own character profiles" 
  ON character_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own character profiles" 
  ON character_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own character profiles" 
  ON character_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own character profiles" 
  ON character_profiles FOR DELETE 
  USING (auth.uid() = user_id);`)
      } else if (profilesExists && !characterProfilesExists) {
        // profiles table exists, might need to rename or use it
        commands.push(`-- Option 1: Rename profiles table to character_profiles
ALTER TABLE profiles RENAME TO character_profiles;

-- OR --

-- Option 2: Create character_profiles as an alias view
CREATE VIEW character_profiles AS SELECT * FROM profiles;`)
      } else if (characterProfilesExists) {
        // Table exists, might need to check/fix constraints
        commands.push(`-- Table exists! Check if unique constraint is properly set
-- If you're getting duplicate key errors, try:

-- Drop existing constraint if it exists
ALTER TABLE character_profiles 
DROP CONSTRAINT IF EXISTS character_profiles_user_id_character_id_key;

-- Recreate with proper unique constraint
ALTER TABLE character_profiles 
ADD CONSTRAINT character_profiles_user_id_character_id_key 
UNIQUE (user_id, character_id);`)
      }

      if (charactersExists) {
        commands.push(`-- Ensure characters table has proper constraints
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;`)
      }

      setSqlCommands(commands)
      setLoading(false)
    }

    checkSchema()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Database Schema Debug</h1>
          <div className="text-gray-400">Checking database schema...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Database Schema Debug</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Table Status */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">📊 Table Status</h2>
              
              {tables.map((table) => (
                <div key={table.name} className="mb-4 p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3 h-3 rounded-full ${table.exists ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <h3 className="text-lg font-semibold text-white">{table.name}</h3>
                  </div>
                  
                  {table.exists ? (
                    <div className="text-green-200">
                      <p>✅ Table exists</p>
                      {table.structure && table.structure.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Columns:</p>
                          <div className="flex flex-wrap gap-1">
                            {table.structure.map(col => (
                              <span key={col} className="text-xs bg-slate-600 px-2 py-1 rounded">{col}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-200">
                      <p>❌ Table does not exist</p>
                      {table.error && (
                        <p className="text-xs text-red-300 mt-1">
                          {table.error.includes('does not exist') ? 'Table not found' : table.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-900 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">🔍 Analysis</h2>
              <div className="text-blue-200 space-y-2">
                {tables.find(t => t.name === 'characters')?.exists ? (
                  <p>✅ Characters table exists</p>
                ) : (
                  <p>❌ Characters table missing - core functionality affected</p>
                )}
                
                {tables.find(t => t.name === 'character_profiles')?.exists ? (
                  <p>✅ Character profiles table exists</p>
                ) : tables.find(t => t.name === 'profiles')?.exists ? (
                  <p>⚠️ Found "profiles" table but not "character_profiles"</p>
                ) : (
                  <p>❌ No character profiles table - HP/SP persistence will fail</p>
                )}

                {!user && (
                  <p className="text-yellow-300 mt-4">
                    ℹ️ Not logged in - some tables might appear missing due to RLS policies
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - SQL Commands */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">🛠️ SQL Commands to Fix</h2>
              
              {sqlCommands.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Run these commands in your Supabase SQL Editor:
                  </p>
                  {sqlCommands.map((command, index) => (
                    <div key={index} className="relative">
                      <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                        {command}
                      </pre>
                      <button
                        onClick={() => navigator.clipboard.writeText(command)}
                        className="absolute top-2 right-2 px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-400">
                  ✅ No issues detected - schema appears to be correct!
                </p>
              )}
            </div>

            <div className="bg-yellow-900 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">📝 How to Apply</h2>
              <ol className="text-yellow-200 space-y-2 text-sm">
                <li>1. Go to your Supabase Dashboard</li>
                <li>2. Navigate to SQL Editor</li>
                <li>3. Copy the SQL commands above</li>
                <li>4. Paste and run them</li>
                <li>5. Refresh this page to verify</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}