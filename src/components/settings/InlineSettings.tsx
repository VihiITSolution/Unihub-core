"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { socialProfileService } from "@/services/social.service";
import { isValidPhone, isNameLike } from "@/lib/validation";
import { API_BASE_URL } from "@/lib/constants";
import { Avatar } from "@/components/ui";

// ── tiny helpers ──────────────────────────────────────────────────────────────
const BIO_MAX = 500;
const NOTIF_KEY = "unihub_notif_prefs";
const PRIV_KEY = "unihub_privacy_prefs";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        position: "relative", display: "inline-flex", flexShrink: 0,
        width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer",
        background: on ? "var(--brand, #16a34a)" : "#d1d5db",
        transition: "background .2s",
        padding: 2,
      }}
    >
      <span style={{
        display: "block", width: 18, height: 18, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,.2)",
        transform: on ? "translateX(18px)" : "translateX(0)",
        transition: "transform .2s",
      }} />
    </button>
  );
}

function Msg({ type, text }: { type: "success" | "error"; text: string }) {
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600, marginBottom: 14,
      background: type === "success" ? "#f0fdf4" : "#fef2f2",
      color: type === "success" ? "#166534" : "#991b1b",
      border: `1px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
    }}>
      {text}
    </div>
  );
}

function Row({ label, desc, onClick, open, danger }: { label: string; desc: string; onClick: () => void; open: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "13px 0", borderBottom: open ? "none" : "1px solid var(--line, #e5e7eb)",
        background: "none", border: "none", borderBottom: "1px solid var(--line, #e5e7eb)",
        textAlign: "left", cursor: "pointer", gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: danger ? "#dc2626" : "var(--ink, #111)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--muted, #6b7280)" }}>{desc}</div>
      </div>
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        style={{ color: "var(--muted, #6b7280)", flexShrink: 0, transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "16px 0 20px", borderBottom: "1px solid var(--line, #e5e7eb)" }}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink, #111)", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: 7, fontSize: 13,
        border: "1.5px solid #d1d5db", outline: "none", boxSizing: "border-box",
        background: props.readOnly ? "#f9fafb" : "#fff",
        color: props.readOnly ? "#9ca3af" : "inherit",
        cursor: props.readOnly ? "not-allowed" : "text",
        ...props.style,
      }}
    />
  );
}

function Btn({ children, onClick, type = "button", danger, disabled, small }: {
  children: React.ReactNode; onClick?: () => void;
  type?: "button" | "submit"; danger?: boolean; disabled?: boolean; small?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? "7px 14px" : "9px 18px",
        borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer",
        border: danger ? "none" : "1.5px solid #d1d5db",
        background: danger ? "#dc2626" : "var(--brand, #16a34a)",
        color: danger || !danger ? (danger ? "#fff" : "#fff") : "var(--ink)",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity .15s",
      }}
    >
      {children}
    </button>
  );
}

// ── EDIT PROFILE ──────────────────────────────────────────────────────────────
function EditProfile() {
  const { user, token, updateUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ firstName: user?.firstName || "", lastName: user?.lastName || "", phoneNumber: user?.phoneNumber || "", bio: user?.bio || "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [photoMsg, setPhotoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName || "", lastName: user.lastName || "", phoneNumber: user.phoneNumber || "", bio: user.bio || "" });
  }, [user]);

  const avatar = preview || user?.profileImage;

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setPhotoMsg({ type: "error", text: "Max 5 MB" }); return; }
    if (!f.type.match(/^image\/(jpeg|jpg|png|gif)$/)) { setPhotoMsg({ type: "error", text: "JPG, PNG or GIF only" }); return; }
    setFile(f); setPreview(URL.createObjectURL(f)); setPhotoMsg(null);
  };

  const uploadPhoto = async () => {
    if (!file || !token) return;
    setUploading(true); setPhotoMsg(null);
    try {
      const res = await socialProfileService.uploadAvatar(token, file);
      if (res.success && res.data?.profileImage) {
        if (user) updateUser({ ...user, profileImage: res.data.profileImage });
        setPreview(""); setFile(null);
        setPhotoMsg({ type: "success", text: "Photo updated!" });
      } else {
        setPhotoMsg({ type: "error", text: res.message || "Upload failed" });
      }
    } catch { setPhotoMsg({ type: "error", text: "Upload failed. Try again." }); }
    finally { setUploading(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!isNameLike(form.firstName)) { setMsg({ type: "error", text: "First name must be 2–50 letters" }); return; }
    if (!isNameLike(form.lastName)) { setMsg({ type: "error", text: "Last name must be 2–50 letters" }); return; }
    if (form.phoneNumber && !isValidPhone(form.phoneNumber)) { setMsg({ type: "error", text: "Invalid phone number" }); return; }
    setSaving(true); setMsg(null);
    try {
      const res = await authService.updateProfile(token, form);
      if (res.success) {
        if (res.data?.user) updateUser(res.data.user);
        setMsg({ type: "success", text: "Profile saved!" });
      } else { setMsg({ type: "error", text: res.message || "Save failed" }); }
    } catch { setMsg({ type: "error", text: "Save failed. Try again." }); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* Photo row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: "14px", background: "#f9fafb", borderRadius: 8 }}>
        <Avatar
          src={avatar}
          firstName={user?.firstName}
          lastName={user?.lastName}
          size={56}
          editable
          onEditClick={() => fileRef.current?.click()}
        />
        <div>
          {photoMsg && <Msg {...photoMsg} />}
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={pickFile} style={{ display: "none" }} />
          {file ? (
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={uploadPhoto} disabled={uploading} small>{uploading ? "Uploading…" : "Save Photo"}</Btn>
              <button onClick={() => { setFile(null); setPreview(""); }} style={{ fontSize: 12, color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} style={{ fontSize: 13, fontWeight: 600, color: "var(--brand, #16a34a)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              Change photo
            </button>
          )}
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>JPG, PNG or GIF · Max 5 MB</div>
        </div>
      </div>

      {msg && <Msg {...msg} />}
      <form onSubmit={save}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="First Name *">
            <Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required />
          </Field>
          <Field label="Last Name *">
            <Input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required />
          </Field>
        </div>
        <Field label="Email">
          <Input value={user?.email || ""} readOnly />
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Email cannot be changed</div>
        </Field>
        <Field label="Phone Number">
          <Input value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="+94 77 123 4567" type="tel" />
        </Field>
        <Field label={`Bio (${form.bio.length}/${BIO_MAX})`}>
          <textarea
            value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            maxLength={BIO_MAX} rows={3} placeholder="Tell others about yourself…"
            style={{ width: "100%", padding: "9px 12px", borderRadius: 7, fontSize: 13, border: "1.5px solid #d1d5db", outline: "none", resize: "none", boxSizing: "border-box" }}
          />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Btn type="submit" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Btn>
        </div>
      </form>
    </div>
  );
}

// ── CHANGE PASSWORD ───────────────────────────────────────────────────────────
function ChangePassword() {
  const { token } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword.length < 8) { setMsg({ type: "error", text: "New password must be at least 8 characters" }); return; }
    if (form.newPassword !== form.confirmPassword) { setMsg({ type: "error", text: "Passwords do not match" }); return; }
    setSaving(true); setMsg(null);
    try {
      const res = await authService.changePassword(token!, form.currentPassword, form.newPassword);
      if (res.success) {
        setMsg({ type: "success", text: "Password changed successfully!" });
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else { setMsg({ type: "error", text: res.message || "Failed" }); }
    } catch { setMsg({ type: "error", text: "Something went wrong. Try again." }); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} style={{ maxWidth: 400 }}>
      {msg && <Msg {...msg} />}
      {[
        { id: "currentPassword" as const, label: "Current Password" },
        { id: "newPassword" as const, label: "New Password (min. 8 chars)" },
        { id: "confirmPassword" as const, label: "Confirm New Password" },
      ].map(({ id, label }) => (
        <Field key={id} label={label}>
          <Input type="password" value={form[id]} onChange={e => setForm(p => ({ ...p, [id]: e.target.value }))} required />
        </Field>
      ))}
      <Btn type="submit" disabled={saving}>{saving ? "Changing…" : "Change Password"}</Btn>
    </form>
  );
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
const NOTIF_ITEMS = [
  { key: "courseUpdates",      label: "Course updates",      desc: "New lessons added to your enrolled courses" },
  { key: "sessionReminders",   label: "Session reminders",   desc: "1 hour before your booked live sessions" },
  { key: "newEnrollment",      label: "New enrollments",     desc: "When a student joins your course" },
  { key: "marketplaceMessages",label: "Marketplace messages",desc: "Messages from buyers/sellers" },
  { key: "boardingMessages",   label: "Boarding enquiries",  desc: "Messages about boarding rooms" },
  { key: "weeklyDigest",       label: "Weekly digest",       desc: "A summary of your activity each week" },
  { key: "promotions",         label: "Promotions",          desc: "Deals, offers, and announcements" },
];

function NotificationPrefs() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "{}"); } catch { return {}; }
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: string, val: boolean) => { setPrefs(p => ({ ...p, [key]: val })); setSaved(false); };
  const save = () => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const get = (key: string, def = true) => prefs[key] ?? def;

  return (
    <div>
      {NOTIF_ITEMS.map(({ key, label, desc }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line, #f3f4f6)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{desc}</div>
          </div>
          <Toggle on={get(key)} onChange={v => toggle(key, v)} />
        </div>
      ))}
      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={save}>{saved ? "Saved!" : "Save Preferences"}</Btn>
      </div>
    </div>
  );
}

// ── PRIVACY ───────────────────────────────────────────────────────────────────
const PRIV_ITEMS = [
  { key: "profileVisible",  label: "Public profile",          desc: "Anyone can view your profile page" },
  { key: "showCourses",     label: "Show my courses",         desc: "Show published courses on your profile" },
  { key: "showEnrollments", label: "Show enrolled courses",   desc: "Let others see what you're studying" },
  { key: "allowFollowers",  label: "Allow followers",         desc: "Let users follow you on the Wall" },
  { key: "showActivity",    label: "Show wall activity",      desc: "Display your posts on your public profile" },
];

function PrivacySettings() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(PRIV_KEY) || "{}"); } catch { return {}; }
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: string, val: boolean) => { setPrefs(p => ({ ...p, [key]: val })); setSaved(false); };
  const save = () => {
    localStorage.setItem(PRIV_KEY, JSON.stringify(prefs));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const def: Record<string, boolean> = { profileVisible: true, showCourses: true, showEnrollments: false, allowFollowers: true, showActivity: false };
  const get = (key: string) => prefs[key] ?? def[key] ?? true;

  return (
    <div>
      {PRIV_ITEMS.map(({ key, label, desc }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line, #f3f4f6)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{desc}</div>
          </div>
          <Toggle on={get(key)} onChange={v => toggle(key, v)} />
        </div>
      ))}
      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={save}>{saved ? "Saved!" : "Save Settings"}</Btn>
      </div>
    </div>
  );
}

// ── LINKED ACCOUNTS ───────────────────────────────────────────────────────────
function LinkedAccounts() {
  const { user } = useAuth();

  return (
    <div>
      <div style={{ padding: "10px 0", borderBottom: "1px solid var(--line, #f3f4f6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f3f4f6", display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Google</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Sign in with Google</div>
            </div>
          </div>
          <button onClick={() => alert("Google login not yet configured. Contact support@unihub.lk")} style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 6, border: "1.5px solid #d1d5db", background: "#fff", cursor: "pointer" }}>Connect</button>
        </div>
      </div>
      <div style={{ padding: "10px 0", borderBottom: "1px solid var(--line, #f3f4f6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f3f4f6", display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Facebook</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Sign in with Facebook</div>
            </div>
          </div>
          <button onClick={() => alert("Facebook login not yet configured. Contact support@unihub.lk")} style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 6, border: "1.5px solid #d1d5db", background: "#fff", cursor: "pointer" }}>Connect</button>
        </div>
      </div>
      <div style={{ marginTop: 14, padding: "12px 14px", background: "#f0fdf4", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--brand, #16a34a)", display: "grid", placeItems: "center", color: "#fff", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
          {user?.email?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.email}</div>
          <div style={{ fontSize: 11, color: "var(--brand, #16a34a)", fontWeight: 700 }}>Email login · Active</div>
        </div>
      </div>
    </div>
  );
}

// ── DELETE ACCOUNT ────────────────────────────────────────────────────────────
function DeleteAccount() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);

  const doDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm !== "DELETE") { setError('Type DELETE to confirm.'); return; }
    setDeleting(true); setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) { logout(); router.push("/auth/login?deleted=1"); }
      else setError(data.message || "Failed to delete account.");
    } catch { setError("Something went wrong. Try again."); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div style={{ padding: "12px 14px", background: "#fef2f2", borderRadius: 8, marginBottom: 16, fontSize: 13, color: "#991b1b", lineHeight: 1.55 }}>
        <strong>This cannot be undone.</strong> Your profile, courses, and all data will be permanently removed.
      </div>
      {!armed ? (
        <button onClick={() => setArmed(true)} style={{ fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 7, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer" }}>
          I want to delete my account
        </button>
      ) : (
        <form onSubmit={doDelete} style={{ maxWidth: 380 }}>
          {error && <Msg type="error" text={error} />}
          <Field label="Your current password">
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter password" />
          </Field>
          <Field label='Type DELETE to confirm'>
            <Input value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="DELETE" style={{ fontFamily: "monospace" }} />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={deleting || confirm !== "DELETE"} style={{ fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 7, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", opacity: (deleting || confirm !== "DELETE") ? 0.5 : 1 }}>
              {deleting ? "Deleting…" : "Delete My Account"}
            </button>
            <button type="button" onClick={() => { setArmed(false); setPassword(""); setConfirm(""); setError(null); }} style={{ fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 7, border: "1.5px solid #d1d5db", background: "#fff", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
const ITEMS = [
  { id: "profile",       label: "Edit profile",            desc: "Update your name, photo, bio, and contact details",    Component: EditProfile },
  { id: "password",      label: "Change password",          desc: "Update your password and security settings",            Component: ChangePassword },
  { id: "notifications", label: "Notification preferences", desc: "Choose what you get notified about",                    Component: NotificationPrefs },
  { id: "privacy",       label: "Privacy settings",         desc: "Control who can see your profile and activity",         Component: PrivacySettings },
  { id: "accounts",      label: "Linked accounts",          desc: "Connect Google, Facebook, or other services",           Component: LinkedAccounts },
  { id: "danger",        label: "Delete account",           desc: "Permanently remove your UniHub account",                Component: DeleteAccount, danger: true },
];

export default function InlineSettings() {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (id: string) => setOpen(prev => prev === id ? null : id);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {ITEMS.map(({ id, label, desc, Component, danger }) => (
        <div key={id}>
          <Row label={label} desc={desc} onClick={() => toggle(id)} open={open === id} danger={danger} />
          {open === id && (
            <Panel>
              <Component />
            </Panel>
          )}
        </div>
      ))}
    </div>
  );
}
