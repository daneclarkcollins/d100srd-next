'use client';

import { useSupabase } from '@/components/SupabaseProvider';
import { useEffect, useState } from 'react';

export default function TestConnection() {
  const { supabase } = useSupabase();
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (error) throw error;
        setStatus('✅ Connected to Supabase!');
      } catch (error) {
        setStatus(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    checkConnection();
  }, [supabase]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <p className="text-lg">{status}</p>
    </div>
  );
}