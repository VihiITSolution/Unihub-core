"use client";

import { useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";

interface MessageComposerProps {
  onSend: (body: string, files: File[]) => Promise<void> | void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
}

// Lightweight, non-authoritative mirror of the server-side contact-info
// filter (utils/contentFilter.js) - just enough to warn the user before
// they hit send. The server's check is the real gate; this is a nicety.
const looksLikeContactInfo = (text: string) => {
  const lower = text.toLowerCase();
  const phonePattern = /(?:\+?\d[\s.\-]?){7,}\d/;
  const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
  const offPlatformKeywords = ["whatsapp", "telegram", "t.me", "viber", "signal"];
  return (
    phonePattern.test(lower) ||
    emailPattern.test(lower) ||
    offPlatformKeywords.some((kw) => lower.includes(kw))
  );
};

const MAX_FILES = 5;

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled,
}) => {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBodyChange = (value: string) => {
    setBody(value);
    setWarning(
      value.trim() && looksLikeContactInfo(value)
        ? "This looks like it might contain contact info - it may be rejected when you send it."
        : null,
    );

    onTypingStart?.();
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTypingStop?.(), 1500);
  };

  const handleFilesSelected = (selected: FileList | null) => {
    if (!selected) return;
    setFiles((prev) => [...prev, ...Array.from(selected)].slice(0, MAX_FILES));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || sending) return;
    if (!body.trim() && files.length === 0) return;

    setSending(true);
    try {
      await onSend(body.trim(), files);
      setBody("");
      setFiles([]);
      setWarning(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onTypingStop?.();
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ borderTop: "1px solid var(--line)", padding: 12 }}>
      {warning && (
        <div
          style={{
            fontSize: 12,
            color: "#b45309",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 6,
            padding: "6px 10px",
            marginBottom: 8,
          }}
        >
          {warning}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2" style={{ marginBottom: 8 }}>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                background: "var(--soft)",
                border: "1px solid var(--line)",
                borderRadius: 6,
                padding: "4px 8px",
              }}
            >
              <span className="truncate" style={{ maxWidth: 140 }}>{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}
                aria-label={`Remove ${file.name}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || files.length >= MAX_FILES}
          style={{
            width: 38,
            height: 38,
            border: "1px solid var(--line)",
            background: "var(--white)",
            borderRadius: 6,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Attach file"
        >
          <Paperclip size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        <textarea
          value={body}
          onChange={(e) => handleBodyChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Type a message... (no phone numbers or emails)"
          rows={1}
          disabled={disabled}
          style={{
            flex: 1,
            resize: "none",
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: "9px 12px",
            fontSize: 14,
            outline: "none",
            fontFamily: "inherit",
            maxHeight: 120,
          }}
        />

        <button
          type="submit"
          disabled={disabled || sending || (!body.trim() && files.length === 0)}
          style={{
            width: 38,
            height: 38,
            border: "none",
            background: "var(--brand)",
            color: "#fff",
            borderRadius: 6,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            flexShrink: 0,
            opacity: sending ? 0.6 : 1,
          }}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </form>
  );
};
