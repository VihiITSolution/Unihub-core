'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { boardingService } from '@/services/boarding.service';
import { universityService, type University } from '@/services/university.service';
import { BoardingPlaceFormData, RoomType, GenderPreference } from '@/types';

const AMENITIES_OPTIONS = [
  'WiFi', 'Parking', 'Meals Included', 'Laundry', 'Air Conditioning',
  'Study Room', 'Kitchen Access', 'Hot Water', 'Security', 'Furnished'
];

export default function CreateBoardingListing() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [showCustomUniversity, setShowCustomUniversity] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<BoardingPlaceFormData>({
    title: '',
    description: '',
    address: '',
    city: '',
    district: '',
    nearestUniversity: '',
    distanceToUniversity: undefined,
    roomType: 'single',
    genderPreference: 'any',
    capacity: 1,
    monthlyRent: 0,
    securityDeposit: 0,
    amenities: [],
    rules: '',
    images: [],
    contactPhone: user?.phoneNumber || '',
    contactEmail: user?.email || ''
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Load nearest universities when user clicks geolocation button
  const handleGetNearestUniversities = async () => {
    setLoadingLocation(true);
    try {
      const position = await universityService.getCurrentPosition();
      const response = await universityService.getNearestUniversities({
        latitude: position.latitude,
        longitude: position.longitude,
        radius: 50,
        limit: 20
      });

      if (response.success && response.data.universities.length > 0) {
        setUniversities(response.data.universities);
        alert(`Found ${response.count} universities within 50km of your location`);
      } else {
        alert('No universities found nearby. You can enter a custom university name.');
        setShowCustomUniversity(true);
      }
    } catch (error: any) {
      console.error('Location error:', error);
      alert(error.message || 'Failed to get location. You can enter a custom university name.');
      setShowCustomUniversity(true);
    } finally {
      setLoadingLocation(false);
    }
  };

  // Load all universities on component mount as fallback
  useEffect(() => {
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
    loadUniversities();
  }, []);

  // Handle university selection from dropdown
  const handleUniversitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === 'custom') {
      setShowCustomUniversity(true);
      setSelectedUniversityId(null);
      setFormData(prev => ({
        ...prev,
        nearestUniversity: '',
        distanceToUniversity: undefined
      }));
    } else if (value) {
      const universityId = parseInt(value);
      const selectedUni = universities.find(u => u.id === universityId);
      
      if (selectedUni) {
        setSelectedUniversityId(universityId);
        setShowCustomUniversity(false);
        setFormData(prev => ({
          ...prev,
          nearestUniversity: selectedUni.name,
          distanceToUniversity: selectedUni.distance || undefined
        }));
      }
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  };

  const handleImageAdd = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), url]
      }));
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await boardingService.createListing(formData);
      alert(`Listing created! Please pay $${result.adFee} to activate.`);
      router.push(`/vendor/boarding/${result.id}/pay`);
    } catch (error: any) {
      console.error('Error creating listing:', error);
      alert(error.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isVendorProfileComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendor Profile Required</h2>
        <p className="text-gray-600 mb-6">Complete your vendor profile to list boarding places</p>
        <button
          onClick={() => router.push('/become-vendor')}
          className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700"
        >
          Complete Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Boarding Place Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              placeholder="E.g., Comfortable Single Room Near University"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe the accommodation, facilities, nearby amenities..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Location</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* University Selection with Geolocation */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nearest University
                </label>
                <button
                  type="button"
                  onClick={handleGetNearestUniversities}
                  disabled={loadingLocation}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  {loadingLocation ? (
                    <>
                      <span className="animate-spin">⏳</span> Getting location...
                    </>
                  ) : (
                    <>
                      📍 Find nearest universities
                    </>
                  )}
                </button>
              </div>

              {!showCustomUniversity ? (
                <div className="space-y-2">
                  <select
                    value={selectedUniversityId || ''}
                    onChange={handleUniversitySelect}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select a university</option>
                    {universities.map(uni => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name} {uni.city && `- ${uni.city}`} 
                        {uni.distance && ` (${uni.distance.toFixed(1)}km away)`}
                      </option>
                    ))}
                    <option value="custom">➕ Enter custom university name</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    Select from the list or click "Find nearest" to see universities near you
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="nearestUniversity"
                    value={formData.nearestUniversity}
                    onChange={handleInputChange}
                    placeholder="E.g., University of Colombo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomUniversity(false);
                      setFormData(prev => ({ ...prev, nearestUniversity: '' }));
                    }}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    ← Back to university list
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance to University (km)
              </label>
              <input
                type="number"
                name="distanceToUniversity"
                step="0.1"
                value={formData.distanceToUniversity || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Room Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type *
              </label>
              <select
                name="roomType"
                required
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="single">Single Room</option>
                <option value="shared">Shared Room</option>
                <option value="apartment">Apartment</option>
                <option value="annex">Annex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender Preference *
              </label>
              <select
                name="genderPreference"
                required
                value={formData.genderPreference}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="any">Any</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                required
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent ($) *
              </label>
              <input
                type="number"
                name="monthlyRent"
                required
                min="0"
                step="0.01"
                value={formData.monthlyRent}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit ($)
              </label>
              <input
                type="number"
                name="securityDeposit"
                min="0"
                step="0.01"
                value={formData.securityDeposit}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AMENITIES_OPTIONS.map(amenity => (
              <label key={amenity} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.amenities?.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            House Rules
          </label>
          <textarea
            name="rules"
            value={formData.rules}
            onChange={handleInputChange}
            rows={3}
            placeholder="No smoking, No pets, Quiet hours after 10 PM..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Images</h2>
          <button
            type="button"
            onClick={handleImageAdd}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            + Add Image URL
          </button>
          {formData.images && formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt={`Image ${index + 1}`} className="w-full h-32 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                name="contactPhone"
                required
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium">📋 Note:</p>
          <p>After creating the listing, you will need to pay $50 to activate it for 30 days.</p>
        </div>
      </form>
    </div>
  );
}
