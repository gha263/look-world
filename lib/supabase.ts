// ─────────────────────────────────────────────────────────────────────────────
// lib/supabase.ts
// Single source of truth for Supabase REST access across Look 47 Studio.
// All tabs (Tag Studio, Intake, Review, Frames) import sb / sbAll from here.
// ─────────────────────────────────────────────────────────────────────────────

export const SUPABASE_URL = "https://rsslbgfbdoqxgogbuuzc.supabase.co";
export const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzc2xiZ2ZiZG9xeGdvZ2J1dXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjE2NTUsImV4cCI6MjA3NjEzNzY1NX0.lBL-KUrQbT9N4ACc-CdMauvXmhtuG9_Jr7nhIhQz-g0";

// Shared headers — every REST call needs both apikey AND Authorization: Bearer.
// Missing the Authorization header produces 401s that look like RLS failures.
export const H = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

// Standard fetch helper. Pass { prefer } to override the Prefer header,
// or any other fetch option (method, body, etc.) via opts.
export const sb = async (path: string, opts: any = {}) => {
  const { prefer, ...rest } = opts;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      ...H,
      Prefer: prefer ?? "return=representation",
    },
    ...rest,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// Targeted helper: fetch the set of look IDs that carry a given tag.
// Scoped tightly so it never hits PostgREST row caps.
export const fetchLookIdsForTag = async (tagId: string): Promise<Set<string>> => {
  const rows = await sb(
    `entity_tags?tag_id=eq.${tagId}&entity_type=eq.look&source=eq.human&select=entity_id`
  );
  return new Set<string>((rows || []).map((r: any) => r.entity_id as string));
};
