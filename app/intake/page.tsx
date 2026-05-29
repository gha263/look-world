"use client";

import { useState, useRef, useEffect } from "react";
import { SUPABASE_URL, H } from "@/lib/supabase";
import { C, FONT_IMPORT } from "@/lib/theme";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "457b78e4-4758-455b-a72b-7ee79c41b46a", name: "Instagram", slug: "instagram" },
  { id: "f003e6ff-7e20-459e-85c8-95d2bdc666c7", name: "Brand Website", slug: "brand-website" },
];

const BRANDS_SEED: any[] = [];
const PEOPLE_SEED: any[] = [];
const LOCATIONS_SEED: any[] = [];
const EVENTS_SEED: any[] = [];

const CREDIT_ROLES_SEED = [
  { id: "r1", slug: "creative-director", name: "creative director", sort_order: 10 },
  { id: "r2", slug: "photographer", name: "photographer", sort_order: 20 },
  { id: "r3", slug: "stylist", name: "stylist", sort_order: 30 },
  { id: "r4", slug: "fashion-editor", name: "fashion editor", sort_order: 40 },
  { id: "r5", slug: "art-director", name: "art director", sort_order: 50 },
  { id: "r6", slug: "set-designer", name: "set designer", sort_order: 60 },
  { id: "r7", slug: "hair", name: "hair", sort_order: 70 },
  { id: "r8", slug: "makeup", name: "makeup", sort_order: 80 },
  { id: "r9", slug: "casting-director", name: "casting director", sort_order: 90 },
  { id: "r10", slug: "model", name: "model", sort_order: 100 },
];

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Labelled Typeahead (top-level fields) ────────────────────────────────────────

