'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import { CheckCircle, XCircle, AlertTriangle, Database, Copy } from 'lucide-react'

export default function SetupPage() {
  const { supabase, user } = useSupabase()
  const [checking, setChecking] = useState(false)
  const [setupStatus, setSetupStatus] = useState<{
    connected: boolean
    tablesExist: boolean
    rlsEnabled: boolean
    canCreateCharacter: boolean
  } | null>(null)

  const checkSetup = async () => {
    setChecking(true)
    
    const status = {
      connected: false,
      tablesExist: false,
      rlsEnabled: false,
      canCreateCharacter: false
    }

    try {
      // Test connection
      const { error: connectionError } = await supabase.from('characters').select('count(*)', { count: 'exact' }).limit(1)
      status.connected = !connectionError
      status.tablesExist = !connectionError?.message.includes('does not exist')

      if (status.tablesExist && user) {
        // Test RLS
        const { error: rlsError } = await supabase.from('characters').select('id').eq('user_id', user.id).limit(1)
        status.rlsEnabled = !rlsError

        // Test character creation
        if (status.rlsEnabled) {
          status.canCreateCharacter = true
        }
      }
    } catch (err) {
      console.error('Setup check failed:', err)
    }

    setSetupStatus(status)
    setChecking(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const migration1 = `-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    species TEXT,
    biology TEXT,
    culture TEXT,
    heritage TEXT,
    profession TEXT,
    archetype TEXT,
    age INTEGER,
    characteristics JSONB NOT NULL DEFAULT '{"STR":0,"CON":0,"SIZ":0,"INT":0,"ACU":0,"DEX":0,"SOC":0}',
    derived_stats JSONB NOT NULL DEFAULT '{"effort":0,"stamina":0,"intellect":0,"spirit":0,"agility":0,"charm":0,"hitPoints":0,"spiritPoints":0,"damageModifier":"None","experienceBonus":0,"movementSpeed":25,"horrorResistance":0}',
    skills JSONB NOT NULL DEFAULT '{}',
    lifespan INTEGER NOT NULL DEFAULT 0,
    height TEXT NOT NULL DEFAULT '',
    weight TEXT NOT NULL DEFAULT '',
    speed INTEGER NOT NULL DEFAULT 0,
    special_abilities TEXT[] NOT NULL DEFAULT '{}',
    starting_equipment TEXT[] NOT NULL DEFAULT '{}',
    starting_funds TEXT NOT NULL DEFAULT '',
    starting_funds_amount INTEGER NOT NULL DEFAULT 0,
    current_step TEXT NOT NULL DEFAULT 'species',
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own characters
CREATE POLICY "Users can view own characters" ON characters
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own characters
CREATE POLICY "Users can insert own characters" ON characters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own characters
CREATE POLICY "Users can update own characters" ON characters
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own characters
CREATE POLICY "Users can delete own characters" ON characters
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_updated_at ON characters(updated_at);
CREATE INDEX idx_characters_is_active ON characters(user_id, is_active);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();`

  const migration2 = `-- Create character_status table for tracking current HP/SP
CREATE TABLE IF NOT EXISTS character_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_hp INTEGER NOT NULL DEFAULT 0,
    current_sp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one status record per character per user
    UNIQUE(character_id, user_id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE character_status ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own character status
CREATE POLICY "Users can view own character status" ON character_status
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own character status
CREATE POLICY "Users can insert own character status" ON character_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own character status
CREATE POLICY "Users can update own character status" ON character_status
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own character status
CREATE POLICY "Users can delete own character status" ON character_status
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_character_status_character_id ON character_status(character_id);
CREATE INDEX idx_character_status_user_id ON character_status(user_id);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_character_status_updated_at
    BEFORE UPDATE ON character_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Database Setup</h1>
          <p className="text-xl text-slate-400">
            Set up your Supabase database for SagaBorn character management
          </p>
        </header>

        {/* Status Check */}
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Setup Status</h2>
            <button
              onClick={checkSetup}
              disabled={checking}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {checking ? 'Checking...' : 'Check Setup'}
            </button>
          </div>

          {setupStatus && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {setupStatus.connected ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-white">Database Connection</span>
              </div>
              
              <div className="flex items-center gap-3">
                {setupStatus.tablesExist ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-white">Tables Created</span>
              </div>
              
              <div className="flex items-center gap-3">
                {setupStatus.rlsEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : user ? (
                  <XCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                )}
                <span className="text-white">
                  Row Level Security {!user && '(Login required to test)'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {setupStatus.canCreateCharacter ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-white">Character Creation Ready</span>
              </div>

              {setupStatus.connected && setupStatus.tablesExist && setupStatus.rlsEnabled && setupStatus.canCreateCharacter && (
                <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 mt-4">
                  <div className="text-green-200">
                    🎉 <strong>Setup Complete!</strong> Your database is ready for character management.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Step 1: Create Database Tables
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-slate-300 mb-4">
                  Run these SQL commands in your Supabase SQL Editor to create the required tables:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-blue-300">Migration 1: Characters Table</h3>
                      <button
                        onClick={() => copyToClipboard(migration1)}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <pre className="bg-slate-800 p-4 rounded-lg text-xs text-slate-300 overflow-auto max-h-32">
{migration1}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-blue-300">Migration 2: Character Status Table</h3>
                      <button
                        onClick={() => copyToClipboard(migration2)}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <pre className="bg-slate-800 p-4 rounded-lg text-xs text-slate-300 overflow-auto max-h-32">
{migration2}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4">Step 2: How to Run Migrations</h2>
            <ol className="list-decimal ml-6 space-y-2 text-slate-300">
              <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Supabase Dashboard</a></li>
              <li>Select your project</li>
              <li>Navigate to <strong>SQL Editor</strong> in the left sidebar</li>
              <li>Click <strong>+ New Query</strong></li>
              <li>Copy and paste <strong>Migration 1</strong> first, then click <strong>Run</strong></li>
              <li>Create another new query for <strong>Migration 2</strong> and run it</li>
              <li>Come back here and click <strong>Check Setup</strong> to verify everything is working</li>
            </ol>
          </div>

          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4">Step 3: Test Your Setup</h2>
            <div className="space-y-4 text-slate-300">
              <p>After running the migrations:</p>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Click <strong>"Check Setup"</strong> above to verify all tables are created</li>
                <li>Try creating an account or logging in</li>
                <li>Go to the <strong>Character Builder</strong> to create your first character</li>
                <li>Test the <strong>Dice Roller</strong> with your character's skills</li>
              </ol>
              
              <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mt-4">
                <div className="text-blue-200">
                  <strong>Need Help?</strong> If you encounter any issues, check the browser console for error messages, 
                  or visit the <a href="/debug/database" className="text-blue-300 hover:text-blue-200">Database Debug</a> page 
                  for more detailed testing.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}