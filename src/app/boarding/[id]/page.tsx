"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { boardingService } from "@/services/boarding.service";
import { StartConversationButton } from "@/components/chat";
import type { BoardingPlace } from "@/types";

function roomTypeLabel(r: string) {
  const map: Record<string, string> = {
    single: "Single Room",
    shared: "Shared Room",
    apartment: "Apartment",
    annex: "Annex",
  };
  return map[r] ?? r;
}

function genderLabel(g: string) {
  const map: Record<string, string> = { male: "Male Only", female: "Female Only", any: "Any Gender" };
  return map[g] ?? g;
}

export default function BoardingDetailPage() {
  const params = useParams();
  const placeId = parseInt(params.id as string);

  const [place, setPlace] = useState<BoardingPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    loadPlace();
  }, [placeId]);

  const loadPlace = async () => {
    try {
      setLoading(true);
      const result = await boardingService.getListingById(placeId) as any;
      const p: BoardingPlace = result.place ?? result;
      if (!p || !p.id) {
        setError("Listing not found");
      } else {
        setPlace(p);
      }
    } catch (err) {
      console.error("Failed to load boarding place:", err);
      setError("Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = async () => {
    if (!place) return;
    try {
      await boardingService.recordInquiry(place.id);
    } catch {
      // non-critical
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="animate-pulse text-lg">Loading listing...</div>
      </div>
    );
  }

  if (!place || error) {
    return (
      <div className="container-custom py-12">
        <div className="bg-white rounded-xl border p-16 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold mb-2">Listing not found</h3>
          <p className="text-gray-600 mb-6">{error || "This listing does not exist or is no longer available."}</p>
          <Link href="/boarding" className="btn-primary inline-block">
            Back to Boarding
          </Link>
        </div>
      </div>
    );
  }

  const images = place.images && place.images.length > 0 ? place.images : [];

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/boarding" className="hover:text-amber-600">Boarding</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{place.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-12">
        {/* Images */}
        <div>
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl mb-3 flex items-center justify-center text-white text-8xl shadow-lg overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={place.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>🏠</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                    activeImage === i ? "border-amber-500" : "border-gray-200 hover:border-amber-300"
                  }`}
                >
                  <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {place.videos && place.videos.length > 0 && (
            <div className="mt-4 space-y-2">
              {place.videos.map((videoUrl, i) => (
                <video
                  key={i}
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg bg-black"
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {/* Type badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full font-medium">
              {roomTypeLabel(place.roomType)}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
              {genderLabel(place.genderPreference)}
            </span>
            {place.availableSlots > 0 ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                {place.availableSlots} slot{place.availableSlots !== 1 ? "s" : ""} available
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">
                Full
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-3">{place.title}</h1>

          <div className="text-4xl font-bold text-amber-600 mb-1">
            Rs. {Number(place.monthlyRent).toLocaleString()}
            <span className="text-lg font-normal text-gray-500">/month</span>
          </div>

          {place.securityDeposit && place.securityDeposit > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              Security deposit: Rs. {Number(place.securityDeposit).toLocaleString()}
            </p>
          )}

          <p className="text-gray-600 mb-6 leading-relaxed">{place.description}</p>

          {/* Location info */}
          <div className="mb-6 p-5 bg-gray-50 rounded-xl space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-400 w-5">📍</span>
              <span className="text-gray-700">{place.address}, {place.city}{place.district ? `, ${place.district}` : ""}</span>
            </div>
            {place.nearestUniversity && (
              <div className="flex gap-2">
                <span className="text-gray-400 w-5">🎓</span>
                <span className="text-gray-700">
                  Near {place.nearestUniversity}
                  {place.distanceToUniversity ? ` — ${place.distanceToUniversity} km away` : ""}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-gray-400 w-5">👥</span>
              <span className="text-gray-700">
                Capacity: {place.capacity} · {place.availableSlots} slots available
              </span>
            </div>
          </div>

          {/* Amenities */}
          {place.amenities && place.amenities.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {place.amenities.map((a) => (
                  <span key={a} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact the Owner */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Contact the Owner</h2>
              <p className="text-xs text-gray-500 mt-0.5">Reach out to arrange a viewing or get more details.</p>
            </div>
            <div className="p-5 space-y-4">
              {/* Owner name */}
              {place.vendor && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg shrink-0">
                    {place.vendor.firstName?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {place.vendor.vendorProfile?.shopName ||
                        `${place.vendor.firstName} ${place.vendor.lastName}`}
                    </p>
                    {place.vendor.vendorProfile?.shopName && (
                      <p className="text-xs text-gray-500">{place.vendor.firstName} {place.vendor.lastName}</p>
                    )}
                  </div>
                </div>
              )}

              {place.vendor?.id && (
                <StartConversationButton
                  recipientId={Number(place.vendor.id)}
                  contextType="boarding_place"
                  contextId={Number(place.id)}
                  label="Message Vendor"
                  className="w-full justify-center"
                />
              )}

              <hr className="border-gray-100" />

              {/* Phone */}
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-6 text-center">📞</span>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <a
                    href={`tel:${place.contactPhone}`}
                    onClick={handleInquiry}
                    className="text-amber-600 hover:underline font-medium text-sm"
                  >
                    {place.contactPhone}
                  </a>
                </div>
              </div>

              {/* Email */}
              {place.contactEmail && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-6 text-center">✉</span>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <a
                      href={`mailto:${place.contactEmail}`}
                      onClick={handleInquiry}
                      className="text-amber-600 hover:underline font-medium text-sm"
                    >
                      {place.contactEmail}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* House Rules */}
      {place.rules && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-3">House Rules</h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{place.rules}</p>
        </div>
      )}

      {/* Additional details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Listing Details</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Room Type:</dt>
              <dd className="font-medium">{roomTypeLabel(place.roomType)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Gender Preference:</dt>
              <dd className="font-medium">{genderLabel(place.genderPreference)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Total Capacity:</dt>
              <dd className="font-medium">{place.capacity} person{place.capacity !== 1 ? "s" : ""}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Available Slots:</dt>
              <dd className="font-medium">{place.availableSlots}</dd>
            </div>
          </dl>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Monthly Rent:</dt>
              <dd className="font-medium">Rs. {Number(place.monthlyRent).toLocaleString()}</dd>
            </div>
            {place.securityDeposit && place.securityDeposit > 0 && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Security Deposit:</dt>
                <dd className="font-medium">Rs. {Number(place.securityDeposit).toLocaleString()}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-600">Listed:</dt>
              <dd className="font-medium">{new Date(place.createdAt).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Views:</dt>
              <dd className="font-medium">{place.viewCount}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
