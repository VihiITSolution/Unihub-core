"use client";

import { useState, useEffect } from "react";
import facultyService, { FALLBACK_FACULTIES, type Faculty, type Department } from "@/services/faculty.service";

// ── Inline components ────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: "ok" | "err" }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      padding: "12px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
      background: type === "ok" ? "#f0fdf9" : "#fef2f2",
      border: `1px solid ${type === "ok" ? "#6ee7d4" : "#fecaca"}`,
      color: type === "ok" ? "var(--brand-dark)" : "#b91c1c",
      boxShadow: "0 4px 16px rgba(0,0,0,.12)",
    }}>
      {msg}
    </div>
  );
}

function ConfirmModal({ msg, onConfirm, onCancel }: { msg: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 200, display: "grid", placeItems: "center" }}>
      <div style={{ background: "#fff", borderRadius: 10, padding: "28px 32px", width: 360, boxShadow: "0 8px 40px rgba(0,0,0,.2)" }}>
        <p style={{ margin: "0 0 20px", fontSize: 15, color: "var(--ink)" }}>{msg}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "8px 16px", border: "1px solid var(--line)", background: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AdminFacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [confirm, setConfirm] = useState<{ msg: string; cb: () => void } | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Faculty form state
  const [fForm, setFForm] = useState({ name: "", icon: "" });
  const [editFaculty, setEditFaculty] = useState<Faculty | null>(null);
  const [fSaving, setFSaving] = useState(false);

  // Department form state (keyed per faculty)
  const [dForms, setDForms] = useState<Record<number, string>>({});
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [dSaving, setDSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const data = await facultyService.getAll(true);
    setFaculties(data);
    setLoading(false);
  };

  // ── Faculty CRUD ──────────────────────────────────────────────────────────

  const saveFaculty = async () => {
    if (!fForm.name.trim()) return;
    setFSaving(true);
    try {
      if (editFaculty) {
        const res = await facultyService.updateFaculty(editFaculty.id, { name: fForm.name, icon: fForm.icon });
        if (res.success) { showToast("Faculty updated", "ok"); setEditFaculty(null); setFForm({ name: "", icon: "" }); load(); }
        else showToast(res.error || "Failed", "err");
      } else {
        const res = await facultyService.createFaculty({ name: fForm.name, icon: fForm.icon });
        if (res.success) { showToast("Faculty created", "ok"); setFForm({ name: "", icon: "" }); load(); }
        else showToast(res.error || "Failed", "err");
      }
    } finally { setFSaving(false); }
  };

  const deleteFaculty = (f: Faculty) => {
    setConfirm({
      msg: `Delete faculty "${f.name}" and all its departments?`,
      cb: async () => {
        setConfirm(null);
        const res = await facultyService.deleteFaculty(f.id);
        if (res.success) { showToast("Deleted", "ok"); load(); }
        else showToast(res.error || "Failed", "err");
      },
    });
  };

  const toggleActive = async (f: Faculty) => {
    const res = await facultyService.updateFaculty(f.id, { isActive: !f.isActive });
    if (res.success) load();
    else showToast(res.error || "Failed", "err");
  };

  // ── Department CRUD ───────────────────────────────────────────────────────

  const saveDept = async (facultyId: number) => {
    const name = (dForms[facultyId] || "").trim();
    if (!name) return;
    setDSaving(true);
    try {
      if (editDept) {
        const res = await facultyService.updateDepartment(editDept.id, { name });
        if (res.success) { showToast("Department updated", "ok"); setEditDept(null); setDForms((p) => ({ ...p, [facultyId]: "" })); load(); }
        else showToast(res.error || "Failed", "err");
      } else {
        const res = await facultyService.createDepartment(facultyId, { name });
        if (res.success) { showToast("Department added", "ok"); setDForms((p) => ({ ...p, [facultyId]: "" })); load(); }
        else showToast(res.error || "Failed", "err");
      }
    } finally { setDSaving(false); }
  };

  const deleteDept = (dept: Department) => {
    setConfirm({
      msg: `Delete department "${dept.name}"?`,
      cb: async () => {
        setConfirm(null);
        const res = await facultyService.deleteDepartment(dept.id);
        if (res.success) { showToast("Deleted", "ok"); load(); }
        else showToast(res.error || "Failed", "err");
      },
    });
  };

  const toggleDeptActive = async (dept: Department) => {
    const res = await facultyService.updateDepartment(dept.id, { isActive: !dept.isActive });
    if (res.success) load();
    else showToast(res.error || "Failed", "err");
  };

  // ── Seed ─────────────────────────────────────────────────────────────────

  const [seedProgress, setSeedProgress] = useState("");

  const handleSeed = async () => {
    setSeeding(true);
    setSeedProgress("Loading existing faculties…");
    let created = 0;
    let deptCreated = 0;
    let errors = 0;

    try {
      const existing = await facultyService.getAll(true);

      for (const seed of FALLBACK_FACULTIES) {
        const normalised = seed.name.toLowerCase().trim();
        const match = existing.find((f) => f.name.toLowerCase().trim() === normalised);
        let facultyId: number | null = null;

        if (match) {
          facultyId = match.id;
          // Add missing departments to this faculty
          const existingDeptNames = new Set(
            (match.departments ?? []).map((d) => d.name.toLowerCase().trim()),
          );
          for (const dept of seed.departments ?? []) {
            if (!existingDeptNames.has(dept.name.toLowerCase().trim())) {
              setSeedProgress(`Adding "${dept.name}" → ${seed.name}`);
              const dr = await facultyService.createDepartment(facultyId, { name: dept.name, order: dept.order });
              if (dr.success) deptCreated++; else errors++;
            }
          }
        } else {
          setSeedProgress(`Creating "${seed.name}"…`);
          const r = await facultyService.createFaculty({ name: seed.name, icon: seed.icon, order: seed.order });
          if (r.success && r.data) {
            facultyId = (r.data as any).id ?? (r.data as any).faculty?.id ?? null;
            created++;
            if (facultyId) {
              for (const dept of seed.departments ?? []) {
                setSeedProgress(`Adding "${dept.name}"…`);
                const dr = await facultyService.createDepartment(facultyId, { name: dept.name, order: dept.order });
                if (dr.success) deptCreated++; else errors++;
              }
            }
          } else {
            errors++;
          }
        }
      }

      setSeedProgress("");
      if (errors === 0) {
        showToast(`Done — ${created} faculties + ${deptCreated} departments added`, "ok");
      } else {
        showToast(`Completed with ${errors} error(s) — ${created} faculties + ${deptCreated} depts`, "err");
      }
      load();
    } catch (err: any) {
      setSeedProgress("");
      showToast(err.message || "Seed failed", "err");
    } finally {
      setSeeding(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    height: 38, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 6,
    fontSize: 13, color: "var(--ink)", background: "#fff", outline: "none",
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin</p>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "var(--ink)" }}>Faculties & Departments</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
            Manage faculties and their departments. Changes appear immediately in the header nav and course filters.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <button
            onClick={handleSeed}
            disabled={seeding}
            style={{
              height: 38, padding: "0 16px", flexShrink: 0,
              background: seeding ? "#94a3b8" : "var(--brand)",
              color: "#fff", border: "none", borderRadius: 6,
              fontSize: 13, fontWeight: 800, cursor: seeding ? "not-allowed" : "pointer",
            }}
          >
            {seeding ? "Seeding…" : "Seed Sri Lankan Defaults"}
          </button>
          {seedProgress && (
            <span style={{ fontSize: 11, color: "var(--muted)", maxWidth: 220, textAlign: "right", lineHeight: 1.3 }}>
              {seedProgress}
            </span>
          )}
        </div>
      </div>

      {/* Add / Edit Faculty form */}
      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: "20px 24px", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>
          {editFaculty ? `Edit Faculty: ${editFaculty.name}` : "Add New Faculty"}
        </h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={fForm.icon}
            onChange={(e) => setFForm((p) => ({ ...p, icon: e.target.value }))}
            placeholder="Icon (emoji)"
            style={{ ...inputStyle, width: 80 }}
          />
          <input
            value={fForm.name}
            onChange={(e) => setFForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Faculty name"
            style={{ ...inputStyle, flex: 1, minWidth: 200 }}
            onKeyDown={(e) => e.key === "Enter" && saveFaculty()}
          />
          <button
            onClick={saveFaculty}
            disabled={fSaving || !fForm.name.trim()}
            style={{
              height: 38, padding: "0 18px",
              background: fSaving ? "#94a3b8" : "var(--ink)",
              color: "#fff", border: "none", borderRadius: 6,
              fontSize: 13, fontWeight: 800,
              cursor: fSaving || !fForm.name.trim() ? "not-allowed" : "pointer",
            }}
          >
            {fSaving ? "Saving…" : editFaculty ? "Update" : "Add Faculty"}
          </button>
          {editFaculty && (
            <button
              onClick={() => { setEditFaculty(null); setFForm({ name: "", icon: "" }); }}
              style={{ height: 38, padding: "0 14px", border: "1px solid var(--line)", background: "#fff", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Faculty list */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading…</div>
      ) : faculties.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", border: "1px dashed var(--line)", borderRadius: 8, color: "var(--muted)", fontSize: 14 }}>
          No faculties yet. Click <strong>Seed Sri Lankan Defaults</strong> to populate, or add manually above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faculties.map((f) => {
            const expanded = expandedId === f.id;
            const depts = f.departments || [];
            return (
              <div key={f.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
                {/* Faculty row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : f.id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                      display: "flex", alignItems: "center", gap: 8, flex: 1, textAlign: "left",
                    }}
                  >
                    <svg
                      width="14" height="14" viewBox="0 0 20 20" fill="currentColor"
                      style={{ opacity: 0.4, transition: "transform .2s", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", flexShrink: 0 }}
                    >
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
                    </svg>
                    {f.icon && <span style={{ fontSize: 18 }}>{f.icon}</span>}
                    <span style={{ fontSize: 15, fontWeight: 700, color: f.isActive ? "var(--ink)" : "var(--muted)" }}>
                      {f.name}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>
                      ({depts.length} dept{depts.length !== 1 ? "s" : ""})
                    </span>
                    {!f.isActive && (
                      <span style={{ fontSize: 11, padding: "2px 8px", background: "#f1f5f9", color: "var(--muted)", borderRadius: 999, fontWeight: 700 }}>
                        Inactive
                      </span>
                    )}
                  </button>

                  {/* Faculty actions */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => toggleActive(f)}
                      title={f.isActive ? "Deactivate" : "Activate"}
                      style={{ padding: "5px 10px", border: "1px solid var(--line)", background: "#fff", borderRadius: 5, fontSize: 12, cursor: "pointer", color: "var(--muted)" }}
                    >
                      {f.isActive ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => { setEditFaculty(f); setFForm({ name: f.name, icon: f.icon || "" }); }}
                      style={{ padding: "5px 10px", border: "1px solid var(--line)", background: "#fff", borderRadius: 5, fontSize: 12, cursor: "pointer", color: "var(--ink)" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteFaculty(f)}
                      style={{ padding: "5px 10px", border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 5, fontSize: 12, cursor: "pointer", color: "#b91c1c" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Departments panel */}
                {expanded && (
                  <div style={{ borderTop: "1px solid var(--line)", background: "#fafafa", padding: "14px 18px 18px" }}>
                    {/* Department list */}
                    {depts.length === 0 ? (
                      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--muted)" }}>No departments yet.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                        {depts.map((d) => (
                          <div
                            key={d.id}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "8px 12px", background: "#fff",
                              border: "1px solid var(--line)", borderRadius: 6,
                            }}
                          >
                            <span style={{ fontSize: 13, color: d.isActive ? "var(--ink)" : "var(--muted)", fontWeight: d.isActive ? 500 : 400 }}>
                              {d.name}
                              {!d.isActive && <span style={{ fontSize: 11, marginLeft: 8, color: "var(--muted)" }}>(inactive)</span>}
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => toggleDeptActive(d)}
                                style={{ padding: "3px 8px", border: "1px solid var(--line)", background: "#fff", borderRadius: 4, fontSize: 11, cursor: "pointer", color: "var(--muted)" }}
                              >
                                {d.isActive ? "Hide" : "Show"}
                              </button>
                              <button
                                onClick={() => {
                                  setEditDept(d);
                                  setDForms((p) => ({ ...p, [f.id]: d.name }));
                                }}
                                style={{ padding: "3px 8px", border: "1px solid var(--line)", background: "#fff", borderRadius: 4, fontSize: 11, cursor: "pointer" }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteDept(d)}
                                style={{ padding: "3px 8px", border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 4, fontSize: 11, cursor: "pointer", color: "#b91c1c" }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add / Edit department form */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={dForms[f.id] || ""}
                        onChange={(e) => setDForms((p) => ({ ...p, [f.id]: e.target.value }))}
                        placeholder={editDept && editDept.facultyId === f.id ? "Edit department name" : "New department name"}
                        style={{ ...inputStyle, flex: 1 }}
                        onKeyDown={(e) => e.key === "Enter" && saveDept(f.id)}
                      />
                      <button
                        onClick={() => saveDept(f.id)}
                        disabled={dSaving || !(dForms[f.id] || "").trim()}
                        style={{
                          height: 38, padding: "0 14px",
                          background: dSaving ? "#94a3b8" : "var(--brand)",
                          color: "#fff", border: "none", borderRadius: 6,
                          fontSize: 13, fontWeight: 700,
                          cursor: dSaving || !(dForms[f.id] || "").trim() ? "not-allowed" : "pointer",
                        }}
                      >
                        {dSaving ? "…" : editDept && editDept.facultyId === f.id ? "Update" : "Add"}
                      </button>
                      {editDept && editDept.facultyId === f.id && (
                        <button
                          onClick={() => { setEditDept(null); setDForms((p) => ({ ...p, [f.id]: "" })); }}
                          style={{ height: 38, padding: "0 12px", border: "1px solid var(--line)", background: "#fff", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Seed reference table */}
      <details style={{ marginTop: 32 }}>
        <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 12 }}>
          View full Sri Lankan faculty / department reference data
        </summary>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {FALLBACK_FACULTIES.map((f) => (
            <div key={f.name} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 6, padding: "12px 16px" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>{f.icon} {f.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(f.departments ?? []).map((d) => (
                  <span key={d.name} style={{ fontSize: 12, padding: "3px 10px", background: "var(--soft)", border: "1px solid var(--line)", borderRadius: 999, color: "var(--muted)" }}>
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {confirm && <ConfirmModal msg={confirm.msg} onConfirm={confirm.cb} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
