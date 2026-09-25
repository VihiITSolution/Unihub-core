"use client";

import { Check, Copy, Link2, Send, Share2, Sparkles } from "lucide-react";
import { useState } from "react";

export function AffiliateSharing({ referralLink }: { referralLink: string }) {
  const [notice, setNotice] = useState("");
  const message = `Join me on UniHub, Sri Lanka's student community for learning, courses and marketplace listings. Use my referral link to register: ${referralLink}\n\nEarn rewards when you become active — join now and let's grow together!`;
  const copyMessage = async (copiedNotice = "Invite message copied — ready to paste anywhere") => {
    await navigator.clipboard.writeText(message);
    setNotice(copiedNotice);
  };
  const openShare = (url: string) => window.open(url, "_blank", "noopener,noreferrer,width=650,height=620");
  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Join me on UniHub", text: message, url: referralLink });
      return;
    }
    await copyMessage();
  };
  const instagramShare = async () => {
    await copyMessage("Invite message copied — paste it into your Instagram post or story");
    if (navigator.share) await navigator.share({ title: "Join me on UniHub", text: message, url: referralLink });
    else openShare("https://www.instagram.com/");
  };

  return <section className="share-card">
    <div className="share-top">
      <div className="share-title"><span className="share-icon"><Sparkles size={20} /></span><div><span className="share-kicker">Your invitation is ready</span><h2>Invite your student circle</h2><p>Choose a platform, send your link, and watch your network grow.</p></div></div>
      <button className="device-share" onClick={nativeShare}><Share2 size={16} /> Share anywhere</button>
    </div>
    <div className="share-message"><span>Suggested message</span><p>{message}</p><button onClick={() => copyMessage()}><Copy size={14} /> Copy message</button></div>
    <div className="share-platforms">
      <button className="platform whatsapp" onClick={() => openShare(`https://wa.me/?text=${encodeURIComponent(message)}`)}><b>WA</b><span>WhatsApp</span></button>
      <button className="platform facebook" onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`)}><b>f</b><span>Facebook</span></button>
      <button className="platform linkedin" onClick={() => { copyMessage("Invite message copied for LinkedIn"); openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`); }}><b>in</b><span>LinkedIn</span></button>
      <button className="platform instagram" onClick={instagramShare}><b>◎</b><span>Instagram</span></button>
      <button className="platform telegram" onClick={() => openShare(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`)}><Send size={16} /><span>Telegram</span></button>
      <button className="platform more" onClick={() => copyMessage()}><Link2 size={16} /><span>Copy invite</span></button>
    </div>
    {notice && <p className="share-notice"><Check size={15} /> {notice}</p>}
    <style jsx>{`
      .share-card { position: relative; overflow: hidden; margin: 20px 0; padding: 25px; border: 1px solid #dfe8e5; border-radius: 16px; background: linear-gradient(125deg, #fff 5%, #f1faf6 100%); box-shadow: 0 3px 13px rgba(31,51,50,.035); }.share-card::after { content: ""; position: absolute; top: -78px; right: -52px; width: 190px; height: 190px; border: 34px solid rgba(11,107,95,.055); border-radius: 50%; }.share-top { position: relative; z-index: 1; display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }.share-title { display: flex; gap: 13px; }.share-icon { display: grid; place-items: center; width: 42px; height: 42px; color: #0b6b5f; border-radius: 13px; background: #dff3eb; }.share-kicker { display: block; margin-bottom: 4px; color: #0b6b5f; font-size: 10px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }.share-title h2 { margin: 0; color: #172a28; font: 800 22px/1.2 Poppins, Inter, sans-serif; letter-spacing: -.025em; }.share-title p { margin: 6px 0 0; color: #728181; font-size: 13px; }.device-share { display: inline-flex; align-items: center; gap: 7px; min-height: 37px; padding: 0 12px; color: #0b6b5f; border: 1px solid #b7d8cf; border-radius: 9px; background: rgba(255,255,255,.7); cursor: pointer; font-size: 12px; font-weight: 900; white-space: nowrap; }.share-message { position: relative; z-index: 1; margin: 22px 0 16px; padding: 13px 14px; border: 1px solid #e4ece9; border-radius: 10px; background: rgba(255,255,255,.74); }.share-message > span { color: #738181; font-size: 10px; font-weight: 900; letter-spacing: .09em; text-transform: uppercase; }.share-message p { display: -webkit-box; overflow: hidden; margin: 7px 0 9px; color: #344442; -webkit-box-orient: vertical; -webkit-line-clamp: 2; font-size: 12px; line-height: 1.55; }.share-message button { display: inline-flex; align-items: center; gap: 6px; padding: 0; color: #0b6b5f; border: 0; background: transparent; cursor: pointer; font-size: 11px; font-weight: 900; }.share-platforms { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(6, 1fr); gap: 9px; }.platform { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 75px; border: 1px solid #e1e9e6; border-radius: 11px; background: #fff; cursor: pointer; color: #42514f; transition: transform .15s, box-shadow .15s, border-color .15s; }.platform:hover { transform: translateY(-2px); border-color: #b6d9ce; box-shadow: 0 8px 15px rgba(11,107,95,.09); }.platform b { display: grid; place-items: center; width: 27px; height: 27px; border-radius: 8px; color: #fff; font-size: 14px; line-height: 1; }.platform span { font-size: 10px; font-weight: 800; }.whatsapp b { background: #20ba67; }.facebook b { background: #287be0; font-family: Arial; font-size: 19px; }.linkedin b { background: #1f78a8; font-size: 12px; }.instagram b { background: linear-gradient(135deg,#fa8748,#b52ca8); font-size: 19px; }.telegram { color: #208bbe; }.telegram svg { color: #2c9fd4; }.more { color: #0b6b5f; }.more svg { color: #0b6b5f; }.share-notice { display: flex; align-items: center; gap: 6px; margin: 13px 0 0; color: #13724d; font-size: 12px; font-weight: 700; }@media (max-width: 700px) { .share-card { padding: 20px; }.share-top { flex-direction: column; }.share-platforms { grid-template-columns: repeat(3, 1fr); }.device-share { width: 100%; justify-content: center; } }@media (max-width: 410px) { .share-platforms { grid-template-columns: repeat(2, 1fr); } }
    `}</style>
  </section>;
}
