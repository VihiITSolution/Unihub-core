"use client";

interface AvatarProps {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Shows a small pencil badge in the corner (profile edit screens). */
  editable?: boolean;
  onEditClick?: () => void;
}

export function Avatar({
  src,
  firstName,
  lastName,
  size = 40,
  className,
  style,
  editable,
  onEditClick,
}: AvatarProps) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const alt = [firstName, lastName].filter(Boolean).join(" ") || "avatar";

  return (
    <div
      className={className}
      style={{ position: "relative", width: size, height: size, flexShrink: 0, ...style }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #9333ea)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: Math.max(11, Math.round(size * 0.4)),
            lineHeight: 1,
          }}
        >
          {initials}
        </div>
      )}

      {editable && (
        <button
          type="button"
          onClick={onEditClick}
          aria-label="Change profile photo"
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: Math.max(20, Math.round(size * 0.32)),
            height: Math.max(20, Math.round(size * 0.32)),
            borderRadius: "50%",
            background: "var(--brand, #16a34a)",
            color: "#fff",
            border: "2px solid #fff",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      )}
    </div>
  );
}
