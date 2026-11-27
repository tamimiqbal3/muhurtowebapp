"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { saveSettings, useCatalog } from "@/lib/store/catalog";
import { Btn, Card, Field, ImageInput, PageHead, Pill, uid } from "@/components/admin/ui";
import {
  BUILT_IN_SECTIONS, DEFAULT_HOME, blankCustomSection, normalizeHome,
  type BuiltInSection, type HomeContent,
} from "@/lib/home-content";

/* A field description for the generic list editor. */
type FieldDef<T> = { key: keyof T & string; label: string; area?: boolean; image?: boolean; wide?: boolean; hint?: string };

/** Add, edit, delete and reorder the items of one homepage list. */
function ListEditor<T extends { id: string }>({ title, help, items, fields, blank, onChange, summary }: {
  title: string; help: string; items: T[]; fields: FieldDef<T>[]; blank: () => T; onChange: (next: T[]) => void; summary: (x: T) => string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= items.length) return; const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  const set = (i: number, k: string, v: string) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-sans text-base font-semibold">{title} <span className="ml-1 text-sm font-normal text-muted">({items.length})</span></h2>
          <p className="text-xs text-muted">{help}</p>
        </div>
        <Btn variant="outline" onClick={() => { const b = blank(); onChange([...items, b]); setOpen(b.id); }}><Plus className="h-4 w-4" /> Add</Btn>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((x, i) => (
          <li key={x.id} className="rounded-xl border border-line">
            <div className="flex items-center gap-2 p-2 pl-3">
              <button className="min-w-0 flex-1 truncate text-left text-sm font-medium" onClick={() => setOpen(open === x.id ? null : x.id)}>
                <span className="mr-2 text-xs text-muted">{i + 1}.</span>{summary(x) || <span className="text-muted">(empty — click to edit)</span>}
              </button>
              <Btn variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Btn>
              <Btn variant="ghost" onClick={() => move(i, 1)} disabled={i === items.length - 1}><ArrowDown className="h-4 w-4" /></Btn>
              <Btn variant="ghost" onClick={() => setOpen(open === x.id ? null : x.id)}>{open === x.id ? "Close" : "Edit"}</Btn>
              <Btn variant="ghost" className="text-danger" onClick={() => confirm("Delete this item?") && onChange(items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Btn>
            </div>
            {open === x.id && (
              <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-2">
                {fields.map((f) => {
                  const v = String((x as Record<string, unknown>)[f.key] ?? "");
                  return (
                    <Field key={f.key} label={f.label} wide={f.wide || f.area || f.image} hint={f.hint}>
                      {f.image ? <ImageInput value={v} onChange={(u) => set(i, f.key, u)} />
                        : f.area ? <textarea className="field min-h-20" value={v} onChange={(e) => set(i, f.key, e.target.value)} />
                        : <input className="field" value={v} onChange={(e) => set(i, f.key, e.target.value)} />}
                    </Field>
                  );
                })}
              </div>
            )}
          </li>
        ))}
        {!items.length && <li className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">Nothing here yet — the section is hidden on the website until you add an item.</li>}
      </ul>
    </Card>
  );
}

export default function AdminHomepage() {
  const data = useCatalog();
  const [h, setH] = useState<HomeContent>(data.settings.home);
  const [msg, setMsg] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (!dirty) setH(data.settings.home); }, [data.settings.home, dirty]);

  // Edits stay as typed (blank new items included) until Save, which cleans them up.
  const update = (next: Partial<HomeContent>) => { setH((cur) => ({ ...cur, ...next })); setDirty(true); };
  function save() {
    saveSettings({ ...data.settings, home: normalizeHome(h) });
    setDirty(false);
    setMsg("Saved. The homepage now shows these changes.");
    setTimeout(() => setMsg(null), 3000);
  }
  const label = (id: string): ReactNode => {
    if (id.startsWith("custom:")) { const c = h.custom.find((x) => `custom:${x.id}` === id); return <>{c?.title || "Untitled section"} <Pill>Custom</Pill></>; }
    return BUILT_IN_SECTIONS[id as BuiltInSection] ?? id;
  };
  const moveSection = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= h.sections.length) return; const n = [...h.sections]; [n[i], n[j]] = [n[j], n[i]]; update({ sections: n }); };

  return (
    <>
      <PageHead
        title="Homepage sections"
        subtitle="Choose which sections appear and in what order, edit every list on the homepage, and add your own sections. The hero stays at the top."
        actions={<>
          <Btn variant="outline" onClick={() => { if (confirm("Restore the original homepage sections and content? Your edits here will be replaced.")) { setH(DEFAULT_HOME); setDirty(true); } }}><RotateCcw className="h-4 w-4" /> Restore defaults</Btn>
          <Btn onClick={save} disabled={!dirty}><Save className="h-4 w-4" /> {dirty ? "Save changes" : "Saved"}</Btn>
        </>}
      />
      {msg && <p className="mb-4 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">{msg}</p>}
      <div className="space-y-4">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-sans text-base font-semibold">Section order & visibility</h2>
              <p className="text-xs text-muted">Hero → then these, top to bottom. Hidden sections keep their content.</p>
            </div>
            <Btn variant="outline" onClick={() => { const c = blankCustomSection(); update({ custom: [...h.custom, c], sections: [...h.sections, { id: `custom:${c.id}`, visible: true }] }); }}><Plus className="h-4 w-4" /> Add new section</Btn>
          </div>
          <ol className="mt-4 space-y-2">
            <li className="flex items-center gap-2 rounded-xl border border-line bg-sand/50 p-2 pl-3 text-sm text-muted">0. Hero film, headline & “What are you celebrating?” (always first)</li>
            {h.sections.map((s, i) => (
              <li key={s.id} className={`flex items-center gap-2 rounded-xl border border-line p-2 pl-3 text-sm ${s.visible ? "" : "opacity-60"}`}>
                <span className="min-w-0 flex-1 truncate"><span className="mr-2 text-xs text-muted">{i + 1}.</span>{label(s.id)}</span>
                <Btn variant="ghost" onClick={() => moveSection(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Btn>
                <Btn variant="ghost" onClick={() => moveSection(i, 1)} disabled={i === h.sections.length - 1}><ArrowDown className="h-4 w-4" /></Btn>
                <Btn variant="ghost" onClick={() => update({ sections: h.sections.map((x, j) => (j === i ? { ...x, visible: !x.visible } : x)) })}>
                  {s.visible ? <><Eye className="h-4 w-4" /> Shown</> : <><EyeOff className="h-4 w-4" /> Hidden</>}
                </Btn>
                {s.id.startsWith("custom:") && (
                  <Btn variant="ghost" className="text-danger" onClick={() => confirm("Delete this section?") && update({ sections: h.sections.filter((x) => x.id !== s.id), custom: h.custom.filter((c) => `custom:${c.id}` !== s.id) })}><Trash2 className="h-4 w-4" /></Btn>
                )}
              </li>
            ))}
          </ol>
        </Card>

        <ListEditor
          title="Your own sections" help="Sections you add appear in the order above. Each can have a title, text, photo and a button (English and Bangla)."
          items={h.custom} blank={blankCustomSection} summary={(x) => x.title}
          onChange={(custom) => update({ custom, sections: [...h.sections.filter((s) => !s.id.startsWith("custom:") || custom.some((c) => `custom:${c.id}` === s.id)), ...custom.filter((c) => !h.sections.some((s) => s.id === `custom:${c.id}`)).map((c) => ({ id: `custom:${c.id}`, visible: true }))] })}
          fields={[
            { key: "eyebrow", label: "Small label (English)" }, { key: "eyebrowBn", label: "Small label (Bangla)" },
            { key: "title", label: "Title (English)" }, { key: "titleBn", label: "Title (Bangla)" },
            { key: "body", label: "Text (English)", area: true }, { key: "bodyBn", label: "Text (Bangla)", area: true },
            { key: "image", label: "Photo (optional)", image: true },
            { key: "cta", label: "Button text (English)" }, { key: "ctaBn", label: "Button text (Bangla)" },
            { key: "href", label: "Button link", wide: true, hint: "A page on this site (e.g. /wedding) or a full https:// link." },
          ]}
        />

        <ListEditor
          title="Your event, your process — steps" help="The step-by-step guide. Each step can link to a page."
          items={h.process} summary={(x) => x.title}
          blank={() => ({ id: uid("p"), title: "", titleBn: "", body: "", bodyBn: "", cta: "", ctaBn: "", href: "" })}
          onChange={(process) => update({ process })}
          fields={[
            { key: "title", label: "Step title (English)" }, { key: "titleBn", label: "Step title (Bangla)" },
            { key: "body", label: "Explanation (English)", area: true }, { key: "bodyBn", label: "Explanation (Bangla)", area: true },
            { key: "cta", label: "Link text (English)" }, { key: "ctaBn", label: "Link text (Bangla)" },
            { key: "href", label: "Link", wide: true, hint: "e.g. /search, /event-planner, /#occasions" },
          ]}
        />

        <ListEditor
          title="Promise strip" help="The short phrases that scroll under the hero."
          items={h.ticker} summary={(x) => x.en}
          blank={() => ({ id: uid("k"), en: "", bn: "" })}
          onChange={(ticker) => update({ ticker })}
          fields={[{ key: "en", label: "Text (English)" }, { key: "bn", label: "Text (Bangla)" }]}
        />

        <ListEditor
          title="Inspiration gallery" help="Photos of real setups. Upload a photo or paste an image link."
          items={h.gallery} summary={(x) => x.label}
          blank={() => ({ id: uid("g"), src: "", label: "", labelBn: "" })}
          onChange={(gallery) => update({ gallery })}
          fields={[{ key: "src", label: "Photo", image: true }, { key: "label", label: "Caption (English)" }, { key: "labelBn", label: "Caption (Bangla)" }]}
        />

        <ListEditor
          title="Testimonials" help="What hosts say about MUHURTO."
          items={h.testimonials} summary={(x) => `${x.name} — ${x.event}`}
          blank={() => ({ id: uid("t"), name: "", nameBn: "", event: "", eventBn: "", quote: "", quoteBn: "" })}
          onChange={(testimonials) => update({ testimonials })}
          fields={[
            { key: "name", label: "Name (English)" }, { key: "nameBn", label: "Name (Bangla)" },
            { key: "event", label: "Event & area (English)" }, { key: "eventBn", label: "Event & area (Bangla)" },
            { key: "quote", label: "Quote (English)", area: true }, { key: "quoteBn", label: "Quote (Bangla)", area: true },
          ]}
        />

        <ListEditor
          title="Frequently asked questions" help="Shown on the homepage."
          items={h.faqs} summary={(x) => x.q}
          blank={() => ({ id: uid("f"), q: "", qBn: "", a: "", aBn: "" })}
          onChange={(faqs) => update({ faqs })}
          fields={[
            { key: "q", label: "Question (English)", wide: true }, { key: "qBn", label: "Question (Bangla)", wide: true },
            { key: "a", label: "Answer (English)", area: true }, { key: "aBn", label: "Answer (Bangla)", area: true },
          ]}
        />
      </div>
    </>
  );
}
