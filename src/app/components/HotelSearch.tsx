"use client";

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt, FaImage, FaArrowRight, FaHotel } from 'react-icons/fa';
import debounce from 'lodash/debounce';
import "react-datepicker/dist/react-datepicker.css";
import ImageWithFallback from './ImageWithFallback';

interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  starRating: number;
  logoUrl: string | null;    // Updated from logoPath
  imageUrls: string[];       // Updated from imagePaths
  startingPrice: number;
}

interface CityOption {
  city: string;
  country: string;
}

// Create a separate component for the search functionality
const HotelSearchContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [city, setCity] = useState('');
  const [name, setName] = useState('');
  const [starRating, setStarRating] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    dates: boolean;
    city: boolean;
    priceRange: boolean;
  }>({
    dates: false,
    city: false,
    priceRange: false,
  });
  const [citySuggestions, setCitySuggestions] = useState<CityOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [searchRef] = useState(() => React.createRef<HTMLDivElement>());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10; // Hotels per page
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    initializeStateFromUrl();
  }, []); // Run once on component mount

  const initializeStateFromUrl = () => {
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const cityParam = searchParams.get('city');
    const nameParam = searchParams.get('name');
    const starRatingParam = searchParams.get('starRating');
    const priceRangeParam = searchParams.get('priceRange');
    const pageParam = searchParams.get('page');

    // Set date range
    if (checkIn && checkOut) {
      setDateRange([new Date(checkIn), new Date(checkOut)]);
    }

    // Set other parameters
    if (cityParam) setCity(cityParam);
    if (nameParam) setName(nameParam);
    if (starRatingParam) setStarRating(starRatingParam);
    if (priceRangeParam) setPriceRange(priceRangeParam);
    if (pageParam) setCurrentPage(parseInt(pageParam));

    // If we have search parameters, trigger the search
    if (checkIn && checkOut && cityParam) {
      // Create URL parameters for the initial search
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        city: cityParam,
        page: pageParam || '1',
        limit: limit.toString(),
      });

      // Add optional parameters
      if (nameParam) params.set('name', nameParam);
      if (starRatingParam) params.set('starRating', starRatingParam);
      if (priceRangeParam) params.set('priceRange', priceRangeParam);

      // Perform the initial search
      fetchInitialResults(params);
    }
  };

  const fetchInitialResults = async (params: URLSearchParams) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/hotel/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hotels');
      }

      setHotels(data.hotels);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (update: [Date | null, Date | null]) => {
    setDateRange(update);
  };

  const formatPriceRange = (range: string) => {
    if (!range) return null;
    const [min, max] = range.split('-').map(Number);
    return { min, max: max || null };
  };

  const fetchCities = useCallback(
    debounce(async (search: string) => {
      if (!search) {
        setCitySuggestions([]);
        return;
      }
      
      setIsLoadingCities(true);
      try {
        const response = await fetch(`/api/cities?search=${encodeURIComponent(search)}`);
        const data = await response.json();
        if (!response.ok) {
          // throw new Error(data.error || 'Failed to fetch city suggestions');
          alert(data.message);
        }
        setCitySuggestions(data.cities);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
        setCitySuggestions([]);
      } finally {
        setIsLoadingCities(false);
      }
    }, 300),
    []
  );

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || isLoadingCities) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < citySuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && citySuggestions[selectedSuggestionIndex]) {
          setCity(citySuggestions[selectedSuggestionIndex].city);
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setLoading(true);
    setError('');
    
    const [checkIn, checkOut] = dateRange;
    
    // Validate price range
    let priceRangeError = false;
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      if (min < 0 || max < 0) {
        priceRangeError = true;
        setError('Price range cannot contain negative values');
      } else if (min > max) {
        priceRangeError = true;
        setError('Minimum price cannot be greater than maximum price');
      }
    }

    const newValidationErrors = {
      dates: !checkIn || !checkOut,
      city: !city,
      priceRange: priceRangeError
    };
    
    setValidationErrors(newValidationErrors);

    if (!checkIn || !checkOut || !city || priceRangeError) {
      setLoading(false);
      if (!priceRangeError) {
        setError('Please fill in all required fields');
      }
      return;
    }

    // Create URL parameters
    const params = new URLSearchParams({
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      city: city,
      page: currentPage.toString(),
      limit: limit.toString(),
    });

    // Add optional parameters
    if (name) params.set('name', name);
    if (starRating) params.set('starRating', starRating);
    if (priceRange) params.set('priceRange', priceRange);

    // Update URL without reloading the page
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    try {
      const response = await fetch(`/api/hotel/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hotels');
      }

      setHotels(data.hotels);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHotel = (hotelId: string) => {
    const [checkIn, checkOut] = dateRange;
    
    if (checkIn && checkOut) {
      router.push(`/hotel/${hotelId}?checkIn=${checkIn.toISOString().split('T')[0]}&checkOut=${checkOut.toISOString().split('T')[0]}`);
    } else {
      router.push(`/hotel/${hotelId}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    
    // Create new URLSearchParams with current parameters
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    
    // Update URL and trigger search
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    handleSearch(new Event('submit') as any);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <form onSubmit={handleSearch} className="space-y-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* First row: Date picker and City input */}
          <div className="md:col-span-1">
            <label className="block text-black dark:text-white text-sm font-semibold mb-2">
              Check-in - Check-out Dates*
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-[14px] text-gray-500 z-10" />
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  handleDateChange(update);
                  setValidationErrors(prev => ({ ...prev, dates: false }));
                }}
                minDate={new Date()}
                monthsShown={1}
                className={`w-full pl-10 pr-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border ${
                  validationErrors.dates 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 focus:ring-blue-500'
                } rounded-md shadow-sm focus:outline-none focus:ring-2`}
                placeholderText="Select dates"
                isClearable={true}
                dayClassName={date => {
                  if (!startDate) return "";
                  const isSelected = date.getTime() === startDate.getTime();
                  return isSelected ? "react-datepicker__day--selected" : "";
                }}
                renderDayContents={(day, date) => {
                  return <span>{day}</span>;
                }}
              />
              {validationErrors.dates && (
                <p className="mt-1 text-sm text-red-500">Please select check-in and check-out dates</p>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="relative" ref={searchRef}>
              <label className="block text-black dark:text-white text-sm font-semibold mb-2">
                City*
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  const value = e.target.value;
                  setCity(value);
                  setValidationErrors(prev => ({ ...prev, city: false }));
                  setSelectedSuggestionIndex(-1); // Reset selection on type
                  fetchCities(value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleCityKeyDown}
                className={`w-full px-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border ${
                  validationErrors.city 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 focus:ring-blue-500'
                } rounded-md shadow-sm focus:outline-none focus:ring-2`}
                placeholder="City"
              />

              {showSuggestions && (citySuggestions.length > 0 || isLoadingCities) && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {isLoadingCities ? (
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                      Loading...
                    </div>
                  ) : (
                    citySuggestions.map((option, index) => (
                      <div
                        key={`${option.city}-${option.country}`}
                        className={`px-4 py-2 cursor-pointer ${
                          index === selectedSuggestionIndex
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => {
                          setCity(option.city);
                          setShowSuggestions(false);
                          setSelectedSuggestionIndex(-1);
                        }}
                      >
                        <span className="text-black dark:text-white">{option.city}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          {option.country}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {validationErrors.city && (
                <p className="mt-1 text-sm text-red-500">Please enter a city</p>
              )}
            </div>
          </div>

          {/* Second row: Hotel Name and Star Rating */}
          <div className="md:col-span-1">
            <label className="block text-black dark:text-white text-sm font-semibold mb-2">
              Hotel Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hotel name"
            />
          </div>

          <div className="md:col-span-1">
            <div className="relative">
              <label className="block text-black dark:text-white text-sm font-semibold mb-2">
                Star Rating
              </label>
              <select
                value={starRating}
                onChange={e => setStarRating(e.target.value)}
                className="w-full px-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 
                  border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                  hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 
                  appearance-none cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-gray-800">Any</option>
                {[5, 4, 3, 2, 1].map(rating => (
                  <option 
                    key={rating} 
                    value={rating}
                    className="bg-white dark:bg-gray-800 py-2"
                  >
                    {"⭐".repeat(rating)} ({rating}-star)
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-0 top-[38px] px-3 py-2">
                <svg className="h-4 w-4 fill-current text-gray-500 dark:text-gray-400" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Third row: Price Range with Search Button */}
          <div className="md:col-span-2">
            <label className="block text-black dark:text-white text-sm font-semibold mb-2">
              Price Range ($)
            </label>
            <div className="flex gap-4 items-start">
              <div className="grid grid-cols-2 gap-4 flex-1 max-w-md">
                <input
                  type="number"
                  value={priceRange.split('-')[0] || ''}
                  onChange={e => {
                    setPriceRange(`${e.target.value}-${priceRange.split('-')[1] || ''}`);
                    setValidationErrors(prev => ({ ...prev, priceRange: false }));
                    setError('');
                  }}
                  placeholder="Min"
                  className={`w-full px-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border ${
                    validationErrors.priceRange 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 focus:ring-blue-500'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2`}
                />
                <input
                  type="number"
                  value={priceRange.split('-')[1] || ''}
                  onChange={e => {
                    setPriceRange(`${priceRange.split('-')[0] || ''}-${e.target.value}`);
                    setValidationErrors(prev => ({ ...prev, priceRange: false }));
                    setError('');
                  }}
                  placeholder="Max"
                  className={`w-full px-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border ${
                    validationErrors.priceRange 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 focus:ring-blue-500'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2`}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 min-w-[200px] h-[42px] mt-0"
              >
                <span>{loading ? 'Searching...' : 'Search Hotels'}</span>
                {!loading && <FaArrowRight className="text-lg" />}
              </button>
            </div>
          </div>
        </div>
      </form>

      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}

      <div className="space-y-6">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Logo/Main Image */}
              <div className="w-full md:w-48 h-48 md:h-48 relative bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                <ImageWithFallback
                  src={hotel.logoUrl}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Hotel Details */}
              <div className="p-6 flex-grow">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{hotel.name}</h3>
                      <div className="flex items-center">
                        {[...Array(hotel.starRating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">⭐</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{hotel.city}</p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{hotel.address}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${hotel.startingPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">/night</span>
                    </div>
                    <button
                      onClick={() => handleViewHotel(hotel.id)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            {hotel.imageUrls && hotel.imageUrls.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-4 gap-4">
                  {hotel.imageUrls.slice(0, 4).map((url, index) => (
                    <ImageWithFallback
                      key={index}
                      src={url}
                      alt={`${hotel.name} - Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {hotels.length === 0 && !loading && !error && (
          <p className="text-center text-gray-600 dark:text-gray-400">No hotels found matching your criteria.</p>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 border rounded-md ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Main component wrapped with Suspense
const HotelSearch: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelSearchContent />
    </Suspense>
  );
};

export default HotelSearch;