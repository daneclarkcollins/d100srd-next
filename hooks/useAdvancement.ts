'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { AdvancementState, emptyAdvancement, normalizeAdvancement } from '@/lib/advancement';

/**
 * Load/save the `advancement` JSONB column on a character row.
 *
 * Gracefully detects when the column hasn't been added yet (the migration in
 * supabase/migrations/20260716_advancement.sql) and reports it via
 * `migrationNeeded` instead of erroring.
 */
export function useAdvancement(characterId: string | null) {
  const { user, supabase } = useSupabase();
  const [advancement, setAdvancement] = useState<AdvancementState>(emptyAdvancement());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMissingColumn = (message: string) =>
    /advancement.*(column|does not exist)|column.*advancement/i.test(message);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!characterId || !user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('characters')
        .select('advancement')
        .eq('id', characterId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        if (isMissingColumn(error.message)) setMigrationNeeded(true);
        else setError(error.message);
      } else {
        setAdvancement(normalizeAdvancement(data?.advancement));
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [characterId, user, supabase]);

  const save = useCallback(
    async (next: AdvancementState) => {
      setAdvancement(next); // optimistic
      if (!characterId || !user) return;
      setSaving(true);
      const { error } = await supabase
        .from('characters')
        .update({ advancement: next, updated_at: new Date().toISOString() })
        .eq('id', characterId)
        .eq('user_id', user.id);
      if (error) {
        if (isMissingColumn(error.message)) setMigrationNeeded(true);
        else setError(error.message);
      }
      setSaving(false);
    },
    [characterId, user, supabase]
  );

  return { advancement, save, loading, saving, migrationNeeded, error };
}
