'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { boardingService } from '@/services/boarding.service';
import { BoardingPlace } from '@/types';

export default function BodimaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<BoardingPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadListing(Number(params.id));
    }
  }, [params.id]);

  const loadListing = async (id: number) => {
    try {
      setLoading(true);
      const data = await boardingService.getListingById(id);
      setListing(data);
    } catch (error) {
      console.error('Failed to load listing:', error);
      alert('Failed to load boarding place details');
    } finally {
      setLoading(false);
    }
  };

  const handleInquire = async () => {
    if (!listing) return;
    
    try {
      await boardingService.recordInquiry(listing.id);
      setShowContactModal(true);
    } catch (error) {
      console.error('Failed to record inquiry:', error);
      setShowContactModal(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      single: 'Single Room',
      shared: 'Shared Room',
      apartment: 'Apartment',
      annex: 'Annex'
    };
    return labels[type] || type;
  };

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      male: 'Male Only',
      female: 'Female Only',
      any: 'Any Gender'
    };
    return labels[gender] || gender;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Listing not found</h2>
          <Link href="/student/bodima" className="text-blue-600 hover:underline">
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/student/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <span>/</span>
            <Link href="/student/bodima" className="hover:text-blue-600">Bodima</Link>
            <span>/</span>
            <span className="text-gray-900">{listing.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-96 bg-gray-200">
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    src={listing.images[selectedImage]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}
              </div>
              {listing.images && listing.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? 'border-blue-600' : 'border-transparent'
                      }`}
                    >
                      <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{listing.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{listing.viewCount} views</span>
                    </div>
                  </div>
                </div>
                {listing.availableSlots === 0 && (
                  <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold">
                    FULL
                  </span>
                )}
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl mb-1">🏠</div>
                  <div className="text-sm font-semibold text-gray-700">{getRoomTypeLabel(listing.roomType)}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-sm font-semibold text-gray-700">{getGenderLabel(listing.genderPreference)}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🛏️</div>
                  <div className="text-sm font-semibold text-gray-700">{listing.capacity} Persons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <div className="text-sm font-semibold text-gray-700">{listing.availableSlots} Available</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Location</h2>
                <div className="space-y-2">
                  <p className="text-gray-700"><strong>Address:</strong> {listing.address}</p>
                  <p className="text-gray-700"><strong>City:</strong> {listing.city}</p>
                  {listing.district && (
                    <p className="text-gray-700"><strong>District:</strong> {listing.district}</p>
                  )}
                  {listing.nearestUniversity && (
                    <div className="flex items-center gap-2 mt-3 p-3 bg-amber-50 rounded-lg">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Near {listing.nearestUniversity}</p>
                        {listing.distanceToUniversity && (
                          <p className="text-sm text-gray-600">{listing.distanceToUniversity} km away</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {listing.amenities && listing.amenities.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Amenities / පහසුකම්</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {listing.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {listing.rules && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">House Rules / නීති රීති</h2>
                  <p className="text-gray-700 whitespace-pre-line bg-amber-50 p-4 rounded-lg">{listing.rules}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              {/* Price */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-1">Monthly Rent</p>
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  {formatCurrency(listing.monthlyRent)}
                </p>
                {listing.securityDeposit && (
                  <p className="text-gray-600 text-sm">
                    Security Deposit: {formatCurrency(listing.securityDeposit)}
                  </p>
                )}
              </div>

              {/* Contact Button */}
              <button
                onClick={handleInquire}
                disabled={listing.availableSlots === 0}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {listing.availableSlots === 0 ? 'No Slots Available' : 'Contact Owner'}
              </button>

              {/* Vendor Info */}
              {listing.vendor && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Listed by</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                      {listing.vendor.firstName[0]}{listing.vendor.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {listing.vendor.firstName} {listing.vendor.lastName}
                      </p>
                      {listing.vendor.vendorProfile?.shopName && (
                        <p className="text-sm text-gray-600">{listing.vendor.vendorProfile.shopName}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Info */}
              <div className="border-t pt-4 mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Posted on</span>
                  <span className="font-medium">{new Date(listing.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Inquiries</span>
                  <span className="font-medium">{listing.inquiryCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                <a
                  href={`tel:${listing.contactPhone}`}
                  className="text-blue-600 hover:underline text-lg font-semibold"
                >
                  {listing.contactPhone}
                </a>
              </div>
              {listing.contactEmail && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <a
                    href={`mailto:${listing.contactEmail}`}
                    className="text-blue-600 hover:underline"
                  >
                    {listing.contactEmail}
                  </a>
                </div>
              )}
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">
                  💡 <strong>Tip:</strong> When contacting, mention you found this on UniHub Bodima for the best response!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