function Typeahead({ label, items, value, onChange, onClear, placeholder, onCreateClick }: any) {
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

  if (value) {
    return (
      <div style={s.field}>
        {label && <label style={s.label}>{label}</label>}
        <div style={s.chip}>
          <span style={{ fontWeight: 500, fontSize: 14, color: C.text }}>{value.name}</span>
          <button onClick={onClear} tabIndex={-1} style={s.chipX}>×</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.field} ref={ref}>
      {label && <label style={s.label}>{label}</label>}
      <input
        style={s.input}
        value={query}
        placeholder={placeholder || (label ? `Search ${label.toLowerCase()}...` : "Search...")}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === "Tab" || e.key === "Escape") setOpen(false); }}
      />
      {open && (filtered.length > 0 || (query.length > 1 && onCreateClick)) && (
        <div style={s.dd}>
          {filtered.map((item: any) => (
            <div key={item.id} style={s.ddRow}
              onMouseDown={() => { onChange(item); setQuery(""); setOpen(false); }}>
              <span>{item.name}</span>
              {(item.primary_role || item.location_type || item.event_type) && (
                <span style={s.pill}>{item.primary_role || item.location_type || item.event_type}</span>
              )}
            </div>
          ))}
          {query.length > 1 && onCreateClick && !filtered.find((i: any) => i.name.toLowerCase() === query.toLowerCase()) && (
            <div style={s.ddCreate} onMouseDown={() => { onCreateClick(query); setQuery(""); setOpen(false); }}>
              + Create "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Inline Typeahead (used inside list rows; bare, optional fixed width) ────────

function InlineTypeahead({ items, value, onChange, onClear, placeholder, onCreateClick, width }: any) {
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

  if (value) {
    return (
      <div style={{ ...s.chip, ...(width ? { width, flexShrink: 0 } : { flex: 1 }), justifyContent: "space-between" }}>
        <span style={{ fontWeight: 500, fontSize: 14, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value.name}</span>
        <button onClick={onClear} tabIndex={-1} style={s.chipX}>×</button>
      </div>
    );
  }

  return (
    <div style={wrapStyle} ref={ref}>
      <input
        style={s.input}
        value={query}
        placeholder={placeholder || "Search..."}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === "Tab" || e.key === "Escape") setOpen(false); }}
      />
      {open && (filtered.length > 0 || (query.length > 1 && onCreateClick)) && (
        <div style={s.dd}>
          {filtered.map((item: any) => (
            <div key={item.id} style={s.ddRow}
              onMouseDown={() => { onChange(item); setQuery(""); setOpen(false); }}>
              <span>{item.name}</span>
              {(item.primary_role || item.location_type) && (
                <span style={s.pill}>{item.primary_role || item.location_type}</span>
              )}
            </div>
          ))}
          {query.length > 1 && onCreateClick && !filtered.find((i: any) => i.name.toLowerCase() === query.toLowerCase()) && (
            <div style={s.ddCreate} onMouseDown={() => { onCreateClick(query); setQuery(""); setOpen(false); }}>
              + Create "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Source Account Input ─────────────────────────────────────────────────────────

function SourceAccountInput({ value, onChange, suggestions }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = value.length > 0
    ? suggestions.filter((s: string) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <input
        style={s.input}
        value={value}
        placeholder="e.g. angelabritobrand"
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === "Escape") setOpen(false); }}
      />
      {open && filtered.length > 0 && (
        <div style={s.dd}>
          {filtered.map((name: string) => (
            <div key={name} style={s.ddRow}
              onMouseDown={() => { onChange(name); setOpen(false); }}>
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Modal({ title, onClose, onSave, saveDisabled, children }: any) {
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.mHead}>
          <span style={s.mTitle}>{title}</span>
          <button style={s.mX} onClick={onClose}>×</button>
        </div>
        <div style={s.mBody}>{children}</div>
        <div style={s.mFoot}>
          <button style={s.btnGhost} onClick={onClose}>Cancel</button>
          <button style={{ ...s.btnPrimary, ...(saveDisabled ? s.btnOff : {}) }} disabled={saveDisabled} onClick={onSave}>Create</button>
        </div>
      </div>
    </div>
  );
}

function F({ label, children }: any) {
  return <div style={s.field}>{label && <label style={s.label}>{label}</label>}{children}</div>;
}

// ── Create modals ─────────────────────────────────────────────────────────────

function CreateBrandModal({ initialName, locations, onSave, onClose }: any) {
  const [name, setName] = useState(initialName || "");
  const [ig, setIg] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState<any>(null);
  const [city, setCity] = useState<any>(null);
  return (
    <Modal title="New Brand" onClose={onClose} saveDisabled={!name.trim()}
      onSave={() => onSave({ name: name.trim(), instagram_handle: ig || null, website: website || null, country_id: country?.id || null, city_id: city?.id || null, slug: slugify(name) })}>
      <F label="Name *"><input style={s.input} value={name} onChange={e => setName(e.target.value)} autoFocus /></F>
      <F label="Instagram Handle"><input style={s.input} value={ig} onChange={e => setIg(e.target.value)} placeholder="@handle" /></F>
      <F label="Website"><input style={s.input} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." /></F>
      <Typeahead label="Country" items={locations.filter((l: any) => l.location_type === "country")} value={country} onChange={setCountry} onClear={() => setCountry(null)} />
      <Typeahead label="City" items={locations.filter((l: any) => l.location_type === "city")} value={city} onChange={setCity} onClear={() => setCity(null)} />
    </Modal>
  );
}

function CreatePersonModal({ initialName, role, roles, onSave, onClose }: any) {
  const [name, setName] = useState(initialName || "");
  const [ig, setIg] = useState("");
  const [website, setWebsite] = useState("");
  const [r, setR] = useState(role || "creative_director");
  return (
    <Modal title="New Person" onClose={onClose} saveDisabled={!name.trim()}
      onSave={() => onSave({ name: name.trim(), primary_role: r, instagram_url: ig || null, website: website || null, slug: slugify(name) })}>
      <F label="Name *"><input style={s.input} value={name} onChange={e => setName(e.target.value)} autoFocus /></F>
      <F label="Role">
        <select style={s.select} value={r} onChange={e => setR(e.target.value)}>
          {roles.map((role: any) => (
            <option key={role.id} value={role.slug.replace(/-/g, "_")}>{role.name}</option>
          ))}
        </select>
      </F>
      <F label="Instagram URL"><input style={s.input} value={ig} onChange={e => setIg(e.target.value)} placeholder="https://instagram.com/handle" /></F>
      <F label="Website"><input style={s.input} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." /></F>
    </Modal>
  );
}

function CreateEventModal({ initialName, locations, onSave, onClose }: any) {
  const [name, setName] = useState(initialName || "");
  const [type, setType] = useState("fashion_week");
  const [loc, setLoc] = useState<any>(null);
  const [website, setWebsite] = useState("");
  const [ig, setIg] = useState("");
  return (
    <Modal title="New Event" onClose={onClose} saveDisabled={!name.trim()}
      onSave={() => onSave({ name: name.trim(), event_type: type, location_id: loc?.id || null, website: website || null, instagram_handle: ig || null, slug: slugify(name) })}>
      <F label="Name *"><input style={s.input} value={name} onChange={e => setName(e.target.value)} autoFocus /></F>
      <F label="Type">
        <select style={s.select} value={type} onChange={e => setType(e.target.value)}>
          <option value="fashion_week">Fashion Week</option>
          <option value="fashion_fair">Fashion Fair</option>
          <option value="exhibition">Exhibition</option>
          <option value="showcase">Showcase</option>
          <option value="presentation_series">Presentation Series</option>
          <option value="fashion_trade_fair">Fashion Trade Fair</option>
        </select>
      </F>
      <Typeahead label="Location" items={locations} value={loc} onChange={setLoc} onClear={() => setLoc(null)} />
      <F label="Website"><input style={s.input} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." /></F>
      <F label="Instagram Handle"><input style={s.input} value={ig} onChange={e => setIg(e.target.value)} placeholder="@handle" /></F>
    </Modal>
  );
}

function CreateLocationModal({ initialName, type, locations, onSave, onClose }: any) {
  const [name, setName] = useState(initialName || "");
  const [code, setCode] = useState("");
  const [parent, setParent] = useState<any>(null);
  const isCity = type === "city";
  return (
    <Modal title={`New ${isCity ? "City" : "Country"}`} onClose={onClose}
      saveDisabled={!name.trim() || (isCity && !parent)}
      onSave={() => onSave({ name: name.trim(), location_type: type, slug: slugify(name), country_code: isCity ? null : (code || null), parent_location_id: isCity ? parent?.id : null })}>
      <F label="Name *"><input style={s.input} value={name} onChange={e => setName(e.target.value)} autoFocus /></F>
      {isCity
        ? <Typeahead label="Country *" items={locations.filter((l: any) => l.location_type === "country")} value={parent} onChange={setParent} onClear={() => setParent(null)} />
        : <F label="ISO Code"><input style={s.input} value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. NG" maxLength={2} /></F>
      }
    </Modal>
  );
}

function CreatePlatformModal({ initialName, onSave, onClose }: any) {
  const [name, setName] = useState(initialName || "");
  const [url, setUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [ig, setIg] = useState("");
  return (
    <Modal title="New Publication / Platform" onClose={onClose} saveDisabled={!name.trim()}
      onSave={() => onSave({ name: name.trim(), base_url: url || null, website: website || null, instagram_handle: ig || null, slug: slugify(name) })}>
      <F label="Name *"><input style={s.input} value={name} onChange={e => setName(e.target.value)} autoFocus /></F>
      <F label="Website"><input style={s.input} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://vogue.com" /></F>
      <F label="Instagram Handle"><input style={s.input} value={ig} onChange={e => setIg(e.target.value)} placeholder="@vogue" /></F>
      <F label="Base URL"><input style={s.input} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." /></F>
    </Modal>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const INSTAGRAM_ID = "457b78e4-4758-455b-a72b-7ee79c41b46a";
const BRAND_WEBSITE_ID = "f003e6ff-7e20-459e-85c8-95d2bdc666c7";

type Contributor = { key: string; role: any; person: any };
type BrandRow    = { key: string; brand: any; isCourtesy: boolean };

export default function IntakePage() {
  const [platformId, setPlatformId] = useState(INSTAGRAM_ID);
  const [customPlatform, setCustomPlatform] = useState<any>(null);
  const [publication, setPublication] = useState<any>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [cdnUrl, setCdnUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [isKeyLook, setIsKeyLook] = useState(false);

  // Brands in this look — flat list, no anchor concept
  const [brandRows, setBrandRows] = useState<BrandRow[]>([]);
  const [isCollab, setIsCollab] = useState(false);

  // Contributors (people credits)
  const [contributors, setContributors] = useState<Contributor[]>([]);

  const [event, setEvent] = useState<any>(null);
  const [scene, setScene] = useState("");
  const [seasonTerm, setSeasonTerm] = useState("");
  const [seasonYear, setSeasonYear] = useState("");
  const [gender, setGender] = useState("");
  const [publishDate, setPublishDate] = useState("");

  const [photoCity, setPhotoCity] = useState<any>(null);
  const [photoCountry, setPhotoCountry] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const [brands, setBrands] = useState(BRANDS_SEED);
  const [people, setPeople] = useState(PEOPLE_SEED);
  const [events, setEvents] = useState(EVENTS_SEED);
  const [locations, setLocations] = useState(LOCATIONS_SEED);
  const [platforms, setPlatforms] = useState(PLATFORMS);
  const [creditRoles, setCreditRoles] = useState(CREDIT_ROLES_SEED);
  const [sourceNames, setSourceNames] = useState<string[]>([]);

  const [modal, setModal] = useState<any>(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successCount, setSuccessCount] = useState(0);

  // Load entities
  useEffect(() => {
    async function loadEntities() {
      try {
        const [b, p, e, l, pl, cr, sn] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/brands?select=id,name,slug&order=name`, { headers: {...H, "Range-Unit":"items", "Range":"0-9999"} }).then(r => r.json()),
          fetch(`${SUPABASE_URL}/rest/v1/people?select=id,name,primary_role&order=name`, { headers: {...H, "Range-Unit":"items", "Range":"0-9999"} }).then(r => r.json()),
          fetch(`${SUPABASE_URL}/rest/v1/events?select=id,name,event_type&order=name`, { headers: {...H, "Range-Unit":"items", "Range":"0-9999"} }).then(r => r.json()),
          fetch(`${SUPABASE_URL}/rest/v1/locations?select=id,name,location_type,country_code&order=location_type,name`, { headers: {...H, "Range-Unit":"items", "Range":"0-9999"} }).then(r => r.json()),
          fetch(`${SUPABASE_URL}/rest/v1/source_platforms?select=id,name,slug&order=name`, { headers: {...H, "Range-Unit":"items", "Range":"0-9999"} }).then(r => r.json()),
          fetch(`${SUPABASE_URL}/rest/v1/credit_roles?select=id,slug,name,sort_order&order=sort_order`, { headers: {...H, "Range-Unit":"items", "Range":"0-9999"} }).then(r => r.json()),
          fetch(`${SUPABASE_URL}/rest/v1/looks?select=source_name&not=source_name.is.null&order=source_name`, { headers: {...H, "Range-Unit":"items", "Range":"0-9999"} }).then(r => r.json()),
        ]);
        if (Array.isArray(b) && b.length > 0) setBrands(b);
        if (Array.isArray(p) && p.length > 0) setPeople(p);
        if (Array.isArray(e) && e.length > 0) setEvents(e);
        if (Array.isArray(l) && l.length > 0) setLocations(l);
        if (Array.isArray(pl) && pl.length > 0) setPlatforms(pl);
        if (Array.isArray(cr) && cr.length > 0) setCreditRoles(cr);
        if (Array.isArray(sn) && sn.length > 0) {
          const unique = [...new Set(sn.map((r: any) => r.source_name?.trim()).filter(Boolean))].sort();
          setSourceNames(unique);
        }
      } catch (err) {
        console.error("Failed to load entities:", err);
      }
    }
    loadEntities();
  }, []);

  const cities = locations.filter(l => l.location_type === "city");
  const countries = locations.filter(l => l.location_type === "country");
  const otherPlatforms = platforms.filter(p => p.id !== INSTAGRAM_ID && p.id !== BRAND_WEBSITE_ID);
  const cdRole = () => creditRoles.find(r => r.slug === "creative-director") || creditRoles[0];

  async function post(path: string, data: any) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method: "POST",
      headers: { ...H, Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json())[0];
  }

  // When a brand is added, auto-add its known current creative director as a contributor row
  async function autoAddBrandCD(b: any) {
    if (!b?.id || b.id.startsWith("local-")) return;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/brand_directors?brand_id=eq.${b.id}&is_current=eq.true&select=person_id,people(id,name,primary_role)`,
        { headers: H }
      );
      const rows = await res.json();
      const directors = rows?.map((r: any) => r.people).filter(Boolean) || [];
      if (directors.length > 0) {
        const role = cdRole();
        setContributors(prev => {
          const additions = directors
            .filter((d: any) => !prev.find(c => c.person?.id === d.id && c.role?.slug === "creative-director"))
            .map((d: any) => ({ key: `cd-${d.id}-${Date.now()}`, role, person: d }));
          return [...prev, ...additions];
        });
      }
    } catch { /* skip */ }
  }

  // ── Brand row helpers ──
  function addBrandRow() {
    setBrandRows(prev => [...prev, { key: `b-${Date.now()}-${prev.length}`, brand: null, isCourtesy: false }]);
  }
  function updateBrandRow(key: string, brand: any) {
    setBrandRows(prev => prev.map(b => b.key === key ? { ...b, brand } : b));
    if (brand) autoAddBrandCD(brand);
  }
  function toggleBrandCourtesy(key: string) {
    setBrandRows(prev => prev.map(b => b.key === key ? { ...b, isCourtesy: !b.isCourtesy } : b));
  }
  function removeBrandRow(key: string) {
    setBrandRows(prev => prev.filter(b => b.key !== key));
  }

  // ── Contributor row helpers ──
  function addContributor() {
    // Start blank — name first, role auto-fills when person is selected
    setContributors(prev => [...prev, { key: `c-${Date.now()}-${prev.length}`, role: null, person: null }]);
  }
  function updateContributorRole(key: string, role: any) {
    setContributors(prev => prev.map(c => c.key === key ? { ...c, role } : c));
  }
  function updateContributorPerson(key: string, person: any) {
    setContributors(prev => prev.map(c => {
      if (c.key !== key) return c;
      // Auto-fill role from person's primary_role if role slot is currently empty.
      // Maps primary_role underscore format (e.g. "creative_director") to a credit_roles
      // object by matching slug hyphen format (e.g. "creative-director"). Stays editable after.
      let role = c.role;
      if (!role && person?.primary_role) {
        const slug = person.primary_role.replace(/_/g, "-");
        const match = creditRoles.find((r: any) => r.slug === slug);
        if (match) role = match;
      }
      return { ...c, person, role };
    }));
  }
  function removeContributor(key: string) {
    setContributors(prev => prev.filter(c => c.key !== key));
  }

  // Fast role creation
  async function createRole(name: string, rowKey: string) {
    const slug = slugify(name);
    let created;
    try { created = await post("credit_roles", { name: name.trim().toLowerCase(), slug, sort_order: 999 }); }
    catch { created = { id: `local-${Date.now()}`, name: name.trim().toLowerCase(), slug, sort_order: 999 }; }
    setCreditRoles(prev => [...prev, created].sort((a: any, b: any) => a.sort_order - b.sort_order));
    updateContributorRole(rowKey, created);
  }

  // ── Create-entity handlers (routed by modal.target) ──
  async function handleCreateBrand(data: any) {
    let c; try { c = await post("brands", data); } catch { c = { ...data, id: `local-${Date.now()}` }; }
    setBrands(p => [...p, c].sort((a: any, b: any) => a.name.localeCompare(b.name)));
    if (modal?.target?.startsWith("brandrow:")) updateBrandRow(modal.target.split(":")[1], c);
    setModal(null);
  }

  async function handleCreatePerson(data: any) {
    let c; try { c = await post("people", data); } catch { c = { ...data, id: `local-${Date.now()}` }; }
    setPeople(p => [...p, c].sort((a: any, b: any) => a.name.localeCompare(b.name)));
    if (modal?.target?.startsWith("contributor:")) updateContributorPerson(modal.target.split(":")[1], c);
    setModal(null);
  }

  async function handleCreateEvent(data: any) {
    let c; try { c = await post("events", data); } catch { c = { ...data, id: `local-${Date.now()}` }; }
    setEvents(p => [...p, c].sort((a: any, b: any) => a.name.localeCompare(b.name)));
    setEvent(c); setModal(null);
  }
  async function handleCreateLocation(data: any) {
    let c; try { c = await post("locations", data); } catch { c = { ...data, id: `local-${Date.now()}` }; }
    setLocations(p => [...p, c].sort((a: any, b: any) => a.name.localeCompare(b.name)));
    if (data.location_type === "city") setPhotoCity(c); else setPhotoCountry(c);
    setModal(null);
  }
  async function handleCreatePlatform(data: any) {
    let c; try { c = await post("source_platforms", data); } catch { c = { ...data, id: `local-${Date.now()}` }; }
    setPlatforms(p => [...p, c].sort((a: any, b: any) => a.name.localeCompare(b.name)));
    setCustomPlatform(c); setPlatformId(""); setModal(null);
  }
  async function handleCreatePublication(data: any) {
    let c; try { c = await post("source_platforms", data); } catch { c = { ...data, id: `local-${Date.now()}` }; }
    setPlatforms(p => [...p, c].sort((a: any, b: any) => a.name.localeCompare(b.name)));
    setPublication(c); setModal(null);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  // Dual-write window (step 1→4 of Option A reset):
  //   We still write looks.brand_id (the first valid brand row) and looks.courtesy_brand_id
  //   alongside the new look_brand_credits rows. This keeps the safety net intact while public
  //   reads are migrated. When step 4 drops the old columns, only the look_brand_credits
  //   inserts below need to remain.
  async function handleSubmit() {
    if (!cdnUrl.trim()) { setStatus("error"); setErrorMsg("CDN image URL is required."); return; }
    setStatus("submitting"); setErrorMsg("");

    const pid = customPlatform?.id?.startsWith("local-") ? null : (customPlatform?.id || platformId);
    const cleanId = (x: any) => (x?.id && !x.id.startsWith("local-") ? x.id : null);

    // Valid brand rows: real (non-local) brands only, in row order
    const validBrandRows = brandRows.filter(b => cleanId(b.brand));
    const firstBrandId = validBrandRows[0] ? cleanId(validBrandRows[0].brand) : null;
    const firstCourtesyBrandId = validBrandRows.find(b => b.isCourtesy) ? cleanId(validBrandRows.find(b => b.isCourtesy)!.brand) : null;

    const look = {
      source_url: sourceUrl.trim() || null,
      source_cdn_url: cdnUrl.trim(),
      source_name: sourceName.trim() || null,
      source_platform_id: pid,
      publication_id: cleanId(publication),
      // DUAL-WRITE: keep legacy columns in sync with look_brand_credits during the migration window
      brand_id: firstBrandId,
      courtesy_brand_id: firstCourtesyBrandId,
      // is_collaboration is the one anchor-era flag we keep — it's a factual property of authorship
      is_collaboration: isCollab,
      event_id: cleanId(event),
      scene: scene || "other",
      season_term: seasonTerm || null,
      season_year: seasonYear ? parseInt(seasonYear) : null,
      gender: gender || null,
      date_published: publishDate || null,
      photo_city_id: cleanId(photoCity),
      photo_country_id: cleanId(photoCountry),
      is_key_look: isKeyLook,
      status: "draft",
      notes: notes.trim() || null,
    };

    try {
      // Insert look
      const res = await fetch(`${SUPABASE_URL}/rest/v1/looks`, {
        method: "POST",
        headers: { ...H, "Prefer": "return=representation" },
        body: JSON.stringify(look),
      });
      if (!res.ok) throw new Error(await res.text());
      const lookId = (await res.json())[0]?.id;

      // Brands → look_brand_credits (new canonical home; all valid rows go here)
      const brandCredits = validBrandRows.map((b, i) => ({
        look_id: lookId,
        brand_id: cleanId(b.brand)!,
        role: null,
        credit_order: i,
        is_courtesy: b.isCourtesy,
      }));
      if (brandCredits.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/look_brand_credits`, {
          method: "POST",
          headers: { ...H, "Prefer": "return=representation" },
          body: JSON.stringify(brandCredits),
        });
      }

      // Contributors → look_credits (people, with credit_roles.name as role)
      const credits = contributors
        .filter(c => c.person && !c.person.id?.startsWith("local-") && c.role)
        .map((c, i) => ({ look_id: lookId, person_id: c.person.id, role: c.role.name, credit_order: i }));
      if (credits.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/look_credits`, {
          method: "POST",
          headers: { ...H, "Prefer": "return=representation" },
          body: JSON.stringify(credits),
        });
      }

      setStatus("success");
      setSuccessCount(c => c + 1);
      resetForm();
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message || "Submission failed.");
    }
  }

  function resetForm() {
    setSourceUrl(""); setCdnUrl(""); setSourceName(""); setIsKeyLook(false);
    setBrandRows([]); setIsCollab(false);
    setContributors([]);
    setEvent(null); setScene(""); setSeasonTerm(""); setSeasonYear(""); setGender(""); setPublishDate("");
    setPhotoCity(null); setPhotoCountry(null); setNotes("");
    setPlatformId(INSTAGRAM_ID); setCustomPlatform(null); setPublication(null);
    setTimeout(() => setStatus("idle"), 3000);
  }

  const cdnErr = status === "error" && !cdnUrl.trim();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        input, select, textarea, button { font-family: Inter, sans-serif; }
        input::placeholder, textarea::placeholder { color: #888; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: "calc(100vh - 44px)", backgroundColor: C.bg, color: C.text, fontFamily: "Inter,sans-serif", fontSize: 14, lineHeight: 1.6 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 24px 100px" }}>

          {/* SOURCE */}
          <Card title="Source">
            <F label="Platform">
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button tabIndex={-1} style={{ ...s.tog, ...(platformId === INSTAGRAM_ID && !customPlatform ? s.togOn : {}) }}
                  onClick={() => { setPlatformId(INSTAGRAM_ID); setCustomPlatform(null); }}>Instagram</button>
                <button tabIndex={-1} style={{ ...s.tog, ...(platformId === BRAND_WEBSITE_ID && !customPlatform ? s.togOn : {}) }}
                  onClick={() => { setPlatformId(BRAND_WEBSITE_ID); setCustomPlatform(null); }}>Brand Website</button>
                {customPlatform ? (
                  <div style={s.chip}>
                    <span style={{ fontWeight: 500, color: C.text }}>{customPlatform.name}</span>
                    <button style={s.chipX} onClick={() => { setCustomPlatform(null); setPlatformId(INSTAGRAM_ID); }}>×</button>
                  </div>
                ) : (
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <Typeahead items={otherPlatforms} value={null}
                      onChange={(p: any) => { setCustomPlatform(p); setPlatformId(""); }}
                      onClear={() => { }} placeholder="Other platform..."
                      onCreateClick={(name: string) => setModal({ type: "platform", name })} />
                  </div>
                )}
              </div>
            </F>
            <div style={s.row2}>
              <F label="Post URL">
                <input style={s.input} value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://www.instagram.com/p/..." />
              </F>
              <F label="CDN Image URL *">
                <input style={{ ...s.input, ...(cdnErr ? { outline: `1.5px solid ${C.red}` } : {}) }}
                  value={cdnUrl} onChange={e => setCdnUrl(e.target.value)}
                  placeholder="https://scontent-....cdninstagram.com/..." />
              </F>
            </div>
            <div style={s.row2}>
              <F label="Source Account (handle only)">
                <SourceAccountInput value={sourceName} onChange={setSourceName} suggestions={sourceNames} />
              </F>
              <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
                <label style={s.ckLabel}>
                  <input type="checkbox" checked={isKeyLook} onChange={e => setIsKeyLook(e.target.checked)} style={s.ck} />
                  Key Look
                </label>
              </div>
            </div>
            <Typeahead label="Publication" items={platforms.filter((p: any) => p.id !== INSTAGRAM_ID && p.id !== BRAND_WEBSITE_ID)}
              value={publication} onChange={setPublication} onClear={() => setPublication(null)}
              placeholder="e.g. Vogue, i-D, Dazed..."
              onCreateClick={(name: string) => setModal({ type: "publication", name })} />
          </Card>

          {/* ATTRIBUTION */}
          <Card title="Attribution">

            {/* Brands (flat list) */}
            <div style={s.field}>
              <label style={s.label}>Brands</label>
              <span style={{ fontSize: 12, color: C.dim, marginTop: -2 }}>One or more brands in this look. Check "Courtesy" when no photographer is identified.</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                {brandRows.map(b => (
                  <div key={b.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <InlineTypeahead
                      items={brands}
                      value={b.brand}
                      onChange={(br: any) => updateBrandRow(b.key, br)}
                      onClear={() => updateBrandRow(b.key, null)}
                      placeholder="Search or create brand..."
                      onCreateClick={(name: string) => setModal({ type: "brand", name, target: `brandrow:${b.key}` })}
                    />
                    <label style={{ ...s.ckLabel, fontSize: 13, color: b.brand ? C.text : C.dim, cursor: b.brand ? "pointer" : "default", whiteSpace: "nowrap" }}>
                      <input type="checkbox" checked={b.isCourtesy} disabled={!b.brand} onChange={() => toggleBrandCourtesy(b.key)} style={s.ck} />
                      Courtesy
                    </label>
                    <button tabIndex={-1} onClick={() => removeBrandRow(b.key)} style={s.rowX}>×</button>
                  </div>
                ))}
                <button onClick={addBrandRow} style={s.addRow}>+ Add brand</button>
              </div>
            </div>

            {/* Collaboration */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={s.ckLabel}>
                <input type="checkbox" checked={isCollab} style={s.ck}
                  onChange={e => setIsCollab(e.target.checked)} />
                This is a collaboration
              </label>
              <span style={{ fontSize: 12, color: C.dim, fontStyle: "italic" }}>official co-creation between the brands above</span>
            </div>

            {/* Contributors */}
            <div style={s.field}>
              <label style={s.label}>Contributors</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {contributors.map(c => (
                  <div key={c.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <InlineTypeahead
                      items={people}
                      value={c.person}
                      onChange={(p: any) => updateContributorPerson(c.key, p)}
                      onClear={() => updateContributorPerson(c.key, null)}
                      placeholder="Search or create person..."
                      onCreateClick={(name: string) => setModal({ type: "person", name, role: (c.role?.slug || "creative-director").replace(/-/g, "_"), target: `contributor:${c.key}` })}
                    />
                    <InlineTypeahead
                      width={180}
                      items={creditRoles}
                      value={c.role}
                      onChange={(r: any) => updateContributorRole(c.key, r)}
                      onClear={() => updateContributorRole(c.key, null)}
                      placeholder="Role..."
                      onCreateClick={(name: string) => createRole(name, c.key)}
                    />
                    <button tabIndex={-1} onClick={() => removeContributor(c.key)} style={s.rowX}>×</button>
                  </div>
                ))}
                <button onClick={addContributor} style={s.addRow}>+ Add contributor</button>
              </div>
            </div>
          </Card>

          {/* CONTEXT */}
          <Card title="Context">
            <Typeahead label="Event" items={events} value={event}
              onChange={setEvent} onClear={() => setEvent(null)}
              onCreateClick={(name: string) => setModal({ type: "event", name })} />
            <div style={s.row2}>
              <F label="Scene">
                <select style={s.select} value={scene} onChange={e => setScene(e.target.value)}>
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
                <select style={s.select} value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">— select —</option>
                  <option value="womenswear">Womenswear</option>
                  <option value="menswear">Menswear</option>
                  <option value="unisex">Unisex</option>
                </select>
              </F>
            </div>
            <div style={s.row2}>
              <F label="Season">
                <div style={{ display: "flex", gap: 8 }}>
                  <select style={{ ...s.select, flex: 1 }} value={seasonTerm} onChange={e => setSeasonTerm(e.target.value)}>
                    <option value="">— term —</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
                    <option value="Resort">Resort</option>
                    <option value="Pre-Fall">Pre-Fall</option>
                    <option value="No Season">No Season</option>
                  </select>
                  <input style={{ ...s.input, width: 72, flexShrink: 0 }} value={seasonYear}
                    onChange={e => setSeasonYear(e.target.value)} placeholder="2025" maxLength={4} />
                </div>
              </F>
              <F label="Publish Date">
                <input type="date" style={s.input} value={publishDate} onChange={e => setPublishDate(e.target.value)} />
              </F>
            </div>
          </Card>

          {/* LOCATION */}
          <Card title="Photo Location">
            <div style={s.row2}>
              <Typeahead label="City" items={cities} value={photoCity}
                onChange={setPhotoCity} onClear={() => setPhotoCity(null)}
                onCreateClick={(name: string) => setModal({ type: "city", name })} />
              <Typeahead label="Country" items={countries} value={photoCountry}
                onChange={setPhotoCountry} onClear={() => setPhotoCountry(null)}
                onCreateClick={(name: string) => setModal({ type: "country", name })} />
            </div>
          </Card>

          {/* NOTES */}
          <Card title="Notes">
            <textarea style={s.ta} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. confirm season, find photographer credit..." rows={2} />
          </Card>

          {/* Submit */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14, paddingTop: 4 }}>
            {errorMsg && <span style={{ fontSize: 13, color: C.red }}>{errorMsg}</span>}
            {status === "success" && <span style={{ fontSize: 13, color: C.green }}>✓ Ingested — Cloudinary processing</span>}
            {successCount > 0 && <span style={{ fontSize: 13, color: C.muted }}>{successCount} ingested</span>}
            <button
              style={{ height: 44, padding: "0 28px", backgroundColor: C.white, color: "#212121", border: "none", borderRadius: 22, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "Inter,sans-serif", opacity: status === "submitting" ? 0.4 : 1 }}
              onClick={handleSubmit} disabled={status === "submitting"}>
              {status === "submitting" ? "Ingesting..." : "Ingest Look →"}
            </button>
          </div>
        </div>

        {/* Modals */}
        {modal?.type === "brand" && <CreateBrandModal initialName={modal.name} locations={locations} onSave={handleCreateBrand} onClose={() => setModal(null)} />}
        {modal?.type === "person" && <CreatePersonModal initialName={modal.name} role={modal.role} roles={creditRoles} onSave={handleCreatePerson} onClose={() => setModal(null)} />}
        {modal?.type === "event" && <CreateEventModal initialName={modal.name} locations={locations} onSave={handleCreateEvent} onClose={() => setModal(null)} />}
        {modal?.type === "city" && <CreateLocationModal initialName={modal.name} type="city" locations={locations} onSave={handleCreateLocation} onClose={() => setModal(null)} />}
        {modal?.type === "country" && <CreateLocationModal initialName={modal.name} type="country" locations={locations} onSave={handleCreateLocation} onClose={() => setModal(null)} />}
        {modal?.type === "platform" && <CreatePlatformModal initialName={modal.name} onSave={handleCreatePlatform} onClose={() => setModal(null)} />}
        {modal?.type === "publication" && <CreatePlatformModal initialName={modal.name} onSave={handleCreatePublication} onClose={() => setModal(null)} />}
      </div>
    </>
  );
}

function Card({ title, children }: any) {
  return (
    <div style={{ backgroundColor: C.lift1, borderRadius: 16, padding: "18px 20px", marginBottom: 10, display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: C.muted }}>{title}</div>
      {children}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, any> = {
  field: { display: "flex", flexDirection: "column", gap: 5, position: "relative" },
  label: { fontSize: 13, fontWeight: 600, color: C.text },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  input: {
    height: 42, padding: "0 16px",
    border: "1px solid #505050", borderRadius: 12,
    backgroundColor: "#484848", color: C.text,
    fontSize: 14, fontFamily: "Inter,sans-serif",
    outline: "none", width: "100%",
  },
  select: {
    height: 42, padding: "0 16px",
    border: "1px solid #505050", borderRadius: 12,
    backgroundColor: "#484848", color: C.text,
    fontSize: 14, fontFamily: "Inter,sans-serif",
    outline: "none", width: "100%", cursor: "pointer",
  },
  ta: {
    padding: "12px 16px", border: "1px solid #505050", borderRadius: 12,
    backgroundColor: "#484848", color: C.text,
    fontSize: 14, fontFamily: "Inter,sans-serif",
    outline: "none", width: "100%", resize: "vertical", lineHeight: 1.5,
  },

  tog: {
    height: 38, padding: "0 18px", border: "none",
    borderRadius: 20, backgroundColor: C.lift2,
    color: C.muted, fontSize: 14, fontFamily: "Inter,sans-serif",
    cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500,
    transition: "all 0.12s",
  },
  togOn: { backgroundColor: C.white, color: "#212121", fontWeight: 600 },

  chip: {
    display: "inline-flex", alignItems: "center", gap: 8,
    height: 42, padding: "0 16px",
    backgroundColor: "#484848", borderRadius: 12,
    fontSize: 14, border: "1px solid #606060",
  },
  chipX: {
    background: "none", border: "none", color: C.muted,
    fontSize: 20, cursor: "pointer", padding: 0, lineHeight: 1,
  },

  rowX: {
    background: "none", border: "none", color: C.muted,
    fontSize: 22, cursor: "pointer", padding: "0 4px", lineHeight: 1, flexShrink: 0,
  },
  addRow: {
    alignSelf: "flex-start",
    background: "transparent", border: `1.5px dashed ${C.lift3}`,
    color: C.muted, padding: "8px 16px", fontSize: 13,
    cursor: "pointer", borderRadius: 20, fontFamily: "Inter,sans-serif",
  },

  ckLabel: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: C.text, userSelect: "none" },
  ck: { width: 15, height: 15, cursor: "pointer", accentColor: C.white },

  dd: {
    position: "absolute", top: "100%", left: 0, right: 0,
    backgroundColor: C.lift2, borderRadius: 12,
    zIndex: 300, marginTop: 4,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    maxHeight: 240, overflowY: "auto",
  },
  ddRow: {
    padding: "10px 16px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    fontSize: 14, color: C.text,
    borderBottom: `1px solid ${C.lift1}`,
  },
  ddCreate: { padding: "10px 16px", cursor: "pointer", fontSize: 14, color: C.muted, fontWeight: 500 },
  pill: { fontSize: 11, color: C.muted, backgroundColor: C.lift1, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" },

  overlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
    zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
  },
  modal: { backgroundColor: C.lift1, borderRadius: 20, width: "100%", maxWidth: 420, boxShadow: "0 16px 48px rgba(0,0,0,0.6)" },
  mHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.lift2}` },
  mTitle: { fontSize: 15, fontWeight: 600, color: C.text },
  mX: { background: "none", border: "none", color: C.dim, fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1 },
  mBody: { padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 },
  mFoot: { padding: "14px 20px", borderTop: `1px solid ${C.lift2}`, display: "flex", justifyContent: "flex-end", gap: 10 },
  btnPrimary: { height: 40, padding: "0 22px", backgroundColor: C.white, color: "#212121", border: "none", borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnGhost: { height: 40, padding: "0 18px", backgroundColor: C.lift2, color: C.muted, border: "none", borderRadius: 20, fontSize: 14, cursor: "pointer" },
  btnOff: { opacity: 0.4, cursor: "not-allowed" },
};
