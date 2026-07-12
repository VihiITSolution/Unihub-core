"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { boardingService } from "@/services/boarding.service";
import { universityService, type University } from "@/services/university.service";
import { HoverCard } from "@/components/ui";
import type { BoardingPlace, BoardingPlaceFilters, RoomType, GenderPreference } from "@/types";

const ROOM_TYPES: { value: RoomType | ""; label: string }[] = [
  { value: "", label: "Any room type" },
  { value: "single", label: "Single room" },
  { value: "shared", label: "Shared room" },
  { value: "apartment", label: "Apartment" },
  { value: "annex", label: "Annex" },
];

const GENDER_OPTIONS: { value: GenderPreference | ""; label: string }[] = [
  { value: "", label: "Any gender" },
  { value: "any", label: "Mixed / Any" },
  { value: "male", label: "Male only" },
  { value: "female", label: "Female only" },
];

function roomTypeLabel(r: string) {
  return ROOM_TYPES.find((x) => x.value === r)?.label ?? r;
}

function genderLabel(g: string) {
  switch (g) {
    case "male": return "Male Only";
    case "female": return "Female Only";
    default: return "Any";
  }
}

const GUIDE_CARDS = [
  { title: "Distance", body: "Know walking time, bus routes, night travel, and how long it takes after evening lectures." },
  { title: "Study comfort", body: "Check desk space, noise, Wi-Fi, plug points, lighting, and whether group study is allowed." },
  { title: "Real monthly cost", body: "Compare rent with electricity, water, meals, laundry, deposit, and transport costs." },
  { title: "Safety and rules", body: "See visitor rules, curfew, separate entrance, landlord contact, and student reviews." },
];

