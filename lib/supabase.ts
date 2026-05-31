// ─────────────────────────────────────────────────────────────────────────────
// lib/supabase.ts
// Single source of truth for Supabase REST access across Look 47 Studio.
// All tabs (Tag Studio, Intake, Review, Frames) import sb / sbAll from here.
// ─────────────────────────────────────────────────────────────────────────────

export const SUPABASE_URL = "https://rsslbgfbdoqxgogbuuzc.supabase.co";
export const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzc2xiZ2ZiZG9xeGdvZ2J1dXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjE2NTUsImV4cCI6MjA3NjEzNzY1NX0.lBL-KUrQbT9N4ACc-CdMauvXmhtuG9_Jr7nhIhQz-g0";

// Shared headers — every REST call needs both apikey AND Authorization: Bearer.
export const H = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

// Standard fetch helper.
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

// Fetch the set of look IDs that carry a given tag.
// Includes both human-tagged and AI-approved (Ring 1 auto-applied).
// This powers Browse mode, Frames look counts, and tag filter in Tag Studio.
export const fetchLookIdsForTag = async (tagId: string): Promise<Set<string>> => {
  const rows = await sb(
    `entity_tags?tag_id=eq.${tagId}&entity_type=eq.look&select=entity_id,source,status`
  );
  return new Set<string>(
    (rows || [])
      .filter((r: any) => r.source === "human" || (r.source === "ai" && r.status === "approved"))
      .map((r: any) => r.entity_id as string)
  );
};
