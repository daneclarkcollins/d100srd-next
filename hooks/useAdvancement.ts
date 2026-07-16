'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { AdvancementState, emptyAdvancement, normalizeAdvancement } from '@/lib/advancement';

export type AdvancementUpdate = AdvancementState | ((prev: AdvancementState) => AdvancementState);

/**
 * Load/save the `advancement` JSONB column on a character row.
 *
 * `save` accepts either a full state or a functional update — prefer the
 * functional form so rapid actions (roll experience, learn a talent, etc.)
 * always build on the latest state instead of a stale render snapshot.
 * Writes are serialized so a slow earlier request can never overwrite a
 * later one.
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
  // Always-current mirror of `advancement` for functional updates
  const advRef = useRef<AdvancementState>(advancement);
  // Serializes DB writes so they land in the order they were issued
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

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
        const next = normalizeAdvancement(data?.advancement);
        advRef.current = next;
        setAdvancement(next);
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [characterId, user, supabase]);

  const save = useCallback(
    async (update: AdvancementUpdate) => {
      const next = typeof update === 'function' ? update(advRef.current) : update;
      advRef.current = next;
      setAdvancement(next); // optimistic
      if (!characterId || !user) return;
      setSaving(true);
      const write = async () => {
        const { error } = await supabase
          .from('characters')
          .update({ advancement: next, updated_at: new Date().toISOString() })
          .eq('id', characterId)
          .eq('user_id', user.id);
        if (error) {
          if (isMissingColumn(error.message)) setMigrationNeeded(true);
          else setError(error.message);
        }
      };
      writeQueue.current = writeQueue.current.then(write, write);
      await writeQueue.current;
      setSaving(false);
    },
    [characterId, user, supabase]
  );

  return { advancement, save, loading, saving, migrationNeeded, error };
}
