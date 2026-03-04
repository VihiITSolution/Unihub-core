'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { boardingService } from '@/services/boarding.service';
import { universityService, University } from '@/services/university.service';
import { BoardingPlace, BoardingPlaceFilters } from '@/types';

export default function BodimaPage() {
  const [listings, setListings] = useState<BoardingPlace[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomUniversity, setShowCustomUniversity] = useState(false);
  const [filters, setFilters] = useState<BoardingPlaceFilters>({
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 12
  });

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    loadListings();
  }, [filters]);

  const loadUniversities = async () => {
    try {
      const response = await universityService.getUniversities();
      if (response.success) {
        setUniversities(response.data.universities);
      }
    } catch (error) {
      console.error('Failed to load universities:', error);
    }
  };

  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await boardingService.getListings(filters);
      setListings(response.places);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load bodima listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof BoardingPlaceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleReset = () => {
    setFilters({ page: 1, limit: 12 });
    setShowCustomUniversity(false);
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      single: '🏠 Single Room',
      shared: '👥 Shared Room',
      apartment: '🏢 Apartment',
      annex: '🏡 Annex'
    };
    return labels[type] || type;
  };

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      male: '♂️ Male Only',
      female: '♀️ Female Only',
      any: '👫 Any Gender'
    };
    return labels[gender] || gender;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🏠 බෝඩිම / Bodima
            </h1>
            <p className="text-lg text-blue-100">
              Find your perfect boarding place near your university. Safe, affordable, and comfortable accommodation for students across Sri Lanka.
            </p>
            <p className="text-sm text-blue-200 mt-2">
              ඔබේ විශ්ව විද්‍යාලය අසල සුදුසුම බෝඩිම සොයා ගන්න
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                <button
                  onClick={handleReset}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Reset
                </button>
              </div>

              {/* City Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📍 City / නගරය
                </label>
                <select
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Cities</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Peradeniya">Peradeniya</option>
                  <option value="Moratuwa">Moratuwa</option>
                  <option value="Kelaniya">Kelaniya</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Nugegoda">Nugegoda</option>
                  <option value="Maharagama">Maharagama</option>
                  <option value="Battaramulla">Battaramulla</option>
                </select>
              </div>

              {/* Room Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏠 Room Type
                </label>
                <select
                  value={filters.roomType || ''}
                  onChange={(e) => handleFilterChange('roomType', e.target.value || undefined)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="single">Single Room</option>
                  <option value="shared">Shared Room</option>
                  <option value="apartment">Apartment</option>
                  <option value="annex">Annex</option>
                </select>
              </div>

              {/* Gender Preference */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Gender Preference
                </label>
                <select
                  value={filters.genderPreference || ''}
                  onChange={(e) => handleFilterChange('genderPreference', e.target.value || undefined)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Gender</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>

              {/* Rent Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  💰 Monthly Rent (Rs.)
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Minimum</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minRent || ''}
                      onChange={(e) => handleFilterChange('minRent', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Maximum</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxRent || ''}
                      onChange={(e) => handleFilterChange('maxRent', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* University Filter */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🎓 Near University
                </label>
                {!showCustomUniversity ? (
                  <div className="space-y-2">
                    <select
                      value={filters.nearestUniversity || ''}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setShowCustomUniversity(true);
                          handleFilterChange('nearestUniversity', undefined);
                        } else {
                          handleFilterChange('nearestUniversity', e.target.value || undefined);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Universities</option>
                      {universities.map((uni) => (
                        <option key={uni.id} value={uni.name}>
                          {uni.name}
                        </option>
                      ))}
                      <option value="__custom__">➕ Search Manually</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Select from the list or search manually
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g., University of Colombo"
                      value={filters.nearestUniversity || ''}
                      onChange={(e) => handleFilterChange('nearestUniversity', e.target.value || undefined)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        setShowCustomUniversity(false);
                        handleFilterChange('nearestUniversity', undefined);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      ← Back to dropdown
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Listings Grid */}
          <main className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Available Boarding Places
                </h2>
                <p className="text-gray-600 mt-1">
                  {pagination.total} listings found
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Listings Grid */}
            {!loading && listings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/student/bodima/${listing.id}`}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                      {listing.images && listing.images.length > 0 ? (
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-md">
                          {getRoomTypeLabel(listing.roomType).split(' ')[0]}
                        </span>
                        <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-md">
                          {getGenderLabel(listing.genderPreference).split(' ')[0]}
                        </span>
                      </div>
                      {listing.availableSlots === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg">
                            FULL
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {listing.title}
                      </h3>
                      
                      {/* Location */}
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{listing.city}</span>
                      </div>

                      {/* University */}
                      {listing.nearestUniversity && (
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="truncate">
                            {listing.nearestUniversity}
                            {listing.distanceToUniversity && ` (${listing.distanceToUniversity}km)`}
                          </span>
                        </div>
                      )}

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                          {listing.capacity} {listing.capacity === 1 ? 'Person' : 'Persons'}
                        </span>
                        {listing.availableSlots > 0 && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                            {listing.availableSlots} Available
                          </span>
                        )}
                      </div>

                      {/* Amenities */}
                      {listing.amenities && listing.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {listing.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="text-xs text-gray-500">
                              • {amenity}
                            </span>
                          ))}
                          {listing.amenities.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{listing.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">
                              {formatCurrency(listing.monthlyRent)}
                            </p>
                            <p className="text-xs text-gray-500">per month</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                            View Details
                          </button>
                        </div>
                        {listing.securityDeposit && (
                          <p className="text-xs text-gray-500 mt-2">
                            Deposit: {formatCurrency(listing.securityDeposit)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && listings.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No boarding places found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', page)}
                      className={`w-10 h-10 rounded-lg font-medium ${
                        page === pagination.page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleFilterChange('page', pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
