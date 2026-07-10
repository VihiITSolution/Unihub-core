"use client";

interface TypingIndicatorProps {
  name?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ name }) => (
  <div
    style={{
      fontSize: 12,
      color: "var(--muted)",
      padding: "4px 14px",
      fontStyle: "italic",
    }}
  >
    {name ? `${name} is typing...` : "Typing..."}
  </div>
);
