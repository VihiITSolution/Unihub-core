"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { socialProfileService } from "@/services/social.service";
import { isValidPhone, isNameLike } from "@/lib/validation";
import { Avatar } from "@/components/ui";

const BIO_MAX = 500;

function Alert({ type, text }: { type: "success" | "error"; text: string }) {
  return (
    <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
      {text}
    </div>
  );
}

export default function ProfileSettings() {
  const { user, token, updateUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phoneNumber: "", bio: "" });
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [photoMsg, setPhotoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setPhotoMsg({ type: "error", text: "Max 5 MB" }); return; }
    if (!f.type.match(/^image\/(jpeg|jpg|png|gif)$/)) { setPhotoMsg({ type: "error", text: "JPG, PNG or GIF only" }); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPhotoMsg(null);
  };

  const handleUpload = async () => {
    if (!file || !token) return;
    setUploading(true);
    setPhotoMsg(null);
    try {
      const res = await socialProfileService.uploadAvatar(token, file);
      if (res.success && res.data?.profileImage) {
        if (user) updateUser({ ...user, profileImage: res.data.profileImage });
        setPreview("");
        setFile(null);
        setPhotoMsg({ type: "success", text: "Photo updated!" });
      } else {
        setPhotoMsg({ type: "error", text: res.message || "Upload failed" });
      }
    } catch {
      setPhotoMsg({ type: "error", text: "Upload failed. Try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!isNameLike(form.firstName)) { setMsg({ type: "error", text: "First name must be 2–50 letters" }); return; }
    if (!isNameLike(form.lastName)) { setMsg({ type: "error", text: "Last name must be 2–50 letters" }); return; }
    if (form.phoneNumber && !isValidPhone(form.phoneNumber)) { setMsg({ type: "error", text: "Invalid phone number" }); return; }
    if (form.bio.length > BIO_MAX) { setMsg({ type: "error", text: `Bio max ${BIO_MAX} chars` }); return; }
    setSaving(true);
    setMsg(null);
    try {
      const res = await authService.updateProfile(token, form);
      if (res.success) {
        if (res.data?.user) updateUser(res.data.user);
        setMsg({ type: "success", text: "Profile saved!" });
      } else {
        setMsg({ type: "error", text: res.message || "Save failed" });
      }
    } catch {
      setMsg({ type: "error", text: "Save failed. Try again." });
    } finally {
      setSaving(false);
    }
  };

  const avatar = preview || user?.profileImage;

  return (
    <div className="space-y-6">
      {/* Photo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
        {photoMsg && <Alert {...photoMsg} />}
        <div className="flex items-center gap-5">
          <Avatar
            src={avatar}
            firstName={user?.firstName}
            lastName={user?.lastName}
            size={80}
            editable
            onEditClick={() => fileRef.current?.click()}
          />
          <div className="flex flex-col gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={handleFileSelect} className="hidden" />
            {file ? (
              <div className="flex gap-2">
                <button onClick={handleUpload} disabled={uploading} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                  {uploading ? "Uploading…" : "Save Photo"}
                </button>
                <button onClick={() => { setFile(null); setPreview(""); }} className="px-4 py-2 border border-gray-300 text-sm rounded-lg">Cancel</button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">
                Change Photo
              </button>
            )}
            <p className="text-xs text-gray-400">JPG, PNG or GIF · Max 5 MB</p>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        {msg && <Alert {...msg} />}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user?.email || ""} readOnly className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="+94 77 123 4567" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={4} maxLength={BIO_MAX} placeholder="Tell others a bit about yourself…" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            <p className="text-xs text-gray-400 mt-1">{form.bio.length}/{BIO_MAX}</p>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
