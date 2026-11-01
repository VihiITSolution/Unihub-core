import Link from "next/link";

type GuideStep = { title: string; text: string };
type GuideQuestion = { question: string; answer: string };

export function LiveSessionGuide({ audience, intro, steps, questions }: {
  audience: "student" | "tutor";
  intro: string;
  steps: GuideStep[];
  questions: GuideQuestion[];
}) {
  const isStudent = audience === "student";
  const otherGuide = isStudent ? "tutor" : "student";
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/help" className="text-sm font-semibold text-primary-700 hover:underline">← Help &amp; Support Center</Link>
      <header className="mt-5 rounded-2xl bg-slate-950 px-6 py-8 text-white sm:px-9">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Live session guide · {audience}</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{isStudent ? "Join a live session" : "Host a live session"}</h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-200">{intro}</p>
        <Link href={isStudent ? "/student/live-sessions" : "/tutor/live-sessions"} className="mt-6 inline-block rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100">{isStudent ? "Browse live sessions" : "Open my live sessions"}</Link>
      </header>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="space-y-8">
          <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <picture>
              <source media="(max-width: 639px)" srcSet={`/help/live-sessions/${audience}-mobile.png`} />
              {/* Screenshots show the real UniHub interface populated with fictional demo data. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/help/live-sessions/${audience}-desktop.png`} alt={isStudent ? "Example live sessions page with My sessions, Enrol, Join session and Watch recording controls highlighted." : "Example tutor live sessions page with Start in Teams, Copy referral invite and Enrollments highlighted."} className="block h-auto w-full" loading="lazy" />
            </picture>
            <figcaption className="border-t border-slate-200 px-4 py-3 text-sm leading-6 text-slate-600">Example screen with demo details. {isStudent ? "Highlighted controls help you find your sessions, enrol, join and watch recordings." : "Highlighted controls let you start Teams, share an invitation and see enrolments."} Your screen may vary with the session status.</figcaption>
          </figure>
          <section aria-labelledby="steps-heading">
            <h2 id="steps-heading" className="text-2xl font-bold text-slate-900">Step by step</h2>
            <ol className="mt-4 space-y-4">
              {steps.map((step, index) => <li key={step.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">{index + 1}</span><div><h3 className="text-lg font-bold text-slate-900">{step.title}</h3><p className="mt-2 leading-7 text-slate-600">{step.text}</p></div></div></li>)}
            </ol>
          </section>
          <section aria-labelledby="troubleshooting-heading">
            <h2 id="troubleshooting-heading" className="text-2xl font-bold text-slate-900">Troubleshooting</h2>
            <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-5">
              {questions.map((item) => <details key={item.question} className="py-4"><summary className="cursor-pointer font-semibold text-slate-900">{item.question}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p></details>)}
            </div>
            <p className="mt-4 text-sm text-slate-600">Still need help? <Link href="/help#support-ticket" className="font-semibold text-primary-700 underline">Contact UniHub support</Link> and include the session title and any error message.</p>
          </section>
        </div>
        <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="font-bold text-slate-900">Useful links</h2>
          <ul className="mt-4 space-y-3 text-sm font-medium text-primary-700">
            <li><Link className="hover:underline" href={isStudent ? "/student/my-sessions" : "/tutor/live-sessions/create"}>{isStudent ? "My sessions" : "Request a session"}</Link></li>
            <li><Link className="hover:underline" href={`/help/live-sessions/${otherGuide}`}>{isStudent ? "Tutor guide" : "Student guide"}</Link></li>
            <li><Link className="hover:underline" href="/help#support-ticket">Contact support</Link></li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
