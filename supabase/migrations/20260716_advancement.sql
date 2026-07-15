-- Level-up / advancement state for saved characters.
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
--
-- The column holds a single JSON document per character:
--   { version, talentPointsEarned, talentsKnown[], experienceChecks[],
--     mana{current,max}|null, sagaPoints, legacyItems[], log[] }
-- Row-level security on `characters` already scopes it to the owning user;
-- a new column inherits the table's policies, so no policy changes needed.

alter table public.characters
  add column if not exists advancement jsonb;
