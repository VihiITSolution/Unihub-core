"use client";

import { useState } from "react";

const box: React.CSSProperties = { background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 20, marginBottom: 16 };

export function AffiliateSharing({ referralLink }: { referralLink: string }) {
  const [notice, setNotice] = useState("");
  const message = `Join me on UniHub, Sri Lanka's student community for learning, courses and marketplace listings. Use my referral link to register: ${referralLink}\n\nNew students need a verified mobile and completed student profile, then an approved UniHub activity to qualify. I may receive an affiliate reward when a referral qualifies.`;
  const copyMessage = async (copiedNotice = "Message and link copied") => {
    await navigator.clipboard.writeText(message);
    setNotice(copiedNotice);
  };
  const openShare = (url: string) => window.open(url, "_blank", "noopener,noreferrer,width=650,height=620");
  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Join me on UniHub", text: message, url: referralLink });
      return;
    }
    await copyMessage("Message and link copied — paste it in any social app");
  };
  const instagramShare = async () => {
    await copyMessage("Message and link copied — paste it into your Instagram post or story");
    if (navigator.share) await navigator.share({ title: "Join me on UniHub", text: message, url: referralLink });
    else openShare("https://www.instagram.com/");
  };

  return <section style={box}>
    <h2 style={{ marginTop: 0 }}>Share your invite</h2>
    <p style={{ whiteSpace: "pre-line", background: "#f8fafc", padding: 12, borderRadius: 6, fontSize: 14 }}>{message}</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <button onClick={nativeShare}>Share on device</button>
      <button onClick={() => openShare(`https://wa.me/?text=${encodeURIComponent(message)}`)}>WhatsApp</button>
      <button onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`)}>Facebook</button>
      <button onClick={() => { copyMessage("Message copied for LinkedIn"); openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`); }}>LinkedIn</button>
      <button onClick={instagramShare}>Instagram</button>
      <button onClick={() => openShare(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`)}>Telegram</button>
      <button onClick={() => openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`)}>X</button>
      <button onClick={() => copyMessage()}>Copy message</button>
    </div>
    {notice && <p style={{ marginBottom: 0, color: "#166534", fontSize: 13 }}>{notice}</p>}
    <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 0 }}>Instagram does not support pre-filling a web post, so UniHub copies your invite first and then opens Instagram or your device share sheet.</p>
  </section>;
}
