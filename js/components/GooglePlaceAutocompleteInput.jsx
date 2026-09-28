import React, { useState, useEffect, useRef } from 'react';
import { BANGKOK_DISTRICTS } from '../data/servicesData.js';
import { laundryStore } from '../store.js';

// Comprehensive matcher for Bangkok districts from Google Places address components
export function extractBangkokDistrict(place) {
  if (!place) return null;

  const components = place.address_components || [];
  let foundDistrictKey = '';

  for (const c of components) {
    const types = c.types || [];
    // Check district level (administrative_area_level_2, sublocality_level_1, sublocality)
    if (
      types.includes('sublocality_level_1') ||
      types.includes('administrative_area_level_2') ||
      types.includes('sublocality') ||
      types.includes('locality')
    ) {
      const name = (c.long_name || c.short_name || '').toLowerCase();
      if (name.includes('watthana') || name.includes('wattana') || name.includes('วัฒนา') || name.includes('thonglor') || name.includes('ekkamai') || name.includes('phrom phong')) {
        foundDistrictKey = 'watthana';
        break;
      }
      if (name.includes('khlong toei') || name.includes('klong toey') || name.includes('คลองเตย') || name.includes('phra khanong') || name.includes('asok')) {
        foundDistrictKey = 'khlong toei';
        break;
      }
      if (name.includes('bang rak') || name.includes('bangrak') || name.includes('บางรัก') || name.includes('silom') || name.includes('surawong')) {
        foundDistrictKey = 'bang rak';
        break;
      }
      if (name.includes('sathon') || name.includes('sathorn') || name.includes('สาทร') || name.includes('chong nonsi')) {
        foundDistrictKey = 'sathon';
        break;
      }
      if (name.includes('pathum wan') || name.includes('pathumwan') || name.includes('ปทุมวัน') || name.includes('siam') || name.includes('chidlom') || name.includes('ploenchit')) {
        foundDistrictKey = 'pathum wan';
        break;
      }
      if (name.includes('phaya thai') || name.includes('phayathai') || name.includes('พญาไท') || name.includes('ari') || name.includes('sanam pao')) {
        foundDistrictKey = 'phaya thai';
        break;
      }
      if (name.includes('huai khwang') || name.includes('huaikhwang') || name.includes('ห้วยขวาง') || name.includes('ratchada') || name.includes('rama 9')) {
        foundDistrictKey = 'huai khwang';
        break;
      }
      if (name.includes('chatuchak') || name.includes('จตุจักร') || name.includes('mo chit') || name.includes('lat phrao')) {
        foundDistrictKey = 'chatuchak';
        break;
      }
      if (name.includes('din daeng') || name.includes('dindaeng') || name.includes('ดินแดง')) {
        foundDistrictKey = 'din daeng';
        break;
      }
      if (name.includes('yan nawa') || name.includes('yannawa') || name.includes('ยานนาวา') || name.includes('rama 3')) {
        foundDistrictKey = 'yan nawa';
        break;
      }
      if (name.includes('phra nakhon') || name.includes('phranakhon') || name.includes('พระนคร')) {
        foundDistrictKey = 'phra nakhon';
        break;
      }
    }
  }

  // Fallback: check formatted_address string directly
  if (!foundDistrictKey && place.formatted_address) {
    const addr = place.formatted_address.toLowerCase();
    if (addr.includes('watthana') || addr.includes('wattana') || addr.includes('วัฒนา')) foundDistrictKey = 'watthana';
    else if (addr.includes('khlong toei') || addr.includes('klong toey') || addr.includes('คลองเตย')) foundDistrictKey = 'khlong toei';
    else if (addr.includes('bang rak') || addr.includes('bangrak') || addr.includes('บางรัก')) foundDistrictKey = 'bang rak';
    else if (addr.includes('sathon') || addr.includes('sathorn') || addr.includes('สาทร')) foundDistrictKey = 'sathon';
    else if (addr.includes('pathum wan') || addr.includes('ปทุมวัน')) foundDistrictKey = 'pathum wan';
    else if (addr.includes('phaya thai') || addr.includes('พญาไท')) foundDistrictKey = 'phaya thai';
    else if (addr.includes('huai khwang') || addr.includes('ห้วยขวาง')) foundDistrictKey = 'huai khwang';
    else if (addr.includes('chatuchak') || addr.includes('จตุจักร')) foundDistrictKey = 'chatuchak';
    else if (addr.includes('din daeng') || addr.includes('ดินแดง')) foundDistrictKey = 'din daeng';
    else if (addr.includes('yan nawa') || addr.includes('ยานนาวา')) foundDistrictKey = 'yan nawa';
    else if (addr.includes('phra nakhon') || addr.includes('พระนคร')) foundDistrictKey = 'phra nakhon';
  }

  // Map found key to exact BANGKOK_DISTRICTS item
  if (foundDistrictKey === 'watthana') return BANGKOK_DISTRICTS[0];
  if (foundDistrictKey === 'khlong toei') return BANGKOK_DISTRICTS[1];
  if (foundDistrictKey === 'bang rak') return BANGKOK_DISTRICTS[2];
  if (foundDistrictKey === 'sathon') return BANGKOK_DISTRICTS[3];
  if (foundDistrictKey === 'pathum wan') return BANGKOK_DISTRICTS[4];
  if (foundDistrictKey === 'phaya thai') return BANGKOK_DISTRICTS[5];
  if (foundDistrictKey === 'huai khwang') return BANGKOK_DISTRICTS[6];
  if (foundDistrictKey === 'chatuchak') return BANGKOK_DISTRICTS[7];
  if (foundDistrictKey === 'din daeng') return BANGKOK_DISTRICTS[8];
  if (foundDistrictKey === 'yan nawa') return BANGKOK_DISTRICTS[9];
  if (foundDistrictKey === 'phra nakhon') return BANGKOK_DISTRICTS[10];

  return null;
}

