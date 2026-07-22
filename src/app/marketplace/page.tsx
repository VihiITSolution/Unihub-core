"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";
import { HoverCard } from "@/components/ui";
import type { MarketplaceItem } from "@/types";
import type { MarketplaceFilters } from "@/services/marketplace.service";

const CATEGORIES = [
  { value: "", label: "All items" },
  { value: "books", label: "Textbooks" },
  { value: "electronics", label: "Electronics" },
  { value: "stationery", label: "Lab & Medical" },
  { value: "furniture", label: "Hostel room" },
  { value: "sports", label: "Transport" },
  { value: "other", label: "Other" },
];

const CONDITIONS = [
  { value: "", label: "Any Condition" },
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

function conditionLabel(c: string) {
  return CONDITIONS.find((x) => x.value === c)?.label ?? c;
}

const SELLER_STEPS = [
  { title: "1. List in minutes", body: "Add condition, price, campus area, photos, and whether it is used or new." },
  { title: "2. Meet near campus", body: "Use university gates, libraries, cafes, or safe public spots students already know." },
  { title: "3. Keep money in student hands", body: "Make campus life cheaper while reducing waste from one-semester items." },
];

function ItemCard({ item }: { item: MarketplaceItem }) {
  const sellerName = item.seller?.vendorProfile?.shopName
    || (item.seller ? `${item.seller.firstName} ${item.seller.lastName}` : "Seller");

  const descSnippet = (item.description || "")
    .split(/[.\n]/).map((s) => s.trim()).filter((s) => s.length > 10).slice(0, 3);

  const cardTrigger = (
    <Link href={`/marketplace/${item.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <article
        style={{
          border: "1px solid var(--line)", borderRadius: 6,
          overflow: "hidden", background: "var(--white)",
          transition: "transform .18s, box-shadow .18s", cursor: "pointer",
          height: "100%", display: "flex", flexDirection: "column",
        }}
        className="course-card-hover"
      >
        <div style={{ width: "100%", aspectRatio: "16/10", display: "grid", placeItems: "center", background: "var(--soft)", overflow: "hidden" }}>
          {item.images && item.images.length > 0 ? (
            <img src={item.images[0]} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg>
          )}
        </div>
        <div style={{ padding: 14, display: "flex", flexDirection: "column", flex: 1 }}>
          <h3 style={{ minHeight: 44, margin: "0 0 6px", fontSize: 16, lineHeight: 1.25, fontWeight: 800, color: "var(--ink)" }}>
            {item.title}
          </h3>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
            {item.category} · {conditionLabel(item.condition)}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 12, fontWeight: 800 }}>
            <span>Rs. {Number(item.price).toLocaleString()}</span>
            <span style={{ padding: "5px 8px", background: item.stock > 0 ? "#e8f6f1" : "#fee2e2", color: item.stock > 0 ? "var(--brand-dark)" : "#dc2626", fontSize: 12, fontWeight: 800 }}>
              {item.stock > 0 ? "Available" : "Sold"}
            </span>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--muted)" }}>by {sellerName}</p>
          <button
            type="button"
            style={{
              marginTop: "auto", paddingTop: 12, background: "none", border: "none",
              color: "var(--brand)", fontWeight: 700, fontSize: 13, textAlign: "left",
              cursor: "pointer",
            }}
          >
            View Details →
          </button>
        </div>
      </article>
    </Link>
  );

  const popup = (
    <div style={{ padding: 18 }}>
      {/* Condition + category badges */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ padding: "3px 8px", background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 700, borderRadius: 3 }}>
          {conditionLabel(item.condition)}
        </span>
        {item.category && (
          <span style={{ padding: "3px 8px", background: "#e8f6f1", color: "var(--brand-dark)", fontSize: 11, fontWeight: 700, borderRadius: 3 }}>
            {item.category}
          </span>
        )}
        <span style={{ padding: "3px 8px", background: item.stock > 0 ? "#dcfce7" : "#fee2e2", color: item.stock > 0 ? "#166534" : "#dc2626", fontSize: 11, fontWeight: 700, borderRadius: 3 }}>
          {item.stock > 0 ? `${item.stock} in stock` : "Sold out"}
        </span>
      </div>

      <h4 style={{ margin: "0 0 5px", fontSize: 15, fontWeight: 800, lineHeight: 1.3, color: "#111" }}>
        {item.title}
      </h4>
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>Sold by {sellerName}</p>

      {/* Description bullets */}
      {descSnippet.length > 0 && (
        <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none" }}>
          {descSnippet.map((line, i) => (
            <li key={i} style={{ display: "flex", gap: 7, fontSize: 12.5, color: "#374151", marginBottom: 5 }}>
              <span style={{ color: "var(--brand)", flexShrink: 0 }}>✓</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 14 }}>
        Rs. {Number(item.price).toLocaleString()}
      </div>

      <Link
        href={`/marketplace/${item.id}`}
        style={{
          display: "block", width: "100%", textAlign: "center",
          padding: "11px 0",
          background: "var(--brand)", color: "#fff",
          fontWeight: 800, fontSize: 14, borderRadius: 5,
          textDecoration: "none",
        }}
      >
        View Listing
      </Link>
    </div>
  );

  return <HoverCard trigger={cardTrigger} popup={popup} />;
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const showVendorCTA = !user?.isVendorProfileComplete;

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const filters: MarketplaceFilters = { page, limit: LIMIT };
      if (search) filters.search = search;
      if (category) filters.category = category;
      if (condition) filters.condition = condition;
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);
      const response = await marketplaceService.getItems(filters);
      if (response.success && response.data) {
        setItems(response.data as unknown as MarketplaceItem[]);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotal(response.pagination.total);
        }
      }
    } catch (err) {
      console.error("Failed to load marketplace items:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, condition, minPrice, maxPrice, page]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(""); setSearchInput(""); setCategory("");
    setCondition(""); setMinPrice(""); setMaxPrice(""); setPage(1);
  };

  const hasActiveFilters = search || category || condition || minPrice || maxPrice;

  return (
    <div style={{ minHeight: "100vh", background: "var(--white)" }}>
      {/* Hero */}
      <section style={{ background: "#073f38", color: "#fff" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
          <div
            style={{ minHeight: 320, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, alignItems: "center", padding: "34px 0" }}
            className="marketplace-hero-grid"
          >
            <div>
              <p style={{ margin: "0 0 10px", color: "#a9f0df", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Student Marketplace
              </p>
              <h1 style={{ margin: 0, fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.02, fontWeight: 800 }}>
                Buy it for less. Sell it before it gathers dust.
              </h1>
              <p style={{ margin: "16px 0 24px", maxWidth: 480, fontSize: 17, lineHeight: 1.45, color: "#d7f4ec" }}>
                UniHub Marketplace helps university students buy and sell used or new items for campus life: books, laptops, calculators, lab coats, drawing boards, bicycles, hostel furniture, and everything in between.
              </p>
              <a
                href="#listings"
                style={{
                  minHeight: 42, display: "inline-grid", placeItems: "center",
                  padding: "0 20px", border: "1px solid #fff",
                  background: "#fff", color: "var(--ink)",
                  fontSize: 14, fontWeight: 800, textDecoration: "none",
                }}
              >
                Browse student deals
              </a>
            </div>
            <img
              style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", borderRadius: 6, boxShadow: "var(--shadow)" }}
              src="/library-study-group.png"
              alt="Sri Lankan university students buying and selling items"
            />
          </div>
        </div>
      </section>

      {/* Become a Vendor banner — shown to non-vendors only */}
      {showVendorCTA && (
        <section style={{ background: "linear-gradient(90deg,#1c1c1c,#2d2400)", borderBottom: "1px solid rgba(245,158,11,.25)" }}>
          <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", padding: "22px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg,#f59e0b,#d97706)",
                display: "grid", placeItems: "center",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L9.568 3z"/>
                  <path d="M6 6h.008v.008H6V6z"/>
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>
                  Start selling on UniHub Marketplace
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#d1d5db" }}>
                  List your books, electronics, lab gear, and more — free for 3 months.
                </p>
              </div>
            </div>
            <Link
              href="/student/become-vendor"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                height: 42, padding: "0 20px",
                background: "linear-gradient(135deg,#f59e0b,#d97706)",
                color: "#fff", fontWeight: 800, fontSize: 14,
                borderRadius: 6, textDecoration: "none", flexShrink: 0,
              }}
            >
              Become a Vendor
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Listings */}
      <section id="listings" style={{ padding: "34px 0" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 800 }}>Useful things students actually search for</h2>
          <p style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.45 }}>
            Filter by the things you need for lectures, labs, hostel life, commuting, assignments, or internship season.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div
              style={{
                flex: 1, display: "flex", alignItems: "center", gap: 10,
                height: 46, padding: "0 16px",
                border: "1px solid var(--ink)", borderRadius: 999, background: "var(--soft)",
              }}
            >
              <span style={{ color: "var(--muted)", fontSize: 14 }}>Find</span>
              <input
                type="search"
                placeholder="Laptop, books, calculator, lab coat..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: 14, color: "var(--ink)" }}
              />
            </div>
            <button
              type="submit"
              style={{ height: 46, padding: "0 20px", background: "var(--ink)", color: "#fff", border: "none", fontWeight: 800, cursor: "pointer" }}
            >
              Search
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                style={{ height: 46, padding: "0 14px", border: "1px solid var(--line)", background: "var(--white)", fontSize: 14, cursor: "pointer" }}
              >
                Clear
              </button>
            )}
          </form>

          {/* Category chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => { setCategory(c.value); setPage(1); }}
                style={{
                  minHeight: 36, padding: "0 12px",
                  border: `1px solid ${category === c.value ? "var(--brand)" : "var(--line)"}`,
                  borderRadius: 999,
                  background: category === c.value ? "#e8f6f1" : "var(--white)",
                  color: category === c.value ? "var(--brand-dark)" : "var(--ink)",
                  fontSize: 13, fontWeight: 800, cursor: "pointer",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 24 }} className="marketplace-layout">
            {/* Sidebar */}
            <aside style={{ width: 220, flexShrink: 0 }} className="marketplace-sidebar">
              <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
                Condition
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => { setCondition(c.value); setPage(1); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "8px 10px", border: "none", cursor: "pointer",
                      background: condition === c.value ? "#e8f6f1" : "transparent",
                      color: condition === c.value ? "var(--brand-dark)" : "var(--ink)",
                      fontWeight: condition === c.value ? 800 : 400, fontSize: 14, borderRadius: 4,
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
                Price Range (Rs.)
              </h4>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="number" min="0" placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  style={{ width: "100%", height: 38, padding: "0 10px", border: "1px solid var(--line)", fontSize: 14, outline: "none" }}
                />
                <span style={{ color: "var(--muted)" }}>–</span>
                <input
                  type="number" min="0" placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  style={{ width: "100%", height: 38, padding: "0 10px", border: "1px solid var(--line)", fontSize: 14, outline: "none" }}
                />
              </div>

              <div style={{ marginTop: 16, padding: 16, background: "#fff8ec", border: "1px solid #f0dfc4", borderRadius: 6 }}>
                <p style={{ margin: "0 0 6px", fontWeight: 800, color: "#92400e", fontSize: 14 }}>Have something to sell?</p>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "#b45309", lineHeight: 1.4 }}>
                  Post your ad free for 3 months.
                </p>
                <Link
                  href="/vendor/listings/create"
                  style={{
                    display: "block", textAlign: "center", height: 36, lineHeight: "36px",
                    background: "var(--ink)", color: "#fff", fontSize: 13, fontWeight: 800,
                  }}
                >
                  Sell item
                </Link>
              </div>
            </aside>

            {/* Grid */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {!loading && (
                <p style={{ margin: "0 0 14px", color: "var(--muted)", fontSize: 13 }}>
                  {total === 0 ? "No items found" : `${total} item${total !== 1 ? "s" : ""} found`}
                  {hasActiveFilters && " — filtered"}
                </p>
              )}

              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="mp-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
                      <div className="skeleton" style={{ width: "100%", aspectRatio: "16/10" }} />
                      <div style={{ padding: 14 }}>
                        <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 12, width: "60%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div style={{ padding: 48, border: "1px solid var(--line)", borderRadius: 6, textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
                  <h3 style={{ margin: "0 0 8px" }}>No items found</h3>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    {hasActiveFilters ? "Try adjusting your filters." : "Be the first to list something!"}
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="mp-grid">
                    {items.map((item) => <ItemCard key={item.id} item={item} />)}
                  </div>

                  {totalPages > 1 && (
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ height: 38, padding: "0 14px", border: "1px solid var(--line)", background: "var(--white)", cursor: "pointer", fontSize: 14, fontWeight: 800 }}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                        .map((n, i, arr) => (
                          <button
                            key={n}
                            onClick={() => setPage(n)}
                            style={{
                              width: 36, height: 38,
                              border: `1px solid ${page === n ? "var(--ink)" : "var(--line)"}`,
                              background: page === n ? "var(--ink)" : "var(--white)",
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

      {/* Why sell section */}
      <section style={{ background: "#fff8ec", borderTop: "1px solid #f0dfc4", borderBottom: "1px solid #f0dfc4", padding: "34px 0" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 800 }}>Why students sell here</h2>
          <p style={{ margin: "0 0 20px", color: "var(--muted)", lineHeight: 1.45 }}>
            A senior can pass useful items to a junior, a hostel student can clear a room before moving, and a graduate can recover money from items another student needs tomorrow.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="seller-steps-grid">
            {SELLER_STEPS.map((step) => (
              <article key={step.title} style={{ padding: 18, border: "1px solid #ead9bd", borderRadius: 6, background: "var(--white)" }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>{step.title}</h3>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.45 }}>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 980px) {
          .marketplace-hero-grid { grid-template-columns: 1fr !important; }
          .marketplace-layout { flex-direction: column !important; }
          .marketplace-sidebar { width: 100% !important; }
          .mp-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .seller-steps-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .mp-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
