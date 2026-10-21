import Link from "next/link";
import { ArrowRight } from "lucide-react";

const EXPLORE_AREAS = [
  { title: "Kuppi sessions", description: "Learn together", href: "/courses", image: "/unihub-discovery-triptych.webp", position: "left center", size: "300% 100%" },
  { title: "Marketplace", description: "Buy and sell", href: "/marketplace", image: "/unihub-discovery-triptych.webp", position: "center", size: "300% 100%" },
  { title: "Boarding", description: "Find your place", href: "/boarding", image: "/unihub-discovery-triptych.webp", position: "right center", size: "300% 100%" },
  { title: "Become a tutor", description: "Share what you know", href: "/student/become-tutor", image: "/library-study-group.webp", position: "center", size: "cover" },
  { title: "Student network", description: "Research & connect", href: "/wall", image: "/campus-walkway.webp", position: "center", size: "cover" },
];

export default function ExploreUniHub() {
  return (
    <section className="explore-unihub" aria-labelledby="explore-unihub-title">
      <div className="explore-unihub__inner">
        <div className="explore-unihub__intro" data-home-reveal>
          <span>Explore UniHub</span>
          <h2 id="explore-unihub-title">Everything for student life, in one place.</h2>
          <p>Study support, student deals, and a place to stay—made for university life.</p>
        </div>
        <div className="explore-unihub__cards">
          {EXPLORE_AREAS.map((area, index) => (
            <Link
              key={area.title}
              href={area.href}
              className="explore-unihub__card"
              data-home-reveal
              data-home-delay={String(index + 1)}
              data-home-hover
              style={{
                minHeight: 370,
                backgroundImage: `url('${area.image}')`,
                backgroundPosition: area.position,
                backgroundSize: area.size,
              }}
            >
              <div className="explore-unihub__card-label">
                <span>{area.description}</span>
                <strong>{area.title}</strong>
                <ArrowRight size={20} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`
        .explore-unihub { padding: 48px 0 36px; background: #fff; }
        .explore-unihub__inner { width: min(1180px, calc(100% - 40px)); margin: 0 auto; display: grid; grid-template-columns: .88fr 2.12fr; gap: 34px; align-items: center; }
        .explore-unihub__intro > span { color: var(--brand-dark); font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        .explore-unihub__intro h2 { margin: 8px 0 12px; font-size: clamp(27px, 3vw, 38px); line-height: 1.14; font-weight: 800; letter-spacing: -.025em; }
        .explore-unihub__intro p { max-width: 295px; margin: 0; color: var(--muted); font-size: 15px; line-height: 1.5; }
        .explore-unihub__cards { display: grid; grid-auto-columns: calc((100% - 32px) / 3); grid-auto-flow: column; gap: 16px; overflow-x: auto; padding: 2px 2px 12px; scroll-snap-type: x mandatory; scrollbar-width: thin; }
        .explore-unihub__card { position: relative; display: flex; align-items: flex-end; overflow: hidden; border-radius: 16px; box-shadow: 0 12px 22px rgba(15,23,42,.12); scroll-snap-align: start; text-decoration: none; transition: transform .2s ease, box-shadow .2s ease; }
        .explore-unihub__card::before { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 38%, rgba(4,35,31,.28) 100%); content: ""; }
        .explore-unihub__card:hover { transform: translateY(-5px); box-shadow: 0 20px 30px rgba(15,23,42,.18); }
        .explore-unihub__card-label { position: relative; display: grid; width: calc(100% - 24px); min-height: 92px; grid-template-columns: 1fr auto; grid-template-rows: auto auto; gap: 2px 12px; margin: 12px; padding: 17px; border-radius: 11px; background: rgba(255,255,255,.96); color: var(--ink); }
        .explore-unihub__card-label span { grid-column: 1; color: var(--muted); font-size: 12px; }
        .explore-unihub__card-label strong { grid-column: 1; font-size: 18px; line-height: 1.2; }
        .explore-unihub__card-label :global(svg) { grid-column: 2; grid-row: 1 / -1; align-self: center; color: var(--brand-dark); }
        .explore-unihub__card:focus-visible { outline: 3px solid var(--brand); outline-offset: 4px; }
        @media (max-width: 980px) { .explore-unihub__inner { grid-template-columns: 1fr; gap: 24px; } .explore-unihub__intro p { max-width: 560px; } .explore-unihub__cards { grid-auto-columns: calc((100% - 16px) / 2); } }
        @media (max-width: 640px) { .explore-unihub { padding: 36px 0 26px; } .explore-unihub__cards { grid-auto-columns: 86%; } .explore-unihub__card { min-height: 280px !important; } }
      `}</style>
    </section>
  );
}
