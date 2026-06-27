"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { boardingService } from "@/services/boarding.service";
import type { BoardingPlace, BoardingPlaceFilters, RoomType, GenderPreference } from "@/types";

const ROOM_TYPES: { value: RoomType | ""; label: string }[] = [
  { value: "", label: "All Room Types" },
  { value: "single", label: "Single Room" },
  { value: "shared", label: "Shared Room" },
  { value: "apartment", label: "Apartment" },
  { value: "annex", label: "Annex" },
];

const GENDER_OPTIONS: { value: GenderPreference | ""; label: string }[] = [
  { value: "", label: "Any Gender" },
  { value: "any", label: "Mixed / Any" },
  { value: "male", label: "Male Only" },
  { value: "female", label: "Female Only" },
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

function PlaceCard({ place }: { place: BoardingPlace }) {
  return (
    <Link
      href={`/boarding/${place.id}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-amber-400 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-5xl font-bold relative">
        {place.images && place.images.length > 0 ? (
          <img
            src={place.images[0]}
            alt={place.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>🏠</span>
        )}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <span className="px-2 py-0.5 bg-white/90 text-gray-800 text-xs rounded-full font-medium">
            {roomTypeLabel(place.roomType)}
          </span>
          {place.genderPreference !== "any" && (
            <span className="px-2 py-0.5 bg-white/90 text-gray-800 text-xs rounded-full font-medium">
              {genderLabel(place.genderPreference)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 line-clamp-2 mb-1">
          {place.title}
        </h3>

        <p className="text-sm text-gray-500 mb-1">
          📍 {place.city}{place.district ? `, ${place.district}` : ""}
        </p>

        {place.nearestUniversity && (
          <p className="text-xs text-gray-400 mb-2 line-clamp-1">
            🎓 Near {place.nearestUniversity}
            {place.distanceToUniversity ? ` (${place.distanceToUniversity} km)` : ""}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xl font-bold text-amber-600">
              Rs. {Number(place.monthlyRent).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
          <span className={`text-xs font-medium ${place.availableSlots > 0 ? "text-green-600" : "text-red-500"}`}>
            {place.availableSlots > 0 ? `${place.availableSlots} slot${place.availableSlots !== 1 ? "s" : ""} available` : "Full"}
          </span>
        </div>

        {place.amenities && place.amenities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {place.amenities.slice(0, 3).map((a) => (
              <span key={a} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {a}
              </span>
            ))}
            {place.amenities.length > 3 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                +{place.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function BoardingPage() {
  const [places, setPlaces] = useState<BoardingPlace[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const handleUniversitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUniversity(universityInput);
    setPage(1);
  };

  const clearFilters = () => {
    setUniversity("");
    setUniversityInput("");
    setRoomType("");
    setGenderPreference("");
    setMinRent("");
    setMaxRent("");
    setPage(1);
  };

  const hasActiveFilters = university || roomType || genderPreference || minRent || maxRent;

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Boarding Places</h1>
        <p className="text-gray-600">
          Find affordable student accommodation near your university — rooms, annex, apartments and more.
        </p>
      </div>

      {/* University search bar */}
      <form onSubmit={handleUniversitySearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={universityInput}
          onChange={(e) => setUniversityInput(e.target.value)}
          placeholder="Search by university name, city, or location..."
          className="input flex-1"
        />
        <button type="submit" className="btn-primary px-6">
          Search
        </button>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="btn-outline px-4 text-sm">
            Clear
          </button>
        )}
      </form>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
            <h2 className="font-semibold text-gray-900">Filters</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => { setRoomType(e.target.value as RoomType | ""); setPage(1); }}
                className="input"
              >
                {ROOM_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender Preference</label>
              <select
                value={genderPreference}
                onChange={(e) => { setGenderPreference(e.target.value as GenderPreference | ""); setPage(1); }}
                className="input"
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent (Rs.)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minRent}
                  onChange={(e) => { setMinRent(e.target.value); setPage(1); }}
                  className="input w-full"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxRent}
                  onChange={(e) => { setMaxRent(e.target.value); setPage(1); }}
                  className="input w-full"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full text-sm text-amber-600 hover:underline text-left"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* CTA for vendors */}
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="font-semibold text-amber-900 mb-1">Have a place to rent?</p>
            <p className="text-sm text-amber-700 mb-3">
              List your boarding place free for 3 months during our promotional period.
            </p>
            <Link href="/vendor/boarding/create" className="block text-center text-sm bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition font-medium">
              List Your Place
            </Link>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {!loading && (
            <p className="text-sm text-gray-500 mb-4">
              {total === 0
                ? "No listings found"
                : `${total} listing${total !== 1 ? "s" : ""} found`}
              {hasActiveFilters && " — filtered"}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">No listings found</h3>
              <p className="text-gray-500 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters or search query."
                  : "No boarding places are currently available. Be the first to list one!"}
              </p>
              {hasActiveFilters ? (
                <button onClick={clearFilters} className="btn-outline">
                  Clear filters
                </button>
              ) : (
                <Link href="/vendor/boarding/create" className="btn-primary inline-block">
                  List Your Place
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                    .reduce<(number | "...")[]>((acc, n, idx, arr) => {
                      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("...");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) =>
                      n === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setPage(n as number)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                            page === n
                              ? "bg-amber-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {n}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
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
  );
}
