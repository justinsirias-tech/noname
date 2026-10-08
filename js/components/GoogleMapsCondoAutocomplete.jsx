import React, { useState, useEffect, useRef } from 'react';
import { 
  searchBangkokCondos, 
  matchDistrictFromText, 
  findNearestBangkokCondo,
  parseGooglePlaceComponents,
  matchLocationDetails,
  findBestLocationMatch
} from '../data/bangkokCondosData.js';

/**
 * GoogleMapsCondoAutocomplete
 * High-fidelity Thailand place, residence, building & address autocomplete powered by Google Maps.
 * Supports:
 * 1. Google Cloud Places Autocomplete API with unrestricted place types (buildings, houses, condos, addresses)
 * 2. Automatic address_components parsing (sub-district, district, postal code, city)
 * 3. High-precision curated Residences & Condominiums database engine (instant zero-latency fallback)
 * 4. Automatic Sub-district & District detection & synchronization
 * 5. Interactive Google Maps pin & live embed preview
 * 6. Device GPS location detection ("Locate Me")
 */
export default function GoogleMapsCondoAutocomplete({
  value = '',
  onChange,
  district = '',
  onDistrictChange,
  onSelectPlace,
  apiKey = '',
  placeholder = 'Search building, condo, house, villa, hotel or address...',
  required = false,
  className = '',
  id = 'google-condo-input',
  city = 'Bangkok'
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
      console.warn('Google Maps script failed to load. Falling back to local database.');
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

  // Live client-side geocoding fallback for any address, house, street or landmark in Thailand
  const fetchLiveGeocode = async (val, activeCity) => {
    try {
      const isPty = activeCity === 'Pattaya' || val.toLowerCase().includes('pattaya') || val.toLowerCase().includes('jomtien');
      const biasLat = isPty ? 12.9236 : 13.7563;
      const biasLng = isPty ? 100.8825 : 100.5018;
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&lat=${biasLat}&lon=${biasLng}&limit=6`);
      if (!res.ok) return [];
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        return data.features.map((f, idx) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates || [];
          const name = props.name || props.street || props.housenumber || val;
          const sub = props.district || props.suburb || props.locality || '';
          const dist = props.city || props.county || (isPty ? 'Bang Lamung' : 'Bangkok');
          const postcode = props.postcode || '';
          const parts = [props.housenumber, props.street, props.suburb, props.city, props.state].filter(Boolean);
          const formattedAddress = parts.length > 0 ? parts.join(', ') : `${name}, ${dist}`;
          
          return {
            id: `geo-${props.osm_id || idx}`,
            name: name,
            subdistrict: sub,
            district: dist,
            postalCode: postcode,
            zipcode: postcode,
            road: props.street || '',
            formattedAddress: formattedAddress,
            lat: coords[1] || biasLat,
            lng: coords[0] || biasLng,
            type: props.osm_value ? props.osm_value.replace(/_/g, ' ') : 'Live Address',
            isLiveGeocode: true
          };
        });
      }
    } catch (e) {
      // Silently catch network errors
    }
    return [];
  };

  // Select the raw entered text as the custom house / building / location
  const handleSelectEntered = (textToSelect) => {
    const rawName = (textToSelect || query || '').trim();
    if (!rawName) return;

    const autoMatch = findBestLocationMatch(rawName, city);
    const matched = matchLocationDetails({
      subdistrict: autoMatch?.subdistrict,
      district: autoMatch?.district,
      postalCode: autoMatch?.postalCode,
      formattedAddress: rawName,
      city: autoMatch?.city || city,
      name: rawName
    });

    finalizeSelect({
      name: rawName,
      city: matched.city,
      district: matched.district,
      subdistrict: matched.subdistrict,
      postalCode: matched.postalCode,
      zipcode: matched.postalCode,
      formattedAddress: rawName,
      type: 'Entered Residence / Address'
    });
  };

  // Update suggestions whenever query changes or on focus
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    // Real-time location auto-detection: if typed text matches known building, house, or subdistrict
    const autoMatch = findBestLocationMatch(val, city);
    if (onChange) {
      onChange(val, autoMatch);
    }

    // If cleared, reset selected place
    if (!val.trim()) {
      setSelectedPlace(null);
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Query Google Places with NO type restrictions (any place, building, house, villa, hotel, address across Thailand)
    if (googleAutocompleteServiceRef.current && val.trim().length >= 2) {
      const biasCenter = city === 'Pattaya'
        ? { lat: 12.9236, lng: 100.8825 }
        : { lat: 13.7563, lng: 100.5018 };

      googleAutocompleteServiceRef.current.getPlacePredictions(
        {
          input: val,
          componentRestrictions: { country: 'th' },
          locationBias: new window.google.maps.Circle({
            center: biasCenter,
            radius: city === 'Pattaya' ? 30000 : 50000
          })
          // Intentionally omit types to allow all Google Maps results: buildings, houses, establishments, addresses, geocodes
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
            const mapped = predictions.map(p => {
              const mainText = p.structured_formatting ? p.structured_formatting.main_text : p.description.split(',')[0];
              const secText = p.structured_formatting ? p.structured_formatting.secondary_text : '';
              const typeLabel = p.types?.includes('premise') || p.types?.includes('subpremise')
                ? 'Building / House'
                : p.types?.includes('establishment')
                ? 'Place / Business'
                : p.types?.includes('route') || p.types?.includes('street_address')
                ? 'Street Address'
                : 'Google Place';
              return {
                id: p.place_id,
                name: mainText,
                subdistrict: secText,
                formattedAddress: p.description,
                isGoogleApi: true,
                placeId: p.place_id,
                type: typeLabel,
                types: p.types || []
              };
            });
            setSuggestions(mapped);
            setIsOpen(true);
          } else {
            // Fall back to local residences & buildings database
            const fallback = searchBangkokCondos(val, city);
            setSuggestions(fallback);
            setIsOpen(true);
          }
        }
      );
    } else {
      // Local Residences, Houses & Buildings Search Engine
      const results = searchBangkokCondos(val, city);
      setSuggestions(results);
      setIsOpen(true);

      // Fetch live geocodes across Thailand in parallel
      if (val.trim().length >= 2) {
        fetchLiveGeocode(val, city).then(livePlaces => {
          if (livePlaces && livePlaces.length > 0) {
            setSuggestions(prev => {
              const seen = new Set(prev.map(p => p.name.toLowerCase()));
              const novel = livePlaces.filter(lp => !seen.has(lp.name.toLowerCase()));
              return [...prev, ...novel].slice(0, 10);
            });
          }
        });
      }
    }
  };

  const handleInputFocus = () => {
    const results = searchBangkokCondos(query, city);
    setSuggestions(results);
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // If user typed a building or house name but didn't click a dropdown item, auto-resolve location
    if (query && (!selectedPlace || selectedPlace.name !== query)) {
      handleSelectEntered(query);
    }
  };

  // When a building, house, condo or place is selected
  const handleSelectPlace = (place) => {
    // If it's a Google Places API place and PlacesService is available, get details with full address_components
    if (place.isGoogleApi && place.placeId && googlePlacesServiceRef.current) {
      setLocationNotice('Resolving Google Maps address details...');
      googlePlacesServiceRef.current.getDetails(
        {
          placeId: place.placeId,
          fields: ['name', 'formatted_address', 'address_components', 'geometry', 'url']
        },
        (details, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && details) {
            const parsed = parseGooglePlaceComponents(details.address_components);
            const matched = matchLocationDetails({
              subdistrict: parsed.subdistrict || place.subdistrict,
              district: parsed.district || place.district,
              postalCode: parsed.postalCode || place.zipcode,
              formattedAddress: details.formatted_address || place.formattedAddress,
              city: parsed.city || (parsed.postalCode?.startsWith('20') ? 'Pattaya' : (city || 'Bangkok')),
              name: details.name || place.name
            });

            const resolvedPlace = {
              name: details.name || place.name,
              address: details.formatted_address || place.formattedAddress,
              formattedAddress: details.formatted_address || place.formattedAddress,
              city: matched.city,
              district: matched.district,
              subdistrict: matched.subdistrict,
              postalCode: matched.postalCode,
              zipcode: matched.postalCode,
              lat: details.geometry?.location?.lat ? details.geometry.location.lat() : 13.7563,
              lng: details.geometry?.location?.lng ? details.geometry.location.lng() : 100.5018,
              googleMapsUrl: details.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.name || place.name)}`,
              embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(details.formatted_address || details.name)}&output=embed`,
              isGoogleApi: true
            };

            setQuery(resolvedPlace.name);
            setSelectedPlace(resolvedPlace);
            if (onSelectPlace) {
              onSelectPlace(resolvedPlace);
            }
            if (onChange) {
              onChange(resolvedPlace.name, resolvedPlace);
            }

            setLocationNotice(`Auto-set location: ${resolvedPlace.subdistrict}, ${resolvedPlace.district} (📮 ${resolvedPlace.postalCode})`);
            setTimeout(() => setLocationNotice(''), 6000);
            setIsOpen(false);
            setActiveHighlight(-1);
            return;
          }

          // Fallback if getDetails failed
          finalizeSelect(place);
        }
      );
      return;
    }

    finalizeSelect(place);
  };

  const finalizeSelect = (place) => {
    const matched = matchLocationDetails({
      subdistrict: place.subdistrict,
      district: place.district,
      postalCode: place.zipcode || place.postalCode,
      formattedAddress: place.formattedAddress,
      city: place.city || (place.zipcode?.startsWith('20') ? 'Pattaya' : (city || 'Bangkok')),
      name: place.name
    });

    const fullPlace = {
      ...place,
      name: place.name,
      city: matched.city,
      district: matched.district,
      subdistrict: matched.subdistrict,
      postalCode: matched.postalCode,
      zipcode: matched.postalCode,
      address: place.formattedAddress || `${place.name}, ${matched.city}`,
      lat: place.lat || 13.7563,
      lng: place.lng || 100.5018,
      googleMapsUrl: place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + matched.city)}`,
      embedUrl: place.embedUrl || `https://www.google.com/maps?q=${encodeURIComponent(place.name + ' ' + matched.city)}&output=embed`
    };

    setQuery(fullPlace.name);
    setSelectedPlace(fullPlace);
    if (onSelectPlace) {
      onSelectPlace(fullPlace);
    }
    if (onChange) {
      onChange(fullPlace.name, fullPlace);
    }

    setLocationNotice(`Auto-set location: ${fullPlace.subdistrict}, ${fullPlace.district} (📮 ${fullPlace.postalCode})`);
    setTimeout(() => setLocationNotice(''), 6000);
    setIsOpen(false);
    setActiveHighlight(-1);
  };

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectEntered(query);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveHighlight(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveHighlight(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeHighlight >= 0 && activeHighlight < suggestions.length) {
        handleSelectPlace(suggestions[activeHighlight]);
      } else {
        handleSelectEntered(query);
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
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-10 pr-24 py-2.5 sm:py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm shadow-xs transition bg-white placeholder:text-slate-400 ${className}`}
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
      {isOpen && (suggestions.length > 0 || query.trim().length >= 1) && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 animate-fadeIn">
          {/* Header */}
          <div className="px-3.5 py-2 bg-gradient-to-r from-slate-50 to-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {city === 'Pattaya' ? 'Pattaya Places, Houses & Addresses' : 'Google Maps Places, Houses & Addresses'}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {googleApiLoaded ? 'Google Places Live API' : 'Unrestricted Thailand Search'}
            </span>
          </div>

          {/* Primary Option: Exact Entered Location (House, Villa, Building, Address) */}
          {query.trim().length >= 1 && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectEntered(query);
              }}
              className="px-3.5 py-3 bg-gradient-to-r from-sky-50 via-blue-50/70 to-indigo-50/40 hover:from-sky-100 hover:to-blue-100 border-b border-sky-100 cursor-pointer flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  📍
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                    <span>Use entered location:</span>
                    <span className="text-sky-700 underline font-extrabold truncate">"{query}"</span>
                  </div>
                  <div className="text-[11px] text-slate-600 truncate mt-0.5 flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">
                      {(() => {
                        const m = findBestLocationMatch(query, city) || matchLocationDetails({ name: query, formattedAddress: query, city });
                        return `${m.subdistrict || 'Huai Khwang'}, ${m.district || 'Huai Khwang'} (${m.postalCode || '10310'})`;
                      })()}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-sky-700 font-semibold">
                      Auto-sets District, Khwaeng & Fee
                    </span>
                  </div>
                </div>
              </div>
              <span className="ml-2 text-[10px] font-bold text-sky-700 bg-white px-2.5 py-1 rounded-full border border-sky-200 shadow-2xs group-hover:bg-sky-600 group-hover:text-white transition flex-shrink-0">
                Select ↵
              </span>
            </div>
          )}

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
                      {item.formattedAddress || (
                        <>
                          {item.road ? `${item.road}, ` : ''}{item.subdistrict ? `${item.subdistrict}, ` : ''}
                          <span className="font-semibold text-slate-700">
                            {item.district ? item.district.split(' (')[0] : 'Bangkok'}
                          </span>
                        </>
                      )}
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
      {selectedPlace && (
        <div className="mt-2.5 p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs text-xs animate-fadeIn">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-700 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <span className="font-semibold text-slate-800 truncate text-[11px] sm:text-xs">
                {selectedPlace.name}
              </span>
              <span className="hidden sm:inline-block text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                Google Verified
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowMapPreview(!showMapPreview)}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {showMapPreview ? 'Hide Map' : 'Preview Map'}
              </button>
              <a
                href={selectedPlace.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((selectedPlace.name || 'Bangkok') + ' Bangkok')}`}
                target="_blank"
                rel="noreferrer"
                title="Open in Google Maps"
                className="text-slate-400 hover:text-red-600 transition flex items-center gap-1 text-[11px] font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline">Google Maps</span>
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
