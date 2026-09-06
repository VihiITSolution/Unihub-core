"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, CircleDollarSign, Clock3, Copy, Gift, Landmark, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AffiliateSharing } from "@/components/affiliate/AffiliateSharing";
import { affiliateService, type AffiliateStatus } from "@/services/affiliate.service";

const lkr = (value: number) => `LKR ${new Intl.NumberFormat("en-LK").format(value || 0)}`;

export default function AffiliatePage() {
  const { token } = useAuth();
  const [data, setData] = useState<AffiliateStatus | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState({ accountHolderName: "", bankName: "", branch: "", accountNumber: "" });

  const load = async () => {
    if (!token) return;
    try {
      const response = await affiliateService.getMe(token);
      if (response.success && response.data) setData(response.data);
      else setError(response.message || "Unable to load your affiliate dashboard");
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to load your affiliate dashboard");
    }
  };

  useEffect(() => { load(); }, [token]);

  const saveBank = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    try {
      await affiliateService.savePayoutProfile(token, bank);
      setNotice("Your payout details are saved securely.");
      await load();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Could not save bank details");
    }
  };

  const redeem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    try {
      await affiliateService.requestRedemption(token, Number(amount));
      setAmount("");
      setNotice("Your redemption request is with the UniHub team.");
      await load();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Could not submit redemption");
    }
  };

  const closeDate = useMemo(() => data?.campaign ? new Date(data.campaign.signupEndsAt).toLocaleDateString("en-LK", { day: "numeric", month: "long", year: "numeric" }) : "soon", [data]);

  if (error) return <main className="affiliate-shell"><section className="affiliate-error"><ShieldCheck size={28} /><h1>Affiliate programme</h1><p>{error}</p><button onClick={() => { setError(""); load(); }}>Try again</button></section></main>;
  if (!data) return <main className="affiliate-shell"><section className="affiliate-loading"><div className="affiliate-spinner" /> Loading your affiliate dashboard…</section></main>;

  const hasAvailableBalance = data.balances.available >= 5000;
  const referralCount = data.referrals.length;

  return <main className="affiliate-shell">
    <div className="affiliate-page">
      <section className="affiliate-hero">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <div className="hero-content">
          <span className="hero-eyebrow"><Gift size={14} /> UniHub student affiliate</span>
          <h1>Share UniHub.<br /><em>Earn together.</em></h1>
          <p>Invite students to a more connected university life. When they become active on UniHub, your rewards start adding up.</p>
          <div className="hero-actions">
            <button className="hero-copy" onClick={() => navigator.clipboard.writeText(data.account.referralLink).then(() => setNotice("Your referral link is copied."))}><Copy size={16} /> Copy referral link</button>
            <span>Sign-ups close <strong>{closeDate}</strong></span>
          </div>
        </div>
        <div className="hero-code-card">
          <span>Your unique code</span>
          <strong>{data.account.referralCode}</strong>
          <button onClick={() => navigator.clipboard.writeText(data.account.referralCode).then(() => setNotice("Your referral code is copied."))}>Copy code <Copy size={14} /></button>
          <div className="hero-code-line" />
          <small>Every verified student starts with their own shareable link.</small>
        </div>
      </section>

      {notice && <div className="affiliate-notice"><Check size={16} /> {notice}</div>}

      <section className="affiliate-stat-grid">
        <article className="affiliate-stat stat-primary"><span><CircleDollarSign size={19} /> Available now</span><strong>{lkr(data.balances.available)}</strong><small>{hasAvailableBalance ? "Ready to redeem" : `${lkr(5000 - data.balances.available)} to your first cash-out`}</small></article>
        <article className="affiliate-stat"><span><Clock3 size={18} /> In review</span><strong>{lkr(data.balances.reserved)}</strong><small>Requested or processing payout</small></article>
        <article className="affiliate-stat"><span><Users size={18} /> Your network</span><strong>{referralCount}</strong><small>{referralCount === 1 ? "student invited" : "students invited"}</small></article>
      </section>

      <AffiliateSharing referralLink={data.account.referralLink} />

      <section className="affiliate-content-grid">
        <div className="affiliate-main-column">
          <article className="affiliate-card reward-card">
            <div className="section-heading"><div><span className="section-kicker">Reward map</span><h2>More active students, better rewards</h2></div><span className="reward-badge">Current campaign</span></div>
            <div className="reward-steps">
              <div className="reward-tier tier-one"><span>01 — 20</span><strong>LKR 20</strong><small>per qualified student</small></div>
              <ChevronRight className="tier-arrow" size={21} />
              <div className="reward-tier tier-two"><span>21 — 100</span><strong>LKR 30</strong><small>per qualified student</small></div>
              <ChevronRight className="tier-arrow" size={21} />
              <div className="reward-tier tier-three"><span>101 +</span><strong>LKR 40</strong><small>per qualified student</small></div>
            </div>
            <p className="reward-note">Your reward is confirmed only when your referred student completes an approved UniHub activity.</p>
          </article>

          <article className="affiliate-card how-card">
            <div className="section-heading"><div><span className="section-kicker">How it works</span><h2>Three small steps</h2></div></div>
            <div className="how-steps">
              {[['01', 'Share your link', 'Send your personal invite to student friends.'], ['02', 'They get active', 'They verify their profile and add real value on UniHub.'], ['03', 'You earn rewards', 'We confirm the activity and add the reward to your balance.']].map(([number, title, copy]) => <div className="how-step" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></div>)}
            </div>
          </article>

          <article className="affiliate-card referral-card">
            <div className="section-heading"><div><span className="section-kicker">Activity</span><h2>Your referrals</h2></div><span className="referral-count">{referralCount} total</span></div>
            {data.referrals.length ? <div className="referral-list">{data.referrals.map((referral) => {
              const referred = referral.referred;
              const initials = `${referred?.firstName?.charAt(0) || ""}${referred?.lastName?.charAt(0) || ""}` || "S";
              const name = referred ? `${referred.firstName} ${referred.lastName}` : "Referred student";
              return <div className="referral-row" key={referral.id}><div className="referral-avatar">{initials}</div><div><strong>{name}</strong><p>{referral.activityType ? `${referral.activityType} activity` : "Invite accepted"} · {new Date(referral.createdAt).toLocaleDateString("en-LK")}</p></div><div className="referral-reward"><span className={`status-${referral.status}`}>{referral.status.replace("_", " ")}</span>{referral.rewardAmount && <strong>+{lkr(referral.rewardAmount)}</strong>}</div></div>;
            })}</div> : <div className="affiliate-empty"><Users size={25} /><h3>Your first reward is one invite away</h3><p>Share your link above with a student friend to get started.</p></div>}
          </article>
        </div>

        <aside className="affiliate-side-column">
          <article className="affiliate-card payout-card">
            <div className="payout-icon"><Landmark size={21} /></div>
            <span className="section-kicker">Cash out</span><h2>Turn rewards into LKR</h2>
            <p>Redeem from <strong>LKR 5,000</strong>. Your request is checked manually before bank transfer.</p>
            <div className="payout-meter"><div style={{ width: `${Math.min(100, (data.balances.available / 5000) * 100)}%` }} /></div>
            <small>{lkr(data.balances.available)} of LKR 5,000 available</small>
            <form onSubmit={redeem} className="redeem-form"><label>How much would you like to redeem?</label><div><span>LKR</span><input required min={5000} step={1} type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="5,000" /><button disabled={!hasAvailableBalance}>Request</button></div></form>
          </article>

          <article className="affiliate-card bank-card">
            <div className="section-heading compact"><div><span className="section-kicker">Payout setup</span><h2>Your bank details</h2></div><ShieldCheck size={20} /></div>
            {data.payoutProfile && <p className="saved-account"><Check size={14} /> Saved account · {data.payoutProfile.accountMask}</p>}
            <form onSubmit={saveBank} className="bank-form">
              <label>Account holder name<input required value={bank.accountHolderName} onChange={(event) => setBank({ ...bank, accountHolderName: event.target.value })} placeholder="Name on the account" /></label>
              <div className="bank-form-grid"><label>Bank name<input required value={bank.bankName} onChange={(event) => setBank({ ...bank, bankName: event.target.value })} placeholder="e.g. BOC" /></label><label>Branch<input required value={bank.branch} onChange={(event) => setBank({ ...bank, branch: event.target.value })} placeholder="Branch" /></label></div>
              <label>Account number<input required value={bank.accountNumber} onChange={(event) => setBank({ ...bank, accountNumber: event.target.value })} placeholder="Your account number" /></label>
              <button className="save-bank"><ShieldCheck size={16} /> Save securely</button>
            </form>
          </article>
        </aside>
      </section>
    </div>

    <style jsx>{`
      .affiliate-shell { min-height: 100%; background: #f5f7f8; padding: 34px 28px 56px; }
      .affiliate-page { max-width: 1180px; margin: 0 auto; }
      .affiliate-hero { position: relative; isolation: isolate; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(260px, .65fr); gap: 28px; padding: 42px 46px; border-radius: 22px; color: #fff; background: linear-gradient(118deg, #073f38 0%, #0b6b5f 55%, #07536a 100%); box-shadow: 0 18px 42px rgba(7, 63, 56, .22); }
      .hero-orb { position: absolute; z-index: -1; border-radius: 999px; filter: blur(2px); opacity: .35; }.hero-orb-one { width: 330px; height: 330px; background: #bfeecf; right: 23%; top: -205px; }.hero-orb-two { width: 220px; height: 220px; background: #f3bb57; right: -70px; bottom: -120px; }
      .hero-content { max-width: 650px; }.hero-eyebrow { display: inline-flex; align-items: center; gap: 7px; padding: 7px 10px; color: #daf4e8; border: 1px solid rgba(218,244,232,.3); border-radius: 999px; font-size: 12px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }.affiliate-hero h1 { margin: 18px 0 10px; font: 800 clamp(30px, 4vw, 48px)/1.04 Poppins, Inter, sans-serif; letter-spacing: -.04em; }.affiliate-hero h1 em { color: #bfeecf; font-style: normal; }.affiliate-hero p { max-width: 590px; margin: 0; color: #d6ebe7; font-size: 15px; line-height: 1.65; }.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-top: 25px; font-size: 12px; color: #d6ebe7; }.hero-actions strong { color: #fff; }.hero-copy { display: inline-flex; align-items: center; gap: 8px; padding: 11px 15px; color: #073f38; border: 0; border-radius: 9px; background: #fff; cursor: pointer; font-size: 13px; font-weight: 800; box-shadow: 0 8px 16px rgba(0,0,0,.12); }
      .hero-code-card { align-self: center; padding: 23px; border: 1px solid rgba(255,255,255,.24); border-radius: 16px; background: rgba(255,255,255,.11); backdrop-filter: blur(10px); }.hero-code-card span { display: block; color: #d6ebe7; font-size: 12px; font-weight: 700; }.hero-code-card strong { display: block; margin: 9px 0 15px; font-family: monospace; font-size: 21px; letter-spacing: .045em; }.hero-code-card button { display: inline-flex; align-items: center; gap: 7px; color: #fff; border: 0; background: transparent; padding: 0; cursor: pointer; font-size: 12px; font-weight: 800; }.hero-code-line { height: 1px; margin: 17px 0 13px; background: rgba(255,255,255,.2); }.hero-code-card small { color: #d6ebe7; line-height: 1.45; }
      .affiliate-notice { display: flex; align-items: center; gap: 8px; margin: 16px 0; padding: 11px 14px; color: #11623a; border: 1px solid #bae7ca; border-radius: 10px; background: #ecfdf3; font-size: 13px; font-weight: 700; }
      .affiliate-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }.affiliate-stat { padding: 20px 22px; border: 1px solid #e3e7e8; border-radius: 15px; background: #fff; box-shadow: 0 3px 13px rgba(31,51,50,.035); }.affiliate-stat span { display: flex; align-items: center; gap: 7px; color: #687477; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }.affiliate-stat strong { display: block; margin: 9px 0 4px; color: #142523; font: 800 27px/1 Poppins, Inter, sans-serif; letter-spacing: -.03em; }.affiliate-stat small { color: #849092; font-size: 12px; }.stat-primary { color: #fff; border-color: #0b6b5f; background: #0b6b5f; }.stat-primary span, .stat-primary strong, .stat-primary small { color: inherit; }.stat-primary small { color: #cde9df; }
      .affiliate-content-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(300px, .7fr); gap: 20px; margin-top: 20px; }.affiliate-main-column, .affiliate-side-column { min-width: 0; }.affiliate-card { margin-bottom: 20px; padding: 25px; border: 1px solid #e2e7e7; border-radius: 16px; background: #fff; box-shadow: 0 3px 13px rgba(31,51,50,.035); }.section-heading { display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; }.section-heading.compact { align-items: center; }.section-kicker { display: block; margin-bottom: 5px; color: #0b6b5f; font-size: 11px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }.section-heading h2, .payout-card h2 { margin: 0; color: #182625; font: 800 21px/1.25 Poppins, Inter, sans-serif; letter-spacing: -.025em; }.reward-badge, .referral-count { padding: 6px 9px; color: #0b6b5f; border-radius: 999px; background: #e8f6f1; font-size: 11px; font-weight: 800; white-space: nowrap; }
      .reward-steps { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 10px; align-items: center; margin-top: 23px; }.reward-tier { min-height: 126px; padding: 17px; border-radius: 12px; }.reward-tier span { display: block; font-size: 11px; font-weight: 900; letter-spacing: .08em; }.reward-tier strong { display: block; margin: 9px 0 3px; font: 800 25px/1 Poppins, Inter, sans-serif; }.reward-tier small { font-size: 11px; }.tier-one { color: #14615a; background: #eaf7f2; }.tier-two { color: #735016; background: #fff6df; }.tier-three { color: #71305d; background: #fff0f7; }.tier-arrow { color: #a4afb0; }.reward-note { margin: 17px 0 0; color: #728082; font-size: 12px; }
      .how-card { background: linear-gradient(130deg, #fff 0%, #fbfdfc 100%); }.how-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 19px; margin-top: 23px; }.how-step { position: relative; padding-top: 8px; }.how-step:not(:last-child)::after { content: ""; position: absolute; top: 22px; right: -12px; width: 7px; height: 7px; border-top: 1.5px solid #9abcb4; border-right: 1.5px solid #9abcb4; transform: rotate(45deg); }.how-step > span { display: inline-flex; align-items: center; justify-content: center; width: 31px; height: 31px; color: #0b6b5f; border-radius: 9px; background: #e8f6f1; font-size: 11px; font-weight: 900; }.how-step h3 { margin: 13px 0 6px; font-size: 14px; }.how-step p { margin: 0; color: #748082; font-size: 12px; line-height: 1.55; }
      .referral-row { display: flex; align-items: center; gap: 12px; padding: 15px 0; border-bottom: 1px solid #edf0f0; }.referral-row:last-child { border-bottom: 0; }.referral-avatar { display: grid; place-items: center; width: 37px; height: 37px; flex: 0 0 auto; color: #0b6b5f; border-radius: 12px; background: #e8f6f1; font-size: 12px; font-weight: 900; }.referral-row strong { display: block; color: #263533; font-size: 13px; }.referral-row p { margin: 4px 0 0; color: #849092; font-size: 11px; }.referral-reward { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; margin-left: auto; }.referral-reward > strong { color: #0b6b5f; }.referral-reward span { padding: 4px 7px; border-radius: 999px; background: #f1f3f3; color: #687477; font-size: 10px; font-weight: 800; text-transform: capitalize; }.referral-reward .status-available { color: #126a50; background: #e8f6f1; }.referral-reward .status-review, .referral-reward .status-held { color: #876114; background: #fff5dc; }.affiliate-empty { padding: 30px 15px 13px; text-align: center; }.affiliate-empty svg { color: #0b6b5f; }.affiliate-empty h3 { margin: 10px 0 5px; font-size: 15px; }.affiliate-empty p { margin: 0; color: #7b8889; font-size: 12px; }
      .payout-card { color: #fff; border: 0; background: linear-gradient(145deg, #1d2e3b, #0d5661); box-shadow: 0 12px 26px rgba(14,67,76,.15); }.payout-icon { display: grid; place-items: center; width: 40px; height: 40px; margin-bottom: 15px; border-radius: 12px; background: rgba(255,255,255,.14); }.payout-card .section-kicker { color: #a8e4d4; }.payout-card h2 { color: #fff; }.payout-card p { margin: 10px 0 18px; color: #d3e3e6; font-size: 13px; line-height: 1.55; }.payout-meter { height: 7px; overflow: hidden; border-radius: 99px; background: rgba(255,255,255,.18); }.payout-meter div { height: 100%; border-radius: inherit; background: #bfeecf; }.payout-card small { display: block; margin-top: 7px; color: #b8d3d7; font-size: 11px; }.redeem-form { margin-top: 20px; }.redeem-form label { display: block; margin-bottom: 7px; color: #d6e8e9; font-size: 11px; font-weight: 700; }.redeem-form > div { display: flex; align-items: center; overflow: hidden; border: 1px solid rgba(255,255,255,.25); border-radius: 9px; background: #fff; }.redeem-form span { padding-left: 10px; color: #738184; font-size: 12px; font-weight: 800; }.redeem-form input { width: 0; flex: 1; min-width: 0; padding: 10px 8px; color: #273333; border: 0; outline: 0; font-size: 13px; }.redeem-form button { align-self: stretch; padding: 0 11px; color: #073f38; border: 0; background: #bfeecf; cursor: pointer; font-size: 12px; font-weight: 900; }.redeem-form button:disabled { cursor: not-allowed; opacity: .55; }
      .bank-card > .section-heading > svg { color: #0b6b5f; }.saved-account { display: flex; align-items: center; gap: 5px; margin: 15px 0 0; padding: 8px 9px; color: #176449; border-radius: 7px; background: #edfbf3; font-size: 11px; font-weight: 700; }.bank-form { display: grid; gap: 13px; margin-top: 18px; }.bank-form label { display: grid; gap: 6px; color: #596667; font-size: 11px; font-weight: 800; }.bank-form input { width: 100%; padding: 10px 11px; color: #253333; border: 1px solid #dce3e3; border-radius: 8px; background: #fbfcfc; outline: none; font-size: 12px; }.bank-form input:focus { border-color: #0b6b5f; box-shadow: 0 0 0 3px rgba(11,107,95,.09); }.bank-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }.save-bank { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 40px; margin-top: 3px; color: #fff; border: 0; border-radius: 8px; background: #0b6b5f; cursor: pointer; font-size: 12px; font-weight: 900; }.save-bank:hover { background: #073f38; }
      .affiliate-loading, .affiliate-error { max-width: 440px; margin: 100px auto; padding: 35px; text-align: center; color: #637173; border: 1px solid #e2e7e7; border-radius: 18px; background: #fff; }.affiliate-error h1 { margin: 10px 0; color: #1a2928; }.affiliate-error p { font-size: 13px; }.affiliate-error button { padding: 9px 14px; color: #fff; border: 0; border-radius: 8px; background: #0b6b5f; cursor: pointer; }.affiliate-spinner { display: inline-block; width: 17px; height: 17px; margin-right: 9px; vertical-align: -3px; border: 2px solid #c9d5d3; border-top-color: #0b6b5f; border-radius: 50%; animation: spin .7s linear infinite; }@keyframes spin { to { transform: rotate(360deg); } }
      @media (max-width: 850px) { .affiliate-shell { padding: 20px 14px 42px; }.affiliate-hero { grid-template-columns: 1fr; padding: 31px 27px; }.hero-code-card { max-width: 360px; }.affiliate-content-grid { grid-template-columns: 1fr; }.affiliate-side-column { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }.affiliate-side-column .affiliate-card { margin-bottom: 0; }.bank-form-grid { grid-template-columns: 1fr; } }
      @media (max-width: 620px) { .affiliate-hero { padding: 27px 22px; border-radius: 16px; }.affiliate-hero h1 { font-size: 35px; }.affiliate-stat-grid, .affiliate-side-column, .how-steps { grid-template-columns: 1fr; }.affiliate-stat-grid { gap: 9px; }.affiliate-card { padding: 20px; }.reward-steps { grid-template-columns: 1fr; }.tier-arrow { display: none; }.reward-tier { min-height: auto; }.how-step:not(:last-child)::after { display: none; }.how-step { padding: 8px 0 15px; border-bottom: 1px solid #edf0f0; }.how-step:last-child { border-bottom: 0; }.section-heading { flex-direction: column; }.affiliate-side-column .affiliate-card { margin-bottom: 0; }.hero-actions { align-items: flex-start; flex-direction: column; gap: 12px; } }
    `}</style>
  </main>;
}