function PlaceCard({ place }: { place: BoardingPlace }) {
  const descLines = (place.description || "")
    .split(/[.\n]/).map((s) => s.trim()).filter((s) => s.length > 10).slice(0, 3);

  const cardTrigger = (
    <Link href={`/boarding/${place.id}`} style={{ textDecoration: "none", display: "block" }}>
      <article
        style={{
          border: "1px solid var(--line)", borderRadius: 6,
          overflow: "hidden", background: "var(--white)",
          transition: "transform .18s, box-shadow .18s", cursor: "pointer",
        }}
        className="course-card-hover"
      >
        <div style={{ width: "100%", aspectRatio: "16/10", background: "var(--soft)", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
          {place.images && place.images.length > 0 ? (
            <img src={place.images[0]} alt={place.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75"/></svg>
          )}
          <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
            <span style={{ padding: "4px 8px", background: "rgba(255,255,255,.92)", color: "var(--ink)", fontSize: 12, fontWeight: 800, borderRadius: 3 }}>
              {roomTypeLabel(place.roomType)}
            </span>
            {place.genderPreference !== "any" && (
              <span style={{ padding: "4px 8px", background: "rgba(255,255,255,.92)", color: "var(--ink)", fontSize: 12, fontWeight: 800, borderRadius: 3 }}>
                {genderLabel(place.genderPreference)}
              </span>
            )}
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>{place.title}</h3>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
            {place.city}{place.district ? `, ${place.district}` : ""}
            {place.nearestUniversity && ` · Near ${place.nearestUniversity}`}
          </p>
          {place.amenities && place.amenities.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {place.amenities.slice(0, 3).map((a) => (
                <span key={a} style={{ padding: "5px 8px", background: "#e8f6f1", color: "var(--brand-dark)", fontSize: 12, fontWeight: 800 }}>
                  {a}
                </span>
              ))}
              {place.amenities.length > 3 && (
                <span style={{ padding: "5px 8px", background: "var(--soft)", color: "var(--muted)", fontSize: 12 }}>
                  +{place.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 14, fontWeight: 800 }}>
            <span>Rs. {Number(place.monthlyRent).toLocaleString()}<span style={{ fontWeight: 400, fontSize: 12, color: "var(--muted)" }}>/mo</span></span>
            <span style={{ fontSize: 12, fontWeight: 800, color: place.availableSlots > 0 ? "var(--brand)" : "#dc2626" }}>
              {place.availableSlots > 0 ? `${place.availableSlots} slot${place.availableSlots !== 1 ? "s" : ""} available` : "Full"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );

  const popup = (
    <div style={{ padding: 18 }}>
      {/* Room type + gender badges */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ padding: "3px 8px", background: "#e8f6f1", color: "var(--brand-dark)", fontSize: 11, fontWeight: 700, borderRadius: 3 }}>
          {roomTypeLabel(place.roomType)}
        </span>
        {place.genderPreference !== "any" && (
          <span style={{ padding: "3px 8px", background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, borderRadius: 3 }}>
            {genderLabel(place.genderPreference)}
          </span>
        )}
        <span style={{ padding: "3px 8px", background: place.availableSlots > 0 ? "#dcfce7" : "#fee2e2", color: place.availableSlots > 0 ? "#166534" : "#dc2626", fontSize: 11, fontWeight: 700, borderRadius: 3 }}>
          {place.availableSlots > 0 ? `${place.availableSlots} slot(s) available` : "Fully booked"}
        </span>
      </div>

      <h4 style={{ margin: "0 0 5px", fontSize: 15, fontWeight: 800, lineHeight: 1.3, color: "#111" }}>
        {place.title}
      </h4>
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>
        📍 {place.city}{place.district ? `, ${place.district}` : ""}
        {place.nearestUniversity ? ` · Near ${place.nearestUniversity}` : ""}
      </p>

      {/* Amenities */}
      {place.amenities && place.amenities.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {place.amenities.slice(0, 5).map((a) => (
            <span key={a} style={{ padding: "3px 7px", background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 600, borderRadius: 3 }}>
              {a}
            </span>
          ))}
        </div>
      )}

      {/* Description bullets */}
      {descLines.length > 0 && (
        <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none" }}>
          {descLines.map((line, i) => (
            <li key={i} style={{ display: "flex", gap: 7, fontSize: 12.5, color: "#374151", marginBottom: 5 }}>
              <span style={{ color: "var(--brand)", flexShrink: 0 }}>✓</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 14 }}>
        Rs. {Number(place.monthlyRent).toLocaleString()}
        <span style={{ fontSize: 13, fontWeight: 400, color: "#64748b" }}> /month</span>
      </div>

      <Link
        href={`/boarding/${place.id}`}
        style={{
          display: "block", width: "100%", textAlign: "center",
          padding: "11px 0",
          background: "var(--brand)", color: "#fff",
          fontWeight: 800, fontSize: 14, borderRadius: 5,
          textDecoration: "none",
        }}
      >
        View Details
      </Link>
    </div>
  );

  return <HoverCard trigger={cardTrigger} popup={popup} />;
}

export default function BoardingPage() {
  const [places, setPlaces] = useState<BoardingPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<University[]>([]);
  const [showCustomUniversity, setShowCustomUniversity] = useState(false);
  const [universityInput, setUniversityInput] = useState("");
  const [university, setUniversity] = useState("");
  const [roomType, setRoomType] = useState<RoomType | "">("");
  const [genderPreference, setGenderPreference] = useState<GenderPreference | "">("");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const filters: BoardingPlaceFilters = { page, limit: LIMIT };
      if (university) filters.nearestUniversity = university;
      if (roomType) filters.roomType = roomType;
      if (genderPreference) filters.genderPreference = genderPreference;
      if (minRent) filters.minRent = Number(minRent);
      if (maxRent) filters.maxRent = Number(maxRent);
      const result = await boardingService.getListings(filters) as any;
      const placesArr: BoardingPlace[] = result.places ?? [];
      const pagination = result.pagination ?? {};
      setPlaces(placesArr);
      setTotalPages(pagination.pages ?? 1);
      setTotal(pagination.total ?? 0);
    } catch (err) {
      console.error("Failed to load boarding places:", err);
    } finally {
      setLoading(false);
    }
  }, [university, roomType, genderPreference, minRent, maxRent, page]);

  useEffect(() => { loadPlaces(); }, [loadPlaces]);

  useEffect(() => {
    universityService
      .getUniversities()
      .then((res) => setUniversities(res.data?.universities ?? []))
      .catch((err) => console.error("Failed to load universities:", err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUniversity(universityInput);
    setPage(1);
  };

  const clearFilters = () => {
    setUniversity(""); setUniversityInput(""); setShowCustomUniversity(false); setRoomType("");
    setGenderPreference(""); setMinRent(""); setMaxRent(""); setPage(1);
  };

  const hasActiveFilters = university || roomType || genderPreference || minRent || maxRent;

  return (
    <div style={{ minHeight: "100vh", background: "var(--white)" }}>
      {/* Hero */}
      <section
        style={{
          background: `
            linear-gradient(90deg, rgba(7,63,56,.95), rgba(7,63,56,.72)),
            url("/campus-walkway.png") center/cover
          `,
          color: "#fff",
        }}
      >
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
          <div style={{ maxWidth: 690, padding: "54px 0" }}>
            <p style={{ margin: "0 0 10px", color: "#a9f0df", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              UniHub Boarding
            </p>
            <h1 style={{ margin: 0, fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.02, fontWeight: 800 }}>
              Find a safe student place before semester starts.
            </h1>
            <p style={{ margin: "16px 0 24px", maxWidth: 610, fontSize: 17, lineHeight: 1.45, color: "#d7f4ec" }}>
              Search boarding houses, hostels, annexes, shared rooms, and private rooms near Sri Lankan universities. Compare walking distance, rent, food options, Wi-Fi, study space, and house rules before you call.
            </p>
            <a
              href="#rooms"
              style={{
                minHeight: 42, display: "inline-grid", placeItems: "center",
                padding: "0 20px", border: "1px solid #fff",
                background: "#fff", color: "var(--ink)",
                fontSize: 14, fontWeight: 800, textDecoration: "none",
              }}
            >
              Browse nearby rooms
            </a>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="rooms" style={{ padding: "34px 0" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 800 }}>Accommodation near universities</h2>
          <p style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.45 }}>
            Students care about more than rent. Distance, transport, safety, noise level, water, Wi-Fi, and whether the room is good for studying all matter.
          </p>

          {/* Filter row */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1.2fr repeat(3, 1fr)", gap: 10, margin: "0 0 20px" }}
            className="boarding-filter-grid"
          >
            {!showCustomUniversity ? (
              <select
                value={university}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setShowCustomUniversity(true);
                    setUniversity("");
                    setUniversityInput("");
                  } else {
                    setUniversity(e.target.value);
                    setPage(1);
                  }
                }}
                style={{ height: 44, padding: "0 12px", border: "1px solid var(--line)", background: "var(--white)", fontSize: 14, cursor: "pointer" }}
              >
                <option value="">All universities</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.name}>{uni.name}</option>
                ))}
                <option value="__custom__">Search manually…</option>
              </select>
            ) : (
              <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
                <input
                  type="search"
                  placeholder="Search area or university..."
                  value={universityInput}
                  onChange={(e) => setUniversityInput(e.target.value)}
                  style={{ flex: 1, minWidth: 0, height: 44, padding: "0 12px", border: "1px solid var(--line)", background: "var(--white)", fontSize: 14, outline: "none" }}
                />
                <button
                  type="button"
                  onClick={() => { setShowCustomUniversity(false); setUniversity(""); setUniversityInput(""); setPage(1); }}
                  style={{ height: 44, padding: "0 10px", border: "1px solid var(--line)", background: "var(--white)", fontSize: 13, cursor: "pointer" }}
                >
                  ← Back
                </button>
              </form>
            )}
            <select
              value={roomType}
              onChange={(e) => { setRoomType(e.target.value as RoomType | ""); setPage(1); }}
              style={{ height: 44, padding: "0 12px", border: "1px solid var(--line)", background: "var(--white)", fontSize: 14, cursor: "pointer" }}
            >
              {ROOM_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select
              value={genderPreference}
              onChange={(e) => { setGenderPreference(e.target.value as GenderPreference | ""); setPage(1); }}
              style={{ height: 44, padding: "0 12px", border: "1px solid var(--line)", background: "var(--white)", fontSize: 14, cursor: "pointer" }}
            >
              {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            <select
              onChange={(e) => {
                const v = e.target.value;
                if (v === "under15") { setMinRent(""); setMaxRent("15000"); }
                else if (v === "15to25") { setMinRent("15000"); setMaxRent("25000"); }
                else if (v === "over25") { setMinRent("25000"); setMaxRent(""); }
                else { setMinRent(""); setMaxRent(""); }
                setPage(1);
              }}
              style={{ height: 44, padding: "0 12px", border: "1px solid var(--line)", background: "var(--white)", fontSize: 14, cursor: "pointer" }}
            >
              <option value="">Any budget</option>
              <option value="under15">Under LKR 15,000</option>
              <option value="15to25">LKR 15,000 – 25,000</option>
              <option value="over25">LKR 25,000+</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{ marginBottom: 16, fontSize: 13, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}
            >
              Clear all filters
            </button>
          )}

          <div style={{ display: "flex", gap: 24 }} className="boarding-layout">
            {/* Sidebar CTA */}
            <aside style={{ width: 220, flexShrink: 0 }} className="boarding-sidebar">
              <div style={{ padding: 18, background: "#fff8ec", border: "1px solid #f0dfc4", borderRadius: 6 }}>
                <p style={{ margin: "0 0 6px", fontWeight: 800, color: "#92400e", fontSize: 15 }}>Have a place to rent?</p>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: "#b45309", lineHeight: 1.4 }}>
                  List your boarding place free for 3 months during our promotional period.
                </p>
                <Link
                  href="/vendor/boarding/create"
                  style={{
                    display: "block", textAlign: "center", height: 38, lineHeight: "38px",
                    background: "var(--ink)", color: "#fff", fontSize: 13, fontWeight: 800,
                  }}
                >
                  List room
                </Link>
              </div>
            </aside>

            {/* Results */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {!loading && (
                <p style={{ margin: "0 0 14px", color: "var(--muted)", fontSize: 13 }}>
                  {total === 0 ? "No listings found" : `${total} listing${total !== 1 ? "s" : ""} found`}
                  {hasActiveFilters && " — filtered"}
                </p>
              )}

              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="boarding-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
                      <div className="skeleton" style={{ width: "100%", aspectRatio: "16/10" }} />
                      <div style={{ padding: 16 }}>
                        <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 12, width: "50%", marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 14, width: "35%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : places.length === 0 ? (
                <div style={{ padding: 48, border: "1px solid var(--line)", borderRadius: 6, textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
                  <h3 style={{ margin: "0 0 8px" }}>No listings found</h3>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    {hasActiveFilters ? "Try adjusting your filters." : "No boarding places are currently available."}
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="boarding-grid">
                    {places.map((place) => <PlaceCard key={place.id} place={place} />)}
                  </div>

                  {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ height: 38, padding: "0 14px", border: "1px solid var(--line)", background: "var(--white)", cursor: "pointer", fontSize: 14, fontWeight: 800 }}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                        .map((n) => (
                          <button
                            key={n}
                            onClick={() => setPage(n)}
                            style={{
                              width: 36, height: 38,
                              border: `1px solid ${page === n ? "var(--brand)" : "var(--line)"}`,
                              background: page === n ? "var(--brand)" : "var(--white)",
                              color: page === n ? "#fff" : "var(--ink)",
                              fontSize: 14, fontWeight: 800, cursor: "pointer",
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{ height: 38, padding: "0 14px", border: "1px solid var(--line)", background: "var(--white)", cursor: "pointer", fontSize: 14, fontWeight: 800 }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Student guide section */}
      <section style={{ background: "#fff8ec", borderTop: "1px solid #f0dfc4", borderBottom: "1px solid #f0dfc4", padding: "34px 0" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 800 }}>What students should check before moving in</h2>
          <p style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.45 }}>
            The right boarding place can decide how your semester feels. UniHub makes the boring details easier to compare.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="guide-grid-responsive">
            {GUIDE_CARDS.map((g) => (
              <article key={g.title} style={{ padding: 18, border: "1px solid #ead9bd", borderRadius: 6, background: "var(--white)" }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>{g.title}</h3>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.45 }}>{g.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 980px) {
          .boarding-filter-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .boarding-layout { flex-direction: column !important; }
          .boarding-sidebar { width: 100% !important; }
          .boarding-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .guide-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .boarding-filter-grid { grid-template-columns: 1fr !important; }
          .boarding-grid { grid-template-columns: 1fr !important; }
          .guide-grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
