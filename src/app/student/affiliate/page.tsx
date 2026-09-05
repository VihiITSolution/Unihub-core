"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { affiliateService, type AffiliateStatus } from "@/services/affiliate.service";
import { AffiliateSharing } from "@/components/affiliate/AffiliateSharing";

const box: React.CSSProperties = { background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: 20, marginBottom: 16 };
export default function AffiliatePage() {
  const { token } = useAuth(); const [data, setData] = useState<AffiliateStatus | null>(null); const [error, setError] = useState(""); const [amount, setAmount] = useState(""); const [bank, setBank] = useState({ accountHolderName: "", bankName: "", branch: "", accountNumber: "" });
  const load = async () => { if (!token) return; try { const response = await affiliateService.getMe(token); if (response.success && response.data) setData(response.data); else setError(response.message || "Unable to load affiliate programme"); } catch (e: any) { setError(e?.response?.data?.message || "Unable to load affiliate programme"); } };
  useEffect(() => { load(); }, [token]);
  const saveBank = async (e: React.FormEvent) => { e.preventDefault(); if (!token) return; try { await affiliateService.savePayoutProfile(token, bank); await load(); } catch (e: any) { setError(e?.response?.data?.message || "Could not save bank details"); } };
  const redeem = async (e: React.FormEvent) => { e.preventDefault(); if (!token) return; try { await affiliateService.requestRedemption(token, Number(amount)); setAmount(""); await load(); } catch (e: any) { setError(e?.response?.data?.message || "Could not submit redemption"); } };
  if (error) return <main style={{ padding: 28 }}><h1>Affiliate programme</h1><p>{error}</p></main>;
  if (!data) return <main style={{ padding: 28 }}>Loading affiliate programme…</main>;
  return <main style={{ maxWidth: 960, margin: "0 auto", padding: 28 }}>
    <h1 style={{ marginTop: 0 }}>Student affiliate programme</h1>
    <AffiliateSharing referralLink={data.account.referralLink} />
    <div style={box}><strong>Your referral link</strong><p style={{ overflowWrap: "anywhere" }}>{data.account.referralLink}</p><button onClick={() => navigator.clipboard.writeText(data.account.referralLink)}>Copy link</button><p style={{ color: "var(--muted)" }}>Campaign sign-ups close {data.campaign ? new Date(data.campaign.signupEndsAt).toLocaleString() : "soon"}. A friend qualifies after a verified profile and an approved course/listing, or reviewed social contribution.</p></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
      {[['Available', data.balances.available], ['Reserved', data.balances.reserved], ['Paid', data.balances.paid]].map(([label, value]) => <div key={String(label)} style={box}><small>{label}</small><div style={{ fontSize: 24, fontWeight: 800 }}>LKR {value}</div></div>)}
    </div>
    <div style={box}><strong>Reward tiers</strong><p>#1–20: LKR 20 · #21–100: LKR 30 · #101+: LKR 40</p></div>
    <div style={box}><h2>Bank payout details</h2>{data.payoutProfile && <p>Saved account: {data.payoutProfile.accountMask}</p>}<form onSubmit={saveBank} style={{ display: "grid", gap: 10 }}>{Object.entries(bank).map(([key, value]) => <input key={key} required placeholder={key === "accountHolderName" ? "Account holder name" : key === "bankName" ? "Bank name" : key === "accountNumber" ? "Account number" : "Branch"} value={value} onChange={(e) => setBank({ ...bank, [key]: e.target.value })} />)}<button>Save bank details</button></form></div>
    <div style={box}><h2>Request redemption</h2><form onSubmit={redeem}><input required min={5000} step={1} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="LKR amount" /><button style={{ marginLeft: 8 }}>Submit request</button></form></div>
    <div style={box}><h2>Referrals</h2>{data.referrals.length ? data.referrals.map((r) => <p key={r.id}>{r.referred.firstName} {r.referred.lastName} — {r.status}{r.rewardAmount ? ` · LKR ${r.rewardAmount}` : ""}</p>) : <p>No referrals yet.</p>}</div>
  </main>;
}
