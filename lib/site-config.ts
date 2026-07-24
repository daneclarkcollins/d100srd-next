/**
 * Site feature flags.
 *
 * Mike's "SagaBorn Tavern Issues" sheet (2026-07-24) asked to HIDE the
 * in-app SRD and Bestiary for now: he wants the rules on WordPress at
 * sagabornd100.com (easier for him to edit), and this app focused on
 * character creation, like D&D Beyond / Demiplane.
 *
 * NOTHING WAS DELETED. All rules/bestiary pages, content, and renderers are
 * still in the repo and still build — they're just unlinked from the nav and
 * homepage. Flip these to `true` and everything comes back.
 *
 * Deep links into /creatures/[slug] from the Encounter Builder and Combat
 * Tracker still work on purpose — stat blocks are a tool feature, not the
 * rules site.
 */
export const SHOW_SRD = false;
export const SHOW_BESTIARY = false;

/** External rules site linked while the in-app SRD is hidden. */
export const RULES_SITE_URL = 'https://sagabornd100.com';
