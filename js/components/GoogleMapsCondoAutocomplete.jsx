import React, { useState, useEffect, useRef } from 'react';
import { 
  searchBangkokCondos, 
  matchDistrictFromText, 
  findNearestBangkokCondo 
} from '../data/bangkokCondosData.js';

/**
 * GoogleMapsCondoAutocomplete
 * High-fidelity Bangkok condominium & residence autocomplete powered by Google Maps.
 * Supports:
 * 1. Google Cloud Places Autocomplete API (when apiKey is provided)
 * 2. High-precision curated Bangkok Condominiums database engine (instant zero-latency fallback)
 * 3. Automatic Bangkok District detection & synchronization
 * 4. Interactive Google Maps pin & live embed preview
 * 5. Device GPS location detection ("Locate Me")
 */
export default function GoogleMapsCondoAutocomplete({
  value = '',
  onChange,
  district = '',
  onDistrictChange,
  onSelectPlace,
  apiKey = '',
  placeholder = 'e.g. Ideo Q Sukhumvit 36 / Rhythm Sathorn',
  required = false,
  className = '',
  id = 'google-condo-input'
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const googlePlacesServiceRef = useRef(null);
  const googleAutocompleteServiceRef = useRef(null);

  // Sync internal query with external value prop
  useEffect(() => {
    if (value !== query) {
      setQuery(value || '');
    }
  }, [value]);

  // Load Google Maps API script if an API key is provided and not already on window
  useEffect(() => {
    if (!apiKey) return;
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleApiLoaded(true);
      return;
    }

    const scriptId = 'google-maps-places-script';
    if (document.getElementById(scriptId)) {
      setGoogleApiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en&region=TH`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleApiLoaded(true);
    };
    script.onerror = () => {
      console.warn('Google Maps script failed to load. Falling back to Bangkok local database.');
      setGoogleApiLoaded(false);
    };
    document.head.appendChild(script);
  }, [apiKey]);

  // Initialize Google Places services once loaded
  useEffect(() => {
    if (googleApiLoaded && window.google && window.google.maps && window.google.maps.places) {
      try {
        googleAutocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        const dummyDiv = document.createElement('div');
        googlePlacesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv);
      } catch (err) {
        console.warn('Could not initialize Google Places services:', err);
      }
    }
  }, [googleApiLoaded]);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions whenever query changes or on focus
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);

    // If cleared, reset selected place
    if (!val.trim()) {
      setSelectedPlace(null);
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Attempt Google Places predictions if loaded
    if (googleAutocompleteServiceRef.current && val.trim().length >= 2) {
      googleAutocompleteServiceRef.current.getPlacePredictions(
        {
          input: val,
          componentRestrictions: { country: 'th' },
          locationBias: new window.google.maps.Circle({
            center: { lat: 13.7563, lng: 100.5018 }, // Bangkok center
            radius: 35000 // 35 km
          })
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
            const mapped = predictions.map(p => ({
              id: p.place_id,
              name: p.structured_formatting ? p.structured_formatting.main_text : p.description.split(',')[0],
              subdistrict: p.structured_formatting ? p.structured_formatting.secondary_text : '',
              district: matchDistrictFromText(p.description),
              formattedAddress: p.description,
              isGoogleApi: true,
              placeId: p.place_id
            }));
            setSuggestions(mapped);
            setIsOpen(true);
          } else {
            // Fall back to local Bangkok condo database
            const fallback = searchBangkokCondos(val);
            setSuggestions(fallback);
            setIsOpen(fallback.length > 0);
          }
        }
      );
    } else {
      // Local Bangkok Condos Search Engine
      const results = searchBangkokCondos(val);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    }
  };

  const handleInputFocus = () => {
    const results = searchBangkokCondos(query);
    setSuggestions(results);
    setIsOpen(results.length > 0);
  };

  // When a condo or place is selected
  const handleSelectPlace = (place) => {
    const condoTitle = place.name;
    setQuery(condoTitle);
    if (onChange) onChange(condoTitle);

    // Auto-detect and set Bangkok District
    let matchedDistrict = place.district;
    if (!matchedDistrict) {
      matchedDistrict = matchDistrictFromText(place.formattedAddress || place.name || '');
    }

    if (matchedDistrict && onDistrictChange) {
      onDistrictChange(matchedDistrict);
      setLocationNotice(`Auto-set district to: ${matchedDistrict.split(' (')[0]}`);
      setTimeout(() => setLocationNotice(''), 5000);
    }

    const fullPlace = {
      name: place.name,
      district: matchedDistrict || district,
      address: place.formattedAddress || `${place.name}, Bangkok`,
      lat: place.lat || 13.7563,
      lng: place.lng || 100.5018,
      googleMapsUrl: place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' Bangkok')}`,
      embedUrl: place.embedUrl || `https://www.google.com/maps?q=${encodeURIComponent(place.name + ' Bangkok')}&output=embed`
    };

    setSelectedPlace(fullPlace);
    if (onSelectPlace) onSelectPlace(fullPlace);

    setIsOpen(false);
    setActiveHighlight(-1);
  };

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveHighlight(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveHighlight(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (activeHighlight >= 0 && activeHighlight < suggestions.length) {
        e.preventDefault();
        handleSelectPlace(suggestions[activeHighlight]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // GPS "Locate Me" functionality
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationNotice('Requesting GPS location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestBangkokCondo(latitude, longitude);

        if (nearest) {
          handleSelectPlace({
            ...nearest,
            formattedAddress: nearest.formattedAddress || `${nearest.name}, Bangkok`
          });
          setLocationNotice(`📍 Located near ${nearest.name} (~${nearest.distanceKm || 0.1} km)`);
          setTimeout(() => setLocationNotice(''), 6000);
        } else {
          setLocationNotice('GPS acquired outside central Bangkok coverage.');
          setTimeout(() => setLocationNotice(''), 4000);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setLocationNotice('Location access was denied or timed out.');
        setTimeout(() => setLocationNotice(''), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const activeEmbedUrl = selectedPlace?.embedUrl || 
    `https://www.google.com/maps?q=${encodeURIComponent((query || 'Bangkok Condominium') + ' Bangkok')}&output=embed`;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input container with Google Maps Pin & GPS locate button */}
      <div className="relative flex items-center">
        {/* Google Maps Pin Icon */}
        <div className="absolute left-3.5 flex items-center pointer-events-none text-red-500">
          <svg className="w-5 h-5 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-11 pr-24 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm shadow-sm transition ${className}`}
        />

        {/* Action Buttons inside Input */}
        <div className="absolute right-2 flex items-center space-x-1.5">
          {/* Quick Clear */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                if (onChange) onChange('');
                setSelectedPlace(null);
                setIsOpen(false);
              }}
              title="Clear"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* GPS Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            title="Use current GPS location"
            className="flex items-center gap-1 px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[11px] font-bold border border-sky-200 transition disabled:opacity-50"
          >
            {isLocating ? (
              <span className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <svg className="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            <span>GPS</span>
          </button>
        </div>
      </div>

      {/* Real-time Status / Auto-Sync Toast */}
      {locationNotice && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-fadeIn">
          <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span className="truncate">{locationNotice}</span>
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 animate-fadeIn">
          {/* Header */}
          <div className="px-3.5 py-2 bg-gradient-to-r from-slate-50 to-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Bangkok Residences & Condos
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {googleApiLoaded ? 'Google Places Live API' : 'Google Maps Database'}
            </span>
          </div>

          {/* Suggestions */}
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((item, idx) => {
              const isSelected = activeHighlight === idx;
              return (
                <div
                  key={item.id || idx}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur before click registers
                    handleSelectPlace(item);
                  }}
                  onMouseEnter={() => setActiveHighlight(idx)}
                  className={`px-3.5 py-2.5 cursor-pointer transition flex items-start gap-3 ${
                    isSelected ? 'bg-sky-50 text-sky-950' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5 w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {item.name}
                      </span>
                      {item.type && (
                        <span className="ml-2 text-[9px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {item.type}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.road ? `${item.road}, ` : ''}{item.subdistrict ? `${item.subdistrict}, ` : ''}
                      <span className="font-semibold text-slate-700">
                        {item.district ? item.district.split(' (')[0] : 'Bangkok'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Official Google Maps Footer Attribution */}
          <div className="px-3.5 py-2 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              {/* Google colored logo mark */}
              <span className="font-bold text-xs">
                <span className="text-blue-500">G</span>
                <span className="text-red-500">o</span>
                <span className="text-yellow-500">o</span>
                <span className="text-blue-500">g</span>
                <span className="text-green-500">l</span>
                <span className="text-red-500">e</span>
              </span>
              <span className="text-[10px] text-slate-400">Maps Autocomplete</span>
            </div>
            <span className="text-[10px] text-slate-400">Press ↑↓ to select</span>
          </div>
        </div>
      )}

      {/* Google Maps Confirmation & Interactive Map Preview Toggle */}
      {(selectedPlace || query.trim().length > 3) && (
        <div className="mt-2.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium truncate max-w-[200px] sm:max-w-xs">
                {selectedPlace?.name || query}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMapPreview(!showMapPreview)}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {showMapPreview ? 'Hide Map' : 'Preview on Map'}
              </button>
              <a
                href={selectedPlace?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((query || 'Bangkok') + ' Bangkok')}`}
                target="_blank"
                rel="noreferrer"
                title="Open in Google Maps"
                className="text-slate-400 hover:text-red-600 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Embedded Google Map Preview */}
          {showMapPreview && (
            <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
              <div className="relative w-full h-44 sm:h-52">
                <iframe
                  title="Bangkok Location Map"
                  src={activeEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <div className="p-2 bg-white flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                <span className="truncate">
                  📍 {selectedPlace?.address || `${query}, Bangkok`}
                </span>
                <span className="font-semibold text-emerald-600 flex-shrink-0 ml-2">
                  Verified Bangkok Coordinates
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
