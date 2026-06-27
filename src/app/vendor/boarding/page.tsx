'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { boardingService } from '@/services/boarding.service';
import { BoardingPlace } from '@/types';
import Link from 'next/link';

export default function VendorBoardingListings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [listings, setListings] = useState<BoardingPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const submittedFreeTrial = searchParams.get('submitted') === 'free-trial';

  useEffect(() => {
    if (!user?.isVendorProfileComplete) {
      router.push('/become-vendor');
      return;
    }
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await boardingService.getMyListings();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await boardingService.deleteListing(id);
      setListings(listings.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
    }
  };

  const filteredListings = listings.filter(listing => {
    if (filter === 'all') return true;
    if (filter === 'active') return listing.isActive && listing.isPaid;
    if (filter === 'inactive') return !listing.isActive;
    if (filter === 'pending') return listing.approvalStatus === 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Free trial submission success banner */}
      {submittedFreeTrial && (
        <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg flex items-start gap-3">
          <div className="text-2xl">🎉</div>
          <div>
            <p className="font-semibold text-green-800">Listing Submitted for Review!</p>
            <p className="text-sm text-green-700 mt-1">
              Your boarding listing has been submitted. Once approved by our admin team, it will be
              live for 3 months completely free.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Boarding Places</h1>
          <p className="text-gray-600 mt-1">Manage your accommodation listings</p>
        </div>
        <Link
          href="/vendor/boarding/create"
          className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
        >
          + Add New Listing
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending Approval' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as typeof filter)}
            className={`px-4 py-2 font-medium transition ${
              filter === tab.value
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No listings found</p>
          <Link
            href="/vendor/boarding/create"
            className="inline-block mt-4 text-amber-600 hover:text-amber-700"
          >
            Create your first boarding place listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {(listing as any).isFreeTrialAd && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">
                      Free Trial
                    </span>
                  )}
                  {!listing.isPaid && !(listing as any).isFreeTrialAd ? (
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                      Unpaid
                    </span>
                  ) : listing.approvalStatus === 'pending' ? (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                      Pending
                    </span>
                  ) : listing.approvalStatus === 'approved' && listing.isActive ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{listing.title}</h3>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p>📍 {listing.city}</p>
                  <p>💵 ${listing.monthlyRent}/month</p>
                  <p>👥 {listing.availableSlots}/{listing.capacity} slots available</p>
                  <p>👁️ {listing.viewCount} views | 📞 {listing.inquiryCount} inquiries</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  {!listing.isPaid && !(listing as any).isFreeTrialAd ? (
                    <Link
                      href={`/vendor/boarding/${listing.id}/pay`}
                      className="flex-1 bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 text-sm"
                    >
                      Pay Rs. {listing.adFee}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={`/vendor/boarding/${listing.id}/edit`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