export function GooglePlaceAutocompleteInput({
  value = '',
  onChange,
  onPlaceSelect,
  placeholder = 'e.g. The Estelle Phrom Phong, Ashton Silom, Rhythm Ekkamai',
  required = false,
  className = '',
  id
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [apiKey, setApiKey] = useState(() => laundryStore.settings?.googleMapsApiKey || '');
  const [isScriptLoaded, setIsScriptLoaded] = useState(() => {
    return Boolean(typeof window !== 'undefined' && window.google?.maps?.places);
  });
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState(null);
  const [apiKeyError, setApiKeyError] = useState(false);

  // Catch Google Maps authorization errors
  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn('Google Maps API authorization failure (gm_authFailure).');
      setApiKeyError(true);
    };
  }, []);

  // Sync API Key from laundryStore
  useEffect(() => {
    return laundryStore.subscribe(() => {
      const currentKey = laundryStore.settings?.googleMapsApiKey || '';
      if (currentKey !== apiKey) {
        setApiKey(currentKey);
        setApiKeyError(false);
      }
    });
  }, [apiKey]);

  // Dynamically load Google Maps script if API key is provided and script is not yet present
  useEffect(() => {
    if (!apiKey) return;

    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-places-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-places-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=th&region=TH`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = (e) => {
      console.warn('Failed to load Google Maps Places script:', e);
    };
    document.head.appendChild(script);
  }, [apiKey]);

  // Attach Google Places Autocomplete to input element
  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current || !window.google?.maps?.places) return;

    try {
      // Define Bangkok bounding box to bias suggestions to Bangkok
      const bangkokBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(13.50, 100.30), // Southwest Bangkok
        new window.google.maps.LatLng(14.05, 100.95)  // Northeast Bangkok
      );

      const options = {
        componentRestrictions: { country: 'th' },
        fields: ['name', 'address_components', 'formatted_address', 'geometry', 'url', 'place_id'],
        types: ['establishment', 'geocode'],
        bounds: bangkokBounds,
        strictBounds: false
      };

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, options);
      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place || !place.name) return;

        const condoName = place.name;
        const matchedDistrict = extractBangkokDistrict(place);
        const lat = place.geometry?.location ? place.geometry.location.lat() : null;
        const lng = place.geometry?.location ? place.geometry.location.lng() : null;
        
        let googleMapsUrl = place.url;
        if (!googleMapsUrl && lat && lng) {
          googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${place.place_id || ''}`;
        } else if (!googleMapsUrl) {
          googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(condoName + ' Bangkok')}`;
        }

        const placeResult = {
          condoName,
          district: matchedDistrict,
          googleMapsUrl,
          fullAddress: place.formatted_address || '',
          lat,
          lng,
          placeId: place.place_id
        };

        setSelectedPlaceInfo(placeResult);

        // Update raw input value
        if (onChange) {
          onChange({ target: { value: condoName } });
        }

        // Notify parent with enriched details
        if (onPlaceSelect) {
          onPlaceSelect(placeResult);
        }
      });
    } catch (err) {
      console.warn('Error attaching Google Places Autocomplete:', err);
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isScriptLoaded, onChange, onPlaceSelect]);

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            setSelectedPlaceInfo(null);
            if (onChange) onChange(e);
          }}
          placeholder={placeholder}
          required={required}
          className={className || "w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"}
        />

        {/* Leading Map Pin Icon (SVG to avoid emoji visual collision) */}
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        {/* Live Indicator: Verified via Google Places */}
        {selectedPlaceInfo && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-xs">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Google Maps Verified</span>
            </span>
          </div>
        )}
      </div>

      {/* Optional hint if Places API is not enabled */}
      {apiKeyError && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span>💡 สามารถพิมพ์ชื่อคอนโด หรือกดปุ่ม <strong>"📍 แชร์ตำแหน่ง GPS"</strong> / <strong>"🗺️ ปักหมุดบนแผนที่"</strong> ด้านล่างเพื่อระบุพิกัดได้ทันที</span>
        </div>
      )}

      {/* Status hint badge */}
      {!apiKeyError && isScriptLoaded ? (
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Google Places Auto-search enabled (Bangkok Condos)</span>
          </span>
          {selectedPlaceInfo?.district && (
            <span className="text-sky-600 font-semibold">
              District detected: {selectedPlaceInfo.district}
            </span>
          )}
        </div>
      ) : !apiKeyError && apiKey ? (
        <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Connecting to Google Places API...</span>
        </div>
      ) : null}
    </div>
  );
}
