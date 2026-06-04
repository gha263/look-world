"use client";

import { useState, useEffect, useRef } from "react";
import { sb, H, SUPABASE_URL } from "@/lib/supabase";
import { C, FONT_IMPORT } from "@/lib/theme";

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Typeahead (bare — sits inside grid cells / rows) ────────────────────────────

function Typeahead({ items, value, onChange, onClear, placeholder, onCreateClick, width }: any) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? items.filter((i: any) => i.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const wrapStyle = width
    ? { position: "relative" as const, width, flexShrink: 0 }
    : { position: "relative" as const, flex: 1 };

  if (value) return (
    <div style={{ ...wrapStyle, display: "flex", alignItems: "center", gap: 6, background: C.lift3, borderRadius: 10, padding: "8px 12px" }}>
      <span style={{ flex: 1, fontSize: 13, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value.name}</span>
      <button tabIndex={-1} onClick={onClear} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
    </div>
  );

  return (
    <div style={wrapStyle} ref={ref}>
      <input
        value={query}
        placeholder={placeholder || "Search..."}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === "Tab" || e.key === "Escape") setOpen(false); }}
        style={{ background: C.lift3, border: "none", color: C.text, padding: "8px 12px", fontSize: 13, borderRadius: 10, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "Inter,sans-serif" }}
      />
      {open && (filtered.length > 0 || (query.length > 1 && onCreateClick)) && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.lift2, borderRadius: 10, zIndex: 300, marginTop: 3, boxShadow: "0 4px 16px rgba(0,0,0,0.4)", maxHeight: 200, overflowY: "auto" }}>
          {filtered.map((item: any) => (
            <div key={item.id} style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, color: C.text, borderBottom: `1px solid ${C.lift1}` }}
              onMouseDown={() => { onChange(item); setQuery(""); setOpen(false); }}>
              {item.name}
              {item.primary_role && <span style={{ marginLeft: 8, fontSize: 11, color: C.muted }}>{item.primary_role}</span>}
              {item.location_type && <span style={{ marginLeft: 8, fontSize: 11, color: C.muted }}>{item.location_type}</span>}
            </div>
          ))}
          {query.length > 1 && onCreateClick && !filtered.find((i: any) => i.name.toLowerCase() === query.toLowerCase()) && (
            <div onMouseDown={() => { onCreateClick(query); setQuery(""); setOpen(false); }}
              style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#4a9eff", fontWeight: 500 }}>
              + Create "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Modals (person + brand) — mirror Intake's shape ─────────────────────────────

function CreatePersonModal({ initialName, role, roles, onSave, onClose, onCreateRole }: any) {
  const [name, setName] = useState(initialName || "");
  const [selectedRole, setSelectedRole] = useState<any>(
    () => roles.find((r: any) => r.slug === (role || "").replace(/_/g, "-")) || null
  );
  const [ig, setIg] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const result = await fetch(`${SUPABASE_URL}/rest/v1/people`, {
        method: "POST",
        headers: { ...H, Prefer: "return=representation" },
        body: JSON.stringify({ name: name.trim(), slug: slugify(name), primary_role: selectedRole?.name || null, instagram_url: ig.trim() || null, website: website.trim() || null }),
      });
      if (!result.ok) throw new Error(await result.text());
      const [created] = await result.json();
      onSave(created);
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const inp2 = { background: C.lift3, border: "none" as const, color: "#ececec", padding: "9px 12px", fontSize: 13, borderRadius: 10, outline: "none", width: "100%", boxSizing: "border-box" as const, fontFamily: "Inter,sans-serif" };
  const lbl = { fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.07em" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.lift1, borderRadius: 18, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.lift2}` }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#ececec" }}>New Person</span>
          <button tabIndex={-1} onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", padding: 0 }}>×</button>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={lbl}>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus style={inp2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={lbl}>Role</label>
            <Typeahead
              items={roles}
              value={selectedRole}
              onChange={(r: any) => setSelectedRole(r)}
              onClear={() => setSelectedRole(null)}
              placeholder="Search or create role..."
              onCreateClick={async (newRoleName: string) => {
                const created = await onCreateRole(newRoleName);
                if (created) setSelectedRole(created);
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={lbl}>Instagram URL</label>
            <input value={ig} onChange={e => setIg(e.target.value)} placeholder="https://instagram.com/handle" style={inp2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={lbl}>Website</label>
            <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." style={inp2} />
          </div>
        </div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.lift2}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button tabIndex={-1} onClick={onClose} style={{ background: C.lift2, border: "none", color: C.muted, padding: "8px 18px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontFamily: "Inter,sans-serif" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !name.trim()} style={{ background: "#ececec", border: "none", color: "#212121", padding: "8px 20px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontWeight: 600, fontFamily: "Inter,sans-serif", opacity: saving || !name.trim() ? 0.4 : 1 }}>
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateBrandModal({ initialName, onSave, onClose }: any) {
  const [name, setName] = useState(initialName || "");
  const [ig, setIg] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const result = await fetch(`${SUPABASE_URL}/rest/v1/brands`, {
        method: "POST",
        headers: { ...H, Prefer: "return=representation" },
        body: JSON.stringify({ name: name.trim(), slug: slugify(name), instagram_handle: ig.trim() || null, website: website.trim() || null }),
      });
      if (!result.ok) throw new Error(await result.text());
      const [created] = await result.json();
      onSave(created);
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const inp2 = { background: C.lift3, border: "none" as const, color: "#ececec", padding: "9px 12px", fontSize: 13, borderRadius: 10, outline: "none", width: "100%", boxSizing: "border-box" as const, fontFamily: "Inter,sans-serif" };
  const lbl = { fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.07em" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.lift1, borderRadius: 18, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.lift2}` }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#ececec" }}>New Brand</span>
          <button tabIndex={-1} onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", padding: 0 }}>×</button>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={lbl}>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus style={inp2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={lbl}>Instagram Handle</label>
            <input value={ig} onChange={e => setIg(e.target.value)} placeholder="@handle" style={inp2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={lbl}>Website</label>
            <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." style={inp2} />
          </div>
        </div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.lift2}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button tabIndex={-1} onClick={onClose} style={{ background: C.lift2, border: "none", color: C.muted, padding: "8px 18px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontFamily: "Inter,sans-serif" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !name.trim()} style={{ background: "#ececec", border: "none", color: "#212121", padding: "8px 20px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontWeight: 600, fontFamily: "Inter,sans-serif", opacity: saving || !name.trim() ? 0.4 : 1 }}>
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreatePlatformModal({ initialName, onSave, onClose }: any) {
  const [name, setName] = useState(initialName || "");
  const [ig, setIg] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const result = await fetch(`${SUPABASE_URL}/rest/v1/source_platforms`, {
        method: "POST",
        headers: { ...H, Prefer: "return=representation" },
        body: JSON.stringify({ name: name.trim(), slug: slugify(name), instagram_handle: ig.trim() || null, website: website.trim() || null }),
      });
      if (!result.ok) throw new Error(await result.text());
      const [created] = await result.json();
      onSave(created);
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const inp2 = { background: C.lift3, border: "none" as const, color: "#ececec", padding: "9px 12px", fontSize: 13, borderRadius: 10, outline: "none", width: "100%", boxSizing: "border-box" as const, fontFamily: "Inter,sans-serif" };
  const lbl = { fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.07em" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.lift1, borderRadius: 18, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.lift2}` }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#ececec" }}>New Publication</span>
          <button tabIndex={-1} onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", padding: 0 }}>×</button>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={lbl}>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus style={inp2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={lbl}>Instagram Handle</label>
            <input value={ig} onChange={e => setIg(e.target.value)} placeholder="@harpersbazaarserbia" style={inp2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={lbl}>Website</label>
            <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." style={inp2} />
          </div>
        </div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.lift2}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button tabIndex={-1} onClick={onClose} style={{ background: C.lift2, border: "none", color: C.muted, padding: "8px 18px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontFamily: "Inter,sans-serif" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !name.trim()} style={{ background: "#ececec", border: "none", color: "#212121", padding: "8px 20px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontWeight: 600, fontFamily: "Inter,sans-serif", opacity: saving || !name.trim() ? 0.4 : 1 }}>
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function F({ label, children, span2 = false }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: span2 ? "1 / -1" : undefined }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>}
      {children}
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.lift2}`, paddingBottom: 6, marginBottom: 2, gridColumn: "1 / -1" }}>
      {title}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

type Look = {
  id: string; status: string; cloudinary_url: string;
  source_url: string | null; source_name: string | null; source_platform_id: string | null;
  scene: string | null; gender: string | null;
  season_display: string | null; season_term: string | null; season_year: number | null;
  date_published: string | null; is_key_look: boolean; notes: string | null;
  created_at: string;
  is_collaboration: boolean;
  event_id: string | null; photo_city_id: string | null; photo_country_id: string | null;
  collection_title: string | null; collection_description: string | null;
  publication_id: string | null;
  publication_issue_month: number | null;
  publication_issue_year: number | null;
  // Derived from look_brand_credits embed
  brands_display: string;
  brand_count: number;
  credit_count: number; tag_count: number;
};

type Contributor = { key: string; role: any; person: any };
type BrandRow = { key: string; brand: any; isCourtesy: boolean };

// ── Contributor clipboard ─────────────────────────────────────────────────────
// Module-level (not state) so it persists across look navigation for the session.
// Holds contributor rows (person + role) copied from one look, ready to paste into others.
// Creative director role is always excluded on paste — it belongs to the brand, not the shoot.
let contributorClipboard: { person: any; role: any }[] = [];

export default function ReviewQueue() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all"|"draft"|"published"|"archived">("draft");
  const [selected, setSelected] = useState<Look | null>(null);
  const [saving, setSaving] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");

  const [brands, setBrands] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [creditRoles, setCreditRoles] = useState<any[]>([]);

  // Edit state
  const [brandRows, setBrandRows] = useState<BrandRow[]>([]);
  const [editIsCollab, setEditIsCollab] = useState(false);
  const [contributors, setContributors] = useState<Contributor[]>([]);

  const [editScene, setEditScene] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editSeasonTerm, setEditSeasonTerm] = useState("");
  const [editSeasonYear, setEditSeasonYear] = useState("");
  const [editPublishDate, setEditPublishDate] = useState("");
  const [editSourceUrl, setEditSourceUrl] = useState("");
  const [editSourceName, setEditSourceName] = useState("");
  const [editSourcePlatform, setEditSourcePlatform] = useState<any>(null);
  const [editCloudinaryUrl, setEditCloudinaryUrl] = useState("");
  const [editPublication, setEditPublication] = useState<any>(null);
  const [editPublicationIssueMonth, setEditPublicationIssueMonth] = useState("");
  const [editPublicationIssueYear, setEditPublicationIssueYear] = useState("");
  const [editEvent, setEditEvent] = useState<any>(null);
  const [editPhotoCity, setEditPhotoCity] = useState<any>(null);
  const [editPhotoCountry, setEditPhotoCountry] = useState<any>(null);
  const [editCollectionTitle, setEditCollectionTitle] = useState("");
  const [editCollectionDesc, setEditCollectionDesc] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editKeyLook, setEditKeyLook] = useState(false);

  const [personModal, setPersonModal] = useState<{name: string; role: string; target: string} | null>(null);
  const [brandModal, setBrandModal] = useState<{name: string; target: string} | null>(null);
  const [publicationModal, setPublicationModal] = useState<string | null>(null);

  useEffect(() => { loadEntities(); }, []);
  useEffect(() => { loadLooks(); }, [statusFilter]);

  const cdRole = () => creditRoles.find(r => r.slug === "creative-director") || creditRoles[0];

  const loadEntities = async () => {
    try {
      const [b, p, e, l, pl, cr] = await Promise.all([
        sb("brands?select=id,name&order=name"),
        sb("people?select=id,name,primary_role&order=name"),
        sb("events?select=id,name,event_type&order=name"),
        sb("locations?select=id,name,location_type&order=location_type,name"),
        sb("source_platforms?select=id,name,slug&order=name"),
        sb("credit_roles?select=id,slug,name,sort_order&order=sort_order"),
      ]);
      setBrands(b); setPeople(p); setEvents(e); setLocations(l); setPlatforms(pl); setCreditRoles(cr);
    } catch(e) { console.error(e); }
  };

  // List query reads brands from look_brand_credits (no longer brand_id).
  const loadLooks = async () => {
    setLoading(true); setSelected(null); setLoadError(null);
    try {
      const allLooks = await sb("looks?select=status");
      const c: Record<string, number> = { draft: 0, published: 0, archived: 0 };
      allLooks.forEach((l: any) => { c[l.status] = (c[l.status] || 0) + 1; });
      setCounts(c);

      const filter = statusFilter === "all" ? "" : `status=eq.${statusFilter}&`;
      // Fetch looks first, then fetch entity_tags filtered to only those look IDs.
      // Filtering by look IDs avoids hitting the default PostgREST 1000-row limit on the
      // full entity_tags table. Range header allows up to 50k rows (covers 1000 looks
      // at ~50 tags each comfortably).
      const data = await sb(`looks?${filter}select=id,status,cloudinary_url,source_url,source_name,source_platform_id,scene,gender,season_display,season_term,season_year,date_published,is_key_look,notes,created_at,is_collaboration,event_id,photo_city_id,photo_country_id,collection_title,collection_description,publication_id,publication_issue_month,publication_issue_year,look_brand_credits(brand_id,credit_order,brands(name)),look_credits!look_credits_look_id_fkey(id)&order=created_at.desc&limit=1000`);

      const tagCountMap: Record<string, number> = {};
      if (data.length > 0) {
        const lookIds = data.map((l: any) => l.id).join(",");
        const tagRows = await fetch(
          `${SUPABASE_URL}/rest/v1/entity_tags?entity_id=in.(${lookIds})&entity_type=eq.look&select=entity_id`,
          { headers: { ...H, "Range-Unit": "items", "Range": "0-49999" } }
        ).then(r => r.json());
        (tagRows || []).forEach((t: any) => { tagCountMap[t.entity_id] = (tagCountMap[t.entity_id] || 0) + 1; });
      }

      setLooks(data.map((l: any) => {
        const rows = (l.look_brand_credits || []).slice().sort((a: any, b: any) => (a.credit_order ?? 0) - (b.credit_order ?? 0));
        const names = rows.map((r: any) => r.brands?.name).filter(Boolean);
        return {
          ...l,
          brands_display: l.is_collaboration && names.length >= 2 ? names.join(" × ") : names.join(", "),
          brand_count: rows.length,
          credit_count: l.look_credits?.length || 0,
          tag_count: tagCountMap[l.id] || 0,
        };
      }));
    } catch(e: any) { console.error(e); setLoadError(e?.message || "Failed to load looks."); }
    setLoading(false);
  };

  // Load brand rows from look_brand_credits, contributor rows from look_credits.
  const loadDetail = async (lookId: string) => {
    const [bRows, credits] = await Promise.all([
      sb(`look_brand_credits?look_id=eq.${lookId}&select=id,brand_id,credit_order,is_courtesy,brands(id,name)&order=credit_order`),
      sb(`look_credits?look_id=eq.${lookId}&select=id,role,person_id,credit_order,people(id,name,primary_role)&order=credit_order`),
    ]);
    setBrandRows((bRows || [])
      .filter((r: any) => r.brands)
      .map((r: any, i: number) => ({ key: `b-${r.id}-${i}`, brand: r.brands, isCourtesy: !!r.is_courtesy })));

    const roleByName = (name: string) => creditRoles.find(r => r.name === name) || { id: `adhoc-${name}`, name, slug: slugify(name), sort_order: 999 };
    setContributors((credits || [])
      .filter((c: any) => c.people)
      .map((c: any, i: number) => ({ key: `c-${c.id}-${i}`, role: roleByName(c.role), person: c.people })));
  };

  const selectLook = (look: Look) => {
    setSelected(look);
    setEditScene(look.scene || "");
    setEditGender(look.gender || "");
    setEditSeasonTerm(look.season_term || "");
    setEditSeasonYear(look.season_year?.toString() || "");
    setEditPublishDate(look.date_published || "");
    setEditSourceUrl(look.source_url || "");
    setEditSourceName(look.source_name || "");
    setEditSourcePlatform(look.source_platform_id ? platforms.find(p => p.id === look.source_platform_id) || null : null);
    setEditCloudinaryUrl(look.cloudinary_url || "");
    setEditPublication(look.publication_id ? platforms.find(p => p.id === look.publication_id) || null : null);
    setEditPublicationIssueMonth(look.publication_issue_month?.toString() || "");
    setEditPublicationIssueYear(look.publication_issue_year?.toString() || "");
    setEditCollectionTitle(look.collection_title || "");
    setEditCollectionDesc(look.collection_description || "");
    setEditNotes(look.notes || "");
    setEditKeyLook(look.is_key_look);
    setEditIsCollab(!!look.is_collaboration);
    setEditEvent(look.event_id ? events.find(e => e.id === look.event_id) || { id: look.event_id, name: look.event_id } : null);
    setEditPhotoCity(look.photo_city_id ? locations.find(l => l.id === look.photo_city_id) || null : null);
    setEditPhotoCountry(look.photo_country_id ? locations.find(l => l.id === look.photo_country_id) || null : null);
    loadDetail(look.id);
  };

  // ── Row helpers ──
  function addBrandRow() { setBrandRows(prev => [...prev, { key: `b-new-${Date.now()}-${prev.length}`, brand: null, isCourtesy: false }]); }
  function updateBrandRow(key: string, brand: any) { setBrandRows(prev => prev.map(b => b.key === key ? { ...b, brand } : b)); }
  function toggleBrandCourtesy(key: string) { setBrandRows(prev => prev.map(b => b.key === key ? { ...b, isCourtesy: !b.isCourtesy } : b)); }
  function removeBrandRow(key: string) { setBrandRows(prev => prev.filter(b => b.key !== key)); }

  function addContributor() {
    // Start blank — name first, role auto-fills when person is selected
    setContributors(prev => [...prev, { key: `c-new-${Date.now()}-${prev.length}`, role: null, person: null }]);
  }

  const [clipboardFlash, setClipboardFlash] = useState(false);

  function copyContributors() {
    // Snapshot valid rows (person + role both set) into the module-level clipboard.
    // Does NOT exclude creative director here — exclusion happens on paste,
    // so the copy is a faithful snapshot and paste semantics are explicit.
    contributorClipboard = contributors
      .filter(c => c.person?.id && c.role)
      .map(c => ({ person: c.person, role: c.role }));
    setClipboardFlash(true);
    setTimeout(() => setClipboardFlash(false), 1800);
  }

  function pasteContributors() {
    if (contributorClipboard.length === 0) return;
    setContributors(prev => {
      const existing = new Set(prev.map(c => `${c.person?.id}::${c.role?.name}`));
      const toAdd = contributorClipboard
        // Skip creative director — it belongs to the brand, not the shared shoot crew
        .filter(c => c.role?.name !== "creative director")
        // Deduplicate against already-present person+role pairs
        .filter(c => !existing.has(`${c.person?.id}::${c.role?.name}`))
        .map(c => ({ key: `c-paste-${c.person.id}-${Date.now()}-${Math.random()}`, person: c.person, role: c.role }));
      return [...prev, ...toAdd];
    });
  }
  function updateContributorRole(key: string, role: any) { setContributors(prev => prev.map(c => c.key === key ? { ...c, role } : c)); }
  function updateContributorPerson(key: string, person: any) {
    setContributors(prev => prev.map(c => {
      if (c.key !== key) return c;
      // primary_role may be stored as either the role name ("assistant stylist") for new
      // people, or as a legacy underscored slug ("creative_director") for older records.
      // Match by name first, then fall back to slug for legacy.
      let role = c.role;
      if (!role && person?.primary_role) {
        const pr = person.primary_role;
        const match = creditRoles.find((r: any) =>
          r.name === pr || r.slug === pr.replace(/_/g, "-")
        );
        if (match) role = match;
      }
      return { ...c, person, role };
    }));
  }
  function removeContributor(key: string) { setContributors(prev => prev.filter(c => c.key !== key)); }

  async function post(path: string, data: any) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json())[0];
  }

  async function createRole(name: string, rowKey: string) {
    const slug = slugify(name);
    let created;
    try { created = await post("credit_roles", { name: name.trim().toLowerCase(), slug, sort_order: 999 }); }
    catch { created = { id: `local-${Date.now()}`, name: name.trim().toLowerCase(), slug, sort_order: 999 }; }
    setCreditRoles(prev => [...prev, created].sort((a: any, b: any) => a.sort_order - b.sort_order));
    updateContributorRole(rowKey, created);
  }

  // Role creation for CreatePersonModal — returns the created role so the modal can set it
  async function createRoleForModal(name: string) {
    const slug = slugify(name);
    let created;
    try { created = await post("credit_roles", { name: name.trim().toLowerCase(), slug, sort_order: 999 }); }
    catch { created = { id: `local-${Date.now()}`, name: name.trim().toLowerCase(), slug, sort_order: 999 }; }
    setCreditRoles(prev => [...prev, created].sort((a: any, b: any) => a.sort_order - b.sort_order));
    return created;
  }

  // Save: delete-and-reinsert both credit tables; dual-write the legacy columns on looks
  // so the safety net stays in sync until step 4 drops them.
  const saveEdits = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const validBrandRows = brandRows.filter(b => b.brand?.id);

      await sb(`looks?id=eq.${selected.id}`, {
        method: "PATCH", prefer: "",
        body: JSON.stringify({
          // Brands attach exclusively through look_brand_credits (Option A reset, step 4b).
          // is_collaboration stays — factual property of authorship, can't be derived.
          is_collaboration: editIsCollab,
          // The rest of the look's properties
          scene: editScene || null,
          gender: editGender || null,
          season_term: editSeasonTerm || null,
          season_year: editSeasonYear ? parseInt(editSeasonYear) : null,
          date_published: editPublishDate || null,
          source_url: editSourceUrl || null,
          source_name: editSourceName || null,
          source_platform_id: editSourcePlatform?.id || null,
          cloudinary_url: editCloudinaryUrl || null,
          publication_id: editPublication?.id || null,
          publication_issue_month: editPublicationIssueMonth ? parseInt(editPublicationIssueMonth) : null,
          publication_issue_year: editPublicationIssueYear ? parseInt(editPublicationIssueYear) : null,
          event_id: editEvent?.id || null,
          photo_city_id: editPhotoCity?.id || null,
          photo_country_id: editPhotoCountry?.id || null,
          collection_title: editCollectionTitle || null,
          collection_description: editCollectionDesc || null,
          notes: editNotes || null,
          is_key_look: editKeyLook,
        }),
      });

      // Brand credits: delete-and-reinsert
      await sb(`look_brand_credits?look_id=eq.${selected.id}`, { method: "DELETE", prefer: "" });
      const newBrandCredits = validBrandRows.map((b, i) => ({
        look_id: selected.id, brand_id: b.brand.id, role: null, credit_order: i, is_courtesy: b.isCourtesy,
      }));
      if (newBrandCredits.length > 0) {
        await sb("look_brand_credits", { method: "POST", body: JSON.stringify(newBrandCredits) });
      }

      // Person credits: delete-and-reinsert
      await sb(`look_credits?look_id=eq.${selected.id}`, { method: "DELETE", prefer: "" });
      const newCredits = contributors
        .filter(c => c.person?.id && c.role)
        .map((c, i) => ({ look_id: selected.id, person_id: c.person.id, role: c.role.name, credit_order: i }));
      if (newCredits.length > 0) {
        await sb("look_credits", { method: "POST", body: JSON.stringify(newCredits) });
      }

      await loadLooks();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const setStatus = async (lookId: string, status: string, takedownReason?: string) => {
    setSaving(true);
    try {
      const body: any = { status };
      if (takedownReason) { body.takedown_reason = takedownReason; body.takedown_at = new Date().toISOString(); }
      await sb(`looks?id=eq.${lookId}`, { method: "PATCH", prefer: "", body: JSON.stringify(body) });
      await loadLooks();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const publishAll = async () => {
    if (!counts.draft) return;
    if (!confirm(`Publish all ${counts.draft} draft looks?`)) return;
    setSaving(true);
    try {
      await sb("looks?status=eq.draft", { method: "PATCH", prefer: "", body: JSON.stringify({ status: "published" }) });
      await loadLooks();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const missingFields = (look: Look) => {
    const m = [];
    if (look.brand_count === 0) m.push("brands");
    if (!look.scene) m.push("scene");
    if (!look.gender) m.push("gender");
    if (!look.season_year) m.push("season");
    if (look.credit_count === 0) m.push("credits");
    if (look.tag_count === 0) m.push("tags");
    return m;
  };

  const cities = locations.filter(l => l.location_type === "city");
  const countries = locations.filter(l => l.location_type === "country");
  const inp = { background: C.lift3, border: "none" as const, color: C.text, padding: "8px 12px", fontSize: 13, borderRadius: 10, outline: "none", width: "100%", boxSizing: "border-box" as const, fontFamily: "Inter,sans-serif" };
  const sel = { ...inp, cursor: "pointer" as const };

  const filteredLooks = search.trim()
    ? looks.filter(l => l.brands_display.toLowerCase().includes(search.toLowerCase()) || (l.source_name || "").toLowerCase().includes(search.toLowerCase()))
    : looks;

  return (
    <>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 3px; }
        .look-row:hover { background: #2a2a2a !important; }
        .look-row.active { background: #2f2f2f !important; border-left: 2px solid #ececec !important; }
        input::placeholder, textarea::placeholder { color: #666; }
      `}</style>

      <div style={{ fontFamily: "Inter,sans-serif", background: C.bg, color: C.text, height: "calc(100vh - 44px)", display: "flex", flexDirection: "column", overflow: "hidden", fontSize: 14 }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderBottom: `1px solid ${C.lift1}`, flexShrink: 0, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {(["draft","published","archived","all"] as const).map(st => (
              <button key={st} onClick={() => setStatusFilter(st)}
                style={{ background: statusFilter===st ? C.lift2 : "transparent", border: "none", color: statusFilter===st ? C.text : C.muted, padding: "6px 14px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontFamily: "Inter,sans-serif", fontWeight: statusFilter===st ? 600 : 400 }}>
                {st.charAt(0).toUpperCase()+st.slice(1)}
                {st !== "all" && counts[st] !== undefined && (
                  <span style={{ marginLeft: 6, fontSize: 11, color: st==="draft" ? C.amber : C.muted }}>{counts[st]}</span>
                )}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by brand or account..."
            style={{ background: C.lift2, border: "none", color: C.text, padding: "7px 14px", fontSize: 13, borderRadius: 20, outline: "none", width: 240, fontFamily: "Inter,sans-serif" }} />
          <div style={{ flex: 1 }} />
          {statusFilter === "draft" && !!counts.draft && (
            <button onClick={publishAll} disabled={saving}
              style={{ background: C.green, border: "none", color: "#fff", padding: "7px 18px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontWeight: 600, fontFamily: "Inter,sans-serif", opacity: saving ? 0.5 : 1 }}>
              Publish all drafts ({counts.draft})
            </button>
          )}
          <span style={{ fontSize: 12, color: C.muted }}>{filteredLooks.length} looks</span>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* List */}
          <div style={{ width: selected ? "44%" : "100%", flexShrink: 0, overflowY: "auto", borderRight: selected ? `1px solid ${C.lift1}` : "none", transition: "width 0.2s" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: C.muted }}>Loading…</div>
            ) : loadError ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 10, color: C.red, padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>⚠</div>
                <div style={{ fontWeight: 600 }}>Couldn't load looks</div>
                <div style={{ fontSize: 12, color: C.muted, maxWidth: 380, fontFamily: "monospace", wordBreak: "break-word" }}>{loadError}</div>
                <button onClick={loadLooks} style={{ marginTop: 4, background: C.lift2, border: "none", color: C.text, padding: "7px 16px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontFamily: "Inter,sans-serif" }}>Retry</button>
              </div>
            ) : filteredLooks.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 8, color: C.muted }}>
                <div style={{ fontSize: 32 }}>✓</div>
                <div>No {statusFilter === "all" ? "" : statusFilter} looks{search ? ` matching "${search}"` : ""}</div>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.lift1}` }}>
                    {["Image","Brands","Scene","Season","Credits","Tags","Missing","Status",""].map(h => (
                      <th key={h} style={{ padding: "8px 10px", fontSize: 11, fontWeight: 600, color: C.muted, textAlign: "left", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLooks.map(look => {
                    const missing = missingFields(look);
                    const isActive = selected?.id === look.id;
                    return (
                      <tr key={look.id} className={`look-row${isActive?" active":""}`}
                        onClick={() => selectLook(look)}
                        style={{ borderBottom: `1px solid ${C.lift1}`, cursor: "pointer", background: isActive ? C.lift1 : "transparent", borderLeft: isActive ? `2px solid ${C.white}` : "2px solid transparent" }}>
                        <td style={{ padding: "6px 10px", width: 52 }}>
                          {look.cloudinary_url
                            ? <img src={look.cloudinary_url} alt="" style={{ width: 40, height: 48, objectFit: "cover", borderRadius: 4, display: "block" }} />
                            : <div style={{ width: 40, height: 48, background: C.lift2, borderRadius: 4 }} />}
                        </td>
                        <td style={{ padding: "6px 10px", maxWidth: 160 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: look.brands_display ? C.text : C.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{look.brands_display || "—"}</div>
                          {look.source_name && !look.brands_display && <div style={{ fontSize: 11, color: C.muted }}>{look.source_name}</div>}
                        </td>
                        <td style={{ padding: "6px 10px" }}><span style={{ fontSize: 12, color: look.scene ? C.text : C.dim }}>{look.scene || "—"}</span></td>
                        <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}><span style={{ fontSize: 12, color: look.season_display ? C.text : C.dim }}>{look.season_display || (look.season_year?.toString()) || "—"}</span></td>
                        <td style={{ padding: "6px 10px" }}><span style={{ fontSize: 12, color: look.credit_count > 0 ? C.green : C.dim }}>{look.credit_count}</span></td>
                        <td style={{ padding: "6px 10px" }}><span style={{ fontSize: 12, color: look.tag_count > 0 ? C.text : C.dim }}>{look.tag_count}</span></td>
                        <td style={{ padding: "6px 10px", maxWidth: 140 }}>
                          {missing.length > 0
                            ? <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>{missing.map(m => <span key={m} style={{ fontSize: 10, background: "#3a2a1a", color: C.amber, padding: "1px 6px", borderRadius: 10, fontWeight: 500 }}>{m}</span>)}</div>
                            : <span style={{ fontSize: 12, color: C.green }}>✓</span>}
                        </td>
                        <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: 11, color: look.status==="draft" ? C.amber : look.status==="published" ? C.green : C.dim, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{look.status}</span>
                          {look.is_key_look && <span style={{ marginLeft: 5, fontSize: 10, color: C.white, background: C.lift2, padding: "1px 5px", borderRadius: 10 }}>key</span>}
                        </td>
                        <td style={{ padding: "6px 10px" }} onClick={e => e.stopPropagation()}>
                          {look.status==="draft" && <button onClick={() => setStatus(look.id,"published")} style={{ background: C.green, border: "none", color: "#fff", padding: "4px 10px", fontSize: 11, cursor: "pointer", borderRadius: 12, fontWeight: 600, fontFamily: "Inter,sans-serif" }}>Publish</button>}
                          {look.status==="published" && <button onClick={() => setStatus(look.id,"archived","manual")} style={{ background: "transparent", border: `1px solid ${C.lift2}`, color: C.muted, padding: "4px 10px", fontSize: 11, cursor: "pointer", borderRadius: 12, fontFamily: "Inter,sans-serif" }}>Archive</button>}
                          {look.status==="archived" && <button onClick={() => setStatus(look.id,"published")} style={{ background: "transparent", border: `1px solid ${C.lift2}`, color: C.muted, padding: "4px 10px", fontSize: 11, cursor: "pointer", borderRadius: 12, fontFamily: "Inter,sans-serif" }}>Restore</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

              <div style={{ position: "relative", background: "#181818", flexShrink: 0 }}>
                <img src={selected.cloudinary_url} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "contain", display: "block" }} />
                <button onClick={() => setSelected(null)}
                  style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", border: "none", color: C.text, width: 30, height: 30, borderRadius: 15, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif" }}>×</button>
                {selected.source_url && (
                  <a href={selected.source_url} target="_blank" rel="noreferrer"
                    style={{ position: "absolute", top: 10, left: 10, fontSize: 12, color: C.text, textDecoration: "none", background: "rgba(0,0,0,0.7)", padding: "5px 10px", borderRadius: 12, fontWeight: 500, fontFamily: "Inter,sans-serif" }}>↗ source</a>
                )}
              </div>

              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>

                <div style={{ fontSize: 12, color: C.muted }}>
                  Ingested {new Date(selected.created_at).toLocaleDateString()} · {selected.credit_count} credits · {selected.tag_count} tags
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

                  <SectionHead title="Attribution" />

                  {/* Brands — flat list with is_courtesy per row */}
                  <F label="Brands" span2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {brandRows.map(b => (
                        <div key={b.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Typeahead items={brands} value={b.brand} onChange={(br: any) => updateBrandRow(b.key, br)} onClear={() => updateBrandRow(b.key, null)} placeholder="Search or create brand..." onCreateClick={(name: string) => setBrandModal({ name, target: `brandrow:${b.key}` })} />
                          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: b.brand ? C.text : C.dim, cursor: b.brand ? "pointer" : "default", whiteSpace: "nowrap", userSelect: "none" }}>
                            <input type="checkbox" checked={b.isCourtesy} disabled={!b.brand} onChange={() => toggleBrandCourtesy(b.key)} style={{ accentColor: C.white, cursor: "pointer" }} />
                            Courtesy
                          </label>
                          <button tabIndex={-1} onClick={() => removeBrandRow(b.key)} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", padding: "0 4px", lineHeight: 1, flexShrink: 0 }}>×</button>
                        </div>
                      ))}
                      <button onClick={addBrandRow} style={{ alignSelf: "flex-start", background: "transparent", border: `1.5px dashed ${C.lift3}`, color: C.muted, padding: "7px 14px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontFamily: "Inter,sans-serif" }}>+ Add brand</button>
                    </div>
                  </F>

                  <F label="" span2>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.text, userSelect: "none" }}>
                      <input type="checkbox" checked={editIsCollab} onChange={e => setEditIsCollab(e.target.checked)} style={{ accentColor: C.white, cursor: "pointer" }} />
                      This is a collaboration
                      <span style={{ fontSize: 11, color: C.dim, fontStyle: "italic", marginLeft: 4 }}>— official co-creation between the brands above</span>
                    </label>
                  </F>

                  {/* Contributors */}
                  <F label="Contributors" span2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {/* Copy / Paste toolbar */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 2 }}>
                        <button onClick={copyContributors} disabled={contributors.filter(c => c.person?.id && c.role).length === 0}
                          style={{ background: clipboardFlash ? C.green : C.lift2, border: "none", color: clipboardFlash ? "#fff" : C.muted, padding: "5px 12px", fontSize: 12, cursor: "pointer", borderRadius: 16, fontFamily: "Inter,sans-serif", transition: "all 0.2s", opacity: contributors.filter(c => c.person?.id && c.role).length === 0 ? 0.35 : 1 }}>
                          {clipboardFlash ? "Copied ✓" : "Copy contributors"}
                        </button>
                        {contributorClipboard.length > 0 && (
                          <button onClick={pasteContributors}
                            style={{ background: C.lift2, border: `1px solid ${C.lift3}`, color: C.text, padding: "5px 12px", fontSize: 12, cursor: "pointer", borderRadius: 16, fontFamily: "Inter,sans-serif" }}>
                            Paste ({contributorClipboard.filter(c => c.role?.name !== "creative director").length})
                          </button>
                        )}
                      </div>
                      {contributors.map(c => (
                        <div key={c.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Typeahead items={people} value={c.person} onChange={(p: any) => updateContributorPerson(c.key, p)} onClear={() => updateContributorPerson(c.key, null)} placeholder="Search or create person..." onCreateClick={(name: string) => setPersonModal({ name, role: (c.role?.slug || "creative-director").replace(/-/g, "_"), target: `contributor:${c.key}` })} />
                          <Typeahead width={160} items={creditRoles} value={c.role} onChange={(r: any) => updateContributorRole(c.key, r)} onClear={() => updateContributorRole(c.key, null)} placeholder="Role..." onCreateClick={(name: string) => createRole(name, c.key)} />
                          <button tabIndex={-1} onClick={() => removeContributor(c.key)} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", padding: "0 4px", lineHeight: 1, flexShrink: 0 }}>×</button>
                        </div>
                      ))}
                      <button onClick={addContributor} style={{ alignSelf: "flex-start", background: "transparent", border: `1.5px dashed ${C.lift3}`, color: C.muted, padding: "7px 14px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontFamily: "Inter,sans-serif" }}>+ Add contributor</button>
                    </div>
                  </F>

                  <SectionHead title="Context" />

                  <F label="Scene">
                    <select value={editScene} onChange={e => setEditScene(e.target.value)} style={sel}>
                      <option value="">— select —</option>
                      <option value="runway">Runway</option>
                      <option value="street">Street</option>
                      <option value="editorial">Editorial</option>
                      <option value="designer_showcase">Designer Showcase</option>
                      <option value="lookbook">Lookbook</option>
                      <option value="presentation">Presentation</option>
                      <option value="other">Other</option>
                    </select>
                  </F>

                  <F label="Gender">
                    <select value={editGender} onChange={e => setEditGender(e.target.value)} style={sel}>
                      <option value="">— select —</option>
                      <option value="womenswear">Womenswear</option>
                      <option value="menswear">Menswear</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </F>

                  <F label="Season">
                    <div style={{ display: "flex", gap: 6 }}>
                      <select value={editSeasonTerm} onChange={e => setEditSeasonTerm(e.target.value)} style={{ ...sel, flex: 1 }}>
                        <option value="">— term —</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                        <option value="Fall">Fall</option>
                        <option value="Winter">Winter</option>
                        <option value="Resort">Resort</option>
                        <option value="Pre-Fall">Pre-Fall</option>
                        <option value="No Season">No Season</option>
                      </select>
                      <input value={editSeasonYear} onChange={e => setEditSeasonYear(e.target.value)} placeholder="2025" maxLength={4} style={{ ...inp, width: 68, flexShrink: 0 }} />
                    </div>
                  </F>

                  <F label="Publish Date">
                    <input type="date" value={editPublishDate} onChange={e => setEditPublishDate(e.target.value)} style={inp} />
                  </F>

                  <F label="Event" span2>
                    <Typeahead items={events} value={editEvent} onChange={setEditEvent} onClear={() => setEditEvent(null)} placeholder="Search event..." />
                  </F>

                  <F label="Key Look" span2>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.text, userSelect: "none", paddingTop: 2 }}>
                      <input type="checkbox" checked={editKeyLook} onChange={e => setEditKeyLook(e.target.checked)} style={{ accentColor: C.white, cursor: "pointer", width: 15, height: 15 }} />
                      Mark as key look
                    </label>
                  </F>

                  <SectionHead title="Photo Location" />

                  <F label="City">
                    <Typeahead items={cities} value={editPhotoCity} onChange={setEditPhotoCity} onClear={() => setEditPhotoCity(null)} placeholder="Search city..." />
                  </F>

                  <F label="Country">
                    <Typeahead items={countries} value={editPhotoCountry} onChange={setEditPhotoCountry} onClear={() => setEditPhotoCountry(null)} placeholder="Search country..." />
                  </F>

                  <SectionHead title="Source" />

                  <F label="Source Platform" span2>
                    <Typeahead items={platforms} value={editSourcePlatform} onChange={setEditSourcePlatform} onClear={() => setEditSourcePlatform(null)} placeholder="e.g. Instagram, Brand Website..." />
                  </F>

                  <F label="Post URL" span2>
                    <input value={editSourceUrl} onChange={e => setEditSourceUrl(e.target.value)} placeholder="https://www.instagram.com/p/..." style={inp} />
                  </F>

                  <F label="Source Account" span2>
                    <input value={editSourceName} onChange={e => setEditSourceName(e.target.value)} placeholder="@account_handle" style={inp} />
                  </F>

                  <F label="Image URL (Cloudinary)" span2>
                    <input value={editCloudinaryUrl} onChange={e => setEditCloudinaryUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." style={inp} />
                  </F>

                  <F label="Publication" span2>
                    <Typeahead items={platforms} value={editPublication} onChange={setEditPublication} onClear={() => { setEditPublication(null); setEditPublicationIssueMonth(""); setEditPublicationIssueYear(""); }} placeholder="e.g. Vogue, i-D, Dazed..." onCreateClick={(name: string) => setPublicationModal(name)} />
                  </F>

                  <F label="Issue Month">
                    <select value={editPublicationIssueMonth} onChange={e => setEditPublicationIssueMonth(e.target.value)}
                      style={{ ...sel, opacity: editPublication ? 1 : 0.4 }} disabled={!editPublication}>
                      <option value="">— month —</option>
                      {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => (
                        <option key={i+1} value={String(i+1)}>{m}</option>
                      ))}
                    </select>
                  </F>

                  <F label="Issue Year">
                    <input value={editPublicationIssueYear} onChange={e => setEditPublicationIssueYear(e.target.value)}
                      placeholder="2024" maxLength={4}
                      style={{ ...inp, opacity: editPublication ? 1 : 0.4 }} disabled={!editPublication} />
                  </F>

                  <SectionHead title="Collection" />

                  <F label="Collection Title" span2>
                    <input value={editCollectionTitle} onChange={e => setEditCollectionTitle(e.target.value)} placeholder="e.g. Folklorics, Dual Mandate" style={inp} />
                  </F>

                  <F label="Collection Description" span2>
                    <textarea value={editCollectionDesc} onChange={e => setEditCollectionDesc(e.target.value)} rows={3} placeholder="Editorial narrative about this collection..." style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} />
                  </F>

                  <SectionHead title="Notes" />

                  <F label="" span2>
                    <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} placeholder="Internal scratchpad..." style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} />
                  </F>
                </div>

                {missingFields(selected).length > 0 && (
                  <div style={{ background: "#2a1f0a", border: "1px solid #5a3a0a", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: C.amber, fontWeight: 600, marginBottom: 3 }}>Missing fields</div>
                    <div style={{ fontSize: 12, color: "#c8a060" }}>{missingFields(selected).join(", ")}</div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, paddingBottom: 20 }}>
                  <button onClick={saveEdits} disabled={saving}
                    style={{ background: C.white, border: "none", color: "#212121", padding: "9px 20px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontWeight: 600, fontFamily: "Inter,sans-serif", opacity: saving ? 0.5 : 1 }}>
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  {selected.status==="draft" && (
                    <button onClick={() => setStatus(selected.id,"published")} disabled={saving}
                      style={{ background: C.green, border: "none", color: "#fff", padding: "9px 20px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontWeight: 600, fontFamily: "Inter,sans-serif", opacity: saving ? 0.5 : 1 }}>Publish</button>
                  )}
                  {selected.status==="published" && (
                    <button onClick={() => setStatus(selected.id,"archived","manual")} disabled={saving}
                      style={{ background: "transparent", border: `1px solid ${C.lift2}`, color: C.muted, padding: "9px 20px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontFamily: "Inter,sans-serif", opacity: saving ? 0.5 : 1 }}>Archive</button>
                  )}
                  {selected.status==="archived" && (
                    <button onClick={() => setStatus(selected.id,"published")} disabled={saving}
                      style={{ background: C.lift2, border: "none", color: C.text, padding: "9px 20px", fontSize: 13, cursor: "pointer", borderRadius: 20, fontFamily: "Inter,sans-serif", opacity: saving ? 0.5 : 1 }}>Restore</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {personModal && (
        <CreatePersonModal
          initialName={personModal.name}
          role={personModal.role}
          roles={creditRoles}
          onCreateRole={createRoleForModal}
          onClose={() => setPersonModal(null)}
          onSave={(created: any) => {
            setPeople(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
            if (personModal.target.startsWith("contributor:")) updateContributorPerson(personModal.target.split(":")[1], created);
            setPersonModal(null);
          }}
        />
      )}

      {brandModal && (
        <CreateBrandModal
          initialName={brandModal.name}
          onClose={() => setBrandModal(null)}
          onSave={(created: any) => {
            setBrands(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
            if (brandModal.target.startsWith("brandrow:")) updateBrandRow(brandModal.target.split(":")[1], created);
            setBrandModal(null);
          }}
        />
      )}

      {publicationModal && (
        <CreatePlatformModal
          initialName={publicationModal}
          onClose={() => setPublicationModal(null)}
          onSave={(created: any) => {
            setPlatforms(prev => [...prev, created].sort((a: any, b: any) => a.name.localeCompare(b.name)));
            setEditPublication(created);
            setPublicationModal(null);
          }}
        />
      )}
    </>
  );
}
