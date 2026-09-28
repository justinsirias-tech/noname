import React, { useState, useEffect, useRef } from 'react';
import { BANGKOK_DISTRICTS } from '../data/servicesData.js';
import { laundryStore } from '../store.js';

// Helper to extract Bangkok district from Nominatim or reverse geocoding data
export function matchBangkokDistrictFromText(text = '') {
  if (!text) return null;
  const lower = text.toLowerCase();

  if (lower.includes('watthana') || lower.includes('wattana') || lower.includes('วัฒนา') || lower.includes('thonglor') || lower.includes('ekkamai') || lower.includes('phrom phong')) {
    return BANGKOK_DISTRICTS[0];
  }
  if (lower.includes('khlong toei') || lower.includes('klong toey') || lower.includes('คลองเตย') || lower.includes('phra khanong') || lower.includes('asok')) {
    return BANGKOK_DISTRICTS[1];
  }
  if (lower.includes('bang rak') || lower.includes('bangrak') || lower.includes('บางรัก') || lower.includes('silom') || lower.includes('surawong')) {
    return BANGKOK_DISTRICTS[2];
  }
  if (lower.includes('sathon') || lower.includes('sathorn') || lower.includes('สาทร') || lower.includes('chong nonsi')) {
    return BANGKOK_DISTRICTS[3];
  }
  if (lower.includes('pathum wan') || lower.includes('pathumwan') || lower.includes('ปทุมวัน') || lower.includes('siam') || lower.includes('chidlom') || lower.includes('ploenchit')) {
    return BANGKOK_DISTRICTS[4];
  }
  if (lower.includes('phaya thai') || lower.includes('phayathai') || lower.includes('พญาไท') || lower.includes('ari') || lower.includes('sanam pao')) {
    return BANGKOK_DISTRICTS[5];
  }
  if (lower.includes('huai khwang') || lower.includes('huaikhwang') || lower.includes('ห้วยขวาง') || lower.includes('ratchada') || lower.includes('rama 9')) {
    return BANGKOK_DISTRICTS[6];
  }
  if (lower.includes('chatuchak') || lower.includes('จตุจักร') || lower.includes('mo chit') || lower.includes('lat phrao')) {
    return BANGKOK_DISTRICTS[7];
  }
  if (lower.includes('din daeng') || lower.includes('ดินแดง')) {
    return BANGKOK_DISTRICTS[8];
  }
  if (lower.includes('yan nawa') || lower.includes('yannawa') || lower.includes('ยานนาวา') || lower.includes('rama 3')) {
    return BANGKOK_DISTRICTS[9];
  }
  if (lower.includes('phra nakhon') || lower.includes('พระนคร')) {
    return BANGKOK_DISTRICTS[10];
  }

  return null;
}

// Helper to extract coordinates from URL or string
export function extractCoordsFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  // 1. Matches ?q=13.7367,100.5606 or &query=13.7367,100.5606
  const qMatch = url.match(/[?&](?:q|query)=([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }
  
  // 2. Matches /@13.7367,100.5606
  const atMatch = url.match(/@([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }
  
  // 3. Matches raw "13.7367, 100.5606"
  const rawMatch = url.trim().match(/^([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)$/);
  if (rawMatch) {
    return { lat: parseFloat(rawMatch[1]), lng: parseFloat(rawMatch[2]) };
  }
  
  return null;
}

// Bangkok Central Default (Sukhumvit / Asok)
const DEFAULT_BANGKOK_LAT = 13.736717;
const DEFAULT_BANGKOK_LNG = 100.560632;

export function LocationPicker({
  value = '',
  onChange,
  onLocationSelect,
  initialDistrict = '',
  label = 'Google Maps Location & Condo Pin (ปักหมุดที่ตั้ง หรือแชร์พิกัด GPS)',
  required = false
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [confirmedCoords, setConfirmedCoords] = useState(() => extractCoordsFromUrl(value));
  const [detectedAddress, setDetectedAddress] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Sync internal coords if value prop changes externally
  useEffect(() => {
    const parsed = extractCoordsFromUrl(value);
    if (parsed) {
      setConfirmedCoords(parsed);
    }
  }, [value]);

  // Handle HTML5 Geolocation (Share Location / GPS)
  const handleShareCurrentLocation = () => {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('เบราว์เซอร์ของคุณไม่รองรับการระบุพิกัด GPS');
      return;
    }

    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

        setConfirmedCoords({ lat, lng });
        if (onChange) onChange(mapsUrl);

        // Reverse geocode to find address and district
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'th,en' } }
          );
          if (resp.ok) {
            const data = await resp.json();
            const displayName = data.display_name || '';
            const district = matchBangkokDistrictFromText(
              (data.address?.suburb || '') + ' ' +
              (data.address?.city_district || '') + ' ' +
              (data.address?.quarter || '') + ' ' +
              displayName
            );
            const condoName = data.address?.building || data.address?.leisure || data.address?.amenity || data.name || '';
            setDetectedAddress(displayName);

            if (onLocationSelect) {
              onLocationSelect({
                lat,
                lng,
                googleMapsUrl: mapsUrl,
                district,
                condoName,
                fullAddress: displayName
              });
            }
          } else {
            if (onLocationSelect) {
              onLocationSelect({ lat, lng, googleMapsUrl: mapsUrl });
            }
          }
        } catch (e) {
          console.warn('Reverse geocode error:', e);
          if (onLocationSelect) {
            onLocationSelect({ lat, lng, googleMapsUrl: mapsUrl });
          }
        } finally {
          setIsLocatingGps(false);
        }
      },
      (err) => {
        setIsLocatingGps(false);
        let msg = 'ไม่สามารถดึงตำแหน่ง GPS ได้';
        if (err.code === 1) {
          msg = 'กรุณากดอนุญาต (Allow) การเข้าถึงตำแหน่งในเบราว์เซอร์ หรือเลือกกด "ปักหมุดบน Google Maps" แทน';
        } else if (err.code === 2) {
          msg = 'สัญญาณ GPS ขัดข้อง หรือไม่พร้อมใช้งาน';
        } else if (err.code === 3) {
          msg = 'หมดเวลารอพิกัด GPS กรุณาลองใหม่อีกครั้ง';
        }
        setGpsError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleClearLocation = () => {
    setConfirmedCoords(null);
    setDetectedAddress('');
    if (onChange) onChange('');
    if (onLocationSelect) {
      onLocationSelect({
        lat: null,
        lng: null,
        googleMapsUrl: '',
        district: null,
        condoName: '',
        fullAddress: ''
      });
    }
  };

  const handleModalConfirm = ({ lat, lng, googleMapsUrl, district, condoName, fullAddress }) => {
    setConfirmedCoords({ lat, lng });
    setDetectedAddress(fullAddress);
    if (onChange) onChange(googleMapsUrl);
    if (onLocationSelect) {
      onLocationSelect({ lat, lng, googleMapsUrl, district, condoName, fullAddress });
    }
    setIsModalOpen(false);
  };

  const hasLocation = Boolean(value && value.trim());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-[11px] text-sky-600 hover:text-sky-700 underline font-medium"
        >
          {showManualInput ? 'ซ่อนช่องระบุลิงก์ข้อความ' : 'วางลิงก์หรือพิมพ์จุดสังเกตเอง'}
        </button>
      </div>

      {/* Confirmed Location Badge Card */}
      {hasLocation ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 to-sky-50/90 border border-emerald-200/90 shadow-xs transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs text-base">
                📍
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-900">
                    ปักหมุดตำแหน่งเรียบร้อยแล้ว (Google Maps Confirmed)
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                {detectedAddress ? (
                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                    {detectedAddress}
                  </p>
                ) : confirmedCoords ? (
                  <p className="text-xs text-slate-600 font-mono">
                    พิกัด GPS: {confirmedCoords.lat.toFixed(5)}, {confirmedCoords.lng.toFixed(5)}
                  </p>
                ) : (
                  <p className="text-xs text-slate-600 truncate max-w-xs sm:max-w-md">
                    {value}
                  </p>
                )}
                <div className="pt-1">
                  <a
                    href={value.startsWith('http') ? value : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 hover:text-sky-800 underline"
                  >
                    <span>เปิดดูตำแหน่งใน Google Maps</span>
                    <svg className="w-3.5 h-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition flex items-center gap-1"
                title="แก้ไขหมุด"
              >
                <span>📍</span>
                <span>เปลี่ยนหมุด</span>
              </button>
              <button
                type="button"
                onClick={handleClearLocation}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold shadow-2xs transition"
                title="ลบหมุด"
              >
                ✕ ลบ
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Action Buttons: Share GPS & Pin on Google Map */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Share Current Location (GPS) */}
          <button
            type="button"
            onClick={handleShareCurrentLocation}
            disabled={isLocatingGps}
            className="w-full py-3 px-4 rounded-xl border border-sky-300 bg-sky-50/70 hover:bg-sky-100 text-sky-900 font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:border-sky-400 active:scale-[0.99] transition disabled:opacity-60"
          >
            {isLocatingGps ? (
              <>
                <svg className="animate-spin w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>กำลังดึงพิกัด GPS ปัจจุบัน...</span>
              </>
            ) : (
              <>
                <span className="text-base">📍</span>
                <span>แชร์ตำแหน่งปัจจุบัน (Share Location / GPS)</span>
              </>
            )}
          </button>

          {/* Interactive Google Map Pinning */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:border-slate-400 active:scale-[0.99] transition"
          >
            <span className="text-base text-red-500">🗺️</span>
            <span>ปักหมุดบน Google Maps</span>
          </button>
        </div>
      )}

      {/* GPS Error Alert */}
      {gpsError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 shadow-xs">
          <span className="text-sm">⚠️</span>
          <div className="space-y-1">
            <span className="font-semibold block">{gpsError}</span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-[11px] font-bold text-sky-700 underline block"
            >
              👉 กดที่นี่เพื่อเปิด Google Maps และเลือกปักหมุดด้วยตนเอง
            </button>
          </div>
        </div>
      )}

      {/* Manual Input (Toggleable / Fallback) */}
      {showManualInput && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 animate-fadeIn">
          <label className="block text-[11px] font-semibold text-slate-600">
            วางลิงก์ Google Maps หรือระบุจุดสังเกตเพิ่มเติม (Paste URL or Landmark Note):
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              if (onChange) onChange(e.target.value);
            }}
            placeholder="e.g. https://maps.app.goo.gl/... หรือ ซอยสุขุมวิท 39 ข้าง 7-Eleven"
            className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white transition"
          />
        </div>
      )}

      {/* Google Maps Interactive Modal Dialog */}
      {isModalOpen && (
        <GoogleMapsModal
          initialCoords={confirmedCoords}
          initialDistrict={initialDistrict}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
}

// Google Maps Interactive Modal Component
function GoogleMapsModal({ initialCoords, initialDistrict, onClose, onConfirm }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const roadmapLayerRef = useRef(null);
  const hybridLayerRef = useRef(null);

  const startLat = initialCoords?.lat || DEFAULT_BANGKOK_LAT;
  const startLng = initialCoords?.lng || DEFAULT_BANGKOK_LNG;

  const [currentCoords, setCurrentCoords] = useState({ lat: startLat, lng: startLng });
  const [addressPreview, setAddressPreview] = useState('กำลังโหลดข้อมูลที่อยู่...');
  const [detectedDistrict, setDetectedDistrict] = useState(initialDistrict || '');
  const [detectedCondo, setDetectedCondo] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapLayerType, setMapLayerType] = useState('roadmap'); // 'roadmap' or 'hybrid'

  // Search places state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Perform reverse geocoding
  const fetchAddress = async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'th,en' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        const fullAddr = data.display_name || `พิกัด ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setAddressPreview(fullAddr);

        const district = matchBangkokDistrictFromText(
          (data.address?.suburb || '') + ' ' +
          (data.address?.city_district || '') + ' ' +
          (data.address?.quarter || '') + ' ' +
          fullAddr
        );
        if (district) {
          setDetectedDistrict(district);
        }

        const condo = data.address?.building || data.address?.leisure || data.address?.amenity || data.name || '';
        if (condo) {
          setDetectedCondo(condo);
        }
      } else {
        setAddressPreview(`พิกัด: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch (err) {
      console.warn('Reverse geocode failed:', err);
      setAddressPreview(`พิกัด: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Initialize Google Maps Tiles Layer & Draggable Marker
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof window === 'undefined' || !window.L) {
      console.warn('Leaflet map engine (window.L) is not loaded.');
      return;
    }

    const L = window.L;

    // Authentic Google Maps Red Location Pin SVG
    const googlePinIcon = L.divIcon({
      className: 'google-maps-red-pin',
      html: `
        <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: grab; user-select: none;">
          <div style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.45));">
            <svg width="40" height="54" viewBox="0 0 384 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z" fill="#EA4335"/>
              <path d="M192 288c53.02 0 96-42.98 96-96s-42.98-96-96-96-96 42.98-96 96 42.98 96 96 96z" fill="#C5221F"/>
              <circle cx="192" cy="192" r="58" fill="#FFFFFF"/>
              <circle cx="192" cy="192" r="28" fill="#EA4335"/>
            </svg>
          </div>
          <div style="width: 16px; height: 6px; background: radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; margin-top: -3px;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false // Replace default attribution with official Google brand mark
    });
    mapInstanceRef.current = map;

    // Add zoom controls to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Google Maps Roadmap Layer (Standard Bangkok Google Maps with Thai labels)
    const googleRoadmap = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&hl=th&gl=TH&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20
    });
    roadmapLayerRef.current = googleRoadmap;

    // Google Maps Hybrid Layer (Satellite + Roads with Thai labels)
    const googleHybrid = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&hl=th&gl=TH&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20
    });
    hybridLayerRef.current = googleHybrid;

    // Default to Google Roadmap
    googleRoadmap.addTo(map);

    // Add draggable Google Maps red pin marker
    const marker = L.marker([startLat, startLng], {
      draggable: true,
      icon: googlePinIcon,
      title: 'Google Maps Pin'
    }).addTo(map);
    markerRef.current = marker;

    // Marker drag event
    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setCurrentCoords({ lat: pos.lat, lng: pos.lng });
      fetchAddress(pos.lat, pos.lng);
    });

    // Map click event
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setCurrentCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      fetchAddress(e.latlng.lat, e.latlng.lng);
    });

    // Invalidate size to ensure proper tile layout inside modal
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    // Initial address fetch
    fetchAddress(startLat, startLng);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Layer Toggle: Roadmap vs Satellite Hybrid
  const toggleMapLayer = (type) => {
    if (!mapInstanceRef.current) return;
    setMapLayerType(type);

    if (type === 'hybrid') {
      if (roadmapLayerRef.current && mapInstanceRef.current.hasLayer(roadmapLayerRef.current)) {
        mapInstanceRef.current.removeLayer(roadmapLayerRef.current);
      }
      if (hybridLayerRef.current) {
        hybridLayerRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      if (hybridLayerRef.current && mapInstanceRef.current.hasLayer(hybridLayerRef.current)) {
        mapInstanceRef.current.removeLayer(hybridLayerRef.current);
      }
      if (roadmapLayerRef.current) {
        roadmapLayerRef.current.addTo(mapInstanceRef.current);
      }
    }
  };

  // Search Bangkok places with Google Places Autocomplete or Nominatim fallback
  const handleSearchPlaces = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);

    // If Google Places Autocomplete Service is available in window
    if (window.google?.maps?.places?.AutocompleteService) {
      try {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({
          input: query,
          componentRestrictions: { country: 'th' },
          location: new window.google.maps.LatLng(DEFAULT_BANGKOK_LAT, DEFAULT_BANGKOK_LNG),
          radius: 40000
        }, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
            setSearchResults(predictions.map(p => ({
              name: p.structured_formatting?.main_text || p.description,
              display_name: p.description,
              place_id: p.place_id,
              isGooglePlace: true
            })));
            setShowSearchResults(true);
            setIsSearching(false);
            return;
          }
          // Fallback to nominatim if Google has no predictions
          fallbackNominatimSearch(query);
        });
        return;
      } catch (err) {
        console.warn('Google places service error, falling back:', err);
      }
    }

    fallbackNominatimSearch(query);
  };

  const fallbackNominatimSearch = async (query) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=100.3,13.95,100.9,13.55&bounded=0&countrycodes=th&limit=6&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'th,en' } });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowSearchResults(true);
      }
    } catch (e) {
      console.warn('Search places error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    // If it's a Google Place with place_id and Google Places library is ready
    if (result.isGooglePlace && result.place_id && window.google?.maps?.places?.PlacesService) {
      try {
        const dummyDiv = document.createElement('div');
        const placesService = new window.google.maps.places.PlacesService(dummyDiv);
        placesService.getDetails({
          placeId: result.place_id,
          fields: ['geometry', 'formatted_address', 'name', 'address_components']
        }, (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            applyCoordinates(lat, lng, place.formatted_address || result.display_name, place.name || result.name);
          } else {
            // fallback
            fallbackGeocodeName(result.display_name);
          }
        });
        setShowSearchResults(false);
        setSearchQuery(result.name);
        return;
      } catch (err) {
        console.warn('PlacesService details error:', err);
      }
    }

    // Standard lat/lon result
    if (result.lat && result.lon) {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      applyCoordinates(lat, lng, result.display_name, result.name || result.display_name.split(',')[0]);
      setShowSearchResults(false);
      setSearchQuery(result.name || result.display_name.split(',')[0]);
    }
  };

  const fallbackGeocodeName = async (query) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data[0]) {
          applyCoordinates(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name, query);
        }
      }
    } catch (e) {
      console.warn('Fallback geocode failed:', e);
    }
  };

  const applyCoordinates = (lat, lng, fullAddress, condoName) => {
    setCurrentCoords({ lat, lng });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }

    setAddressPreview(fullAddress || `พิกัด ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    const district = matchBangkokDistrictFromText(fullAddress || '');
    if (district) setDetectedDistrict(district);
    if (condoName) setDetectedCondo(condoName);
  };

  // Fly to GPS location button
  const handleFlyToUserGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentCoords({ lat, lng });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        fetchAddress(lat, lng);
      },
      (err) => {
        console.warn('Fly to GPS error:', err);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleConfirmLocation = () => {
    const mapsUrl = `https://www.google.com/maps?q=${currentCoords.lat.toFixed(6)},${currentCoords.lng.toFixed(6)}`;
    onConfirm({
      lat: currentCoords.lat,
      lng: currentCoords.lng,
      googleMapsUrl: mapsUrl,
      district: detectedDistrict,
      condoName: detectedCondo,
      fullAddress: addressPreview
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-base">
              📍
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <span>ปักหมุดบน Google Maps</span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
                  Google Map
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                ลากหมุดแดง หรือคลิกบนแผนที่ Google Maps เพื่อระบุจุดที่ต้องการให้ไปรับ-ส่งผ้า
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Search Bar inside Modal */}
        <div className="p-3 bg-white border-b border-slate-100 relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearchPlaces(e.target.value);
              }}
              placeholder="🔍 ค้นหาคอนโด, ซอย, หรือสถานที่ในกรุงเทพฯ บน Google Maps..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <svg className="animate-spin w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-3 right-3 top-14 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-red-50/60 text-xs text-slate-800 flex items-start gap-2.5 transition"
                >
                  <span className="text-red-500 mt-0.5 text-sm">📍</span>
                  <div>
                    <strong className="block text-slate-900 font-semibold">{res.name || res.display_name.split(',')[0]}</strong>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{res.display_name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Google Maps Container Area */}
        <div className="relative flex-1 min-h-[350px] sm:min-h-[420px]">
          <div ref={mapContainerRef} className="w-full h-full min-h-[350px] sm:min-h-[420px]" />

          {/* Map Layer Switcher: Roadmap vs Satellite */}
          <div className="absolute top-3 left-3 z-[400] flex items-center bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-md border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => toggleMapLayer('roadmap')}
              className={`px-3 py-1.5 rounded-lg transition ${mapLayerType === 'roadmap' ? 'bg-red-500 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
            >
              🗺️ แผนที่
            </button>
            <button
              type="button"
              onClick={() => toggleMapLayer('hybrid')}
              className={`px-3 py-1.5 rounded-lg transition ${mapLayerType === 'hybrid' ? 'bg-red-500 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
            >
              🛰️ ดาวเทียม
            </button>
          </div>

          {/* Floating Action Button: Go to Current GPS */}
          <div className="absolute top-3 right-3 z-[400]">
            <button
              type="button"
              onClick={handleFlyToUserGps}
              className="px-3 py-2 rounded-xl bg-white/95 backdrop-blur-xs text-slate-800 hover:text-red-600 text-xs font-bold shadow-md border border-slate-200/80 flex items-center gap-1.5 transition active:scale-95"
              title="ไปยังตำแหน่ง GPS ของฉัน"
            >
              <span>🎯</span>
              <span>ตำแหน่งของฉัน (GPS)</span>
            </button>
          </div>

          {/* Floating Help Badge */}
          <div className="absolute bottom-8 left-3 z-[400] pointer-events-none">
            <div className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] sm:text-[11px] py-1.5 px-3 rounded-lg shadow-md flex items-center gap-1.5">
              <span>💡</span>
              <span>คลิกหรือลากหมุดแดงไปยังทางเข้าคอนโด / จุดส่งผ้า</span>
            </div>
          </div>

          {/* Official Google Brand Logo in Bottom Left */}
          <div className="absolute bottom-2 left-2 z-[400] pointer-events-none select-none bg-white/85 px-2 py-0.5 rounded shadow-xs backdrop-blur-xs flex items-center gap-1">
            <img
              src="https://maps.gstatic.com/mapfiles/api-3/images/google4.png"
              alt="Google"
              className="h-4 w-auto"
            />
          </div>

          {/* Copyright Notice Bottom Right */}
          <div className="absolute bottom-2 right-2 z-[400] pointer-events-none select-none text-[9px] text-slate-600 bg-white/85 px-1.5 py-0.5 rounded shadow-xs backdrop-blur-xs">
            © Google Maps
          </div>
        </div>

        {/* Footer Address Preview & Confirmation */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-3">
          <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-red-950 flex items-center gap-1">
                <span>📍 หมุดตำแหน่งปัจจุบัน (Google Maps):</span>
                {isReverseGeocoding && <span className="text-slate-400 font-normal">(กำลังอ่านที่อยู่...)</span>}
              </span>
              {detectedDistrict && (
                <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold text-[10px]">
                  เขต: {detectedDistrict}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
              {addressPreview}
            </p>
            <div className="text-[10px] text-slate-500 font-mono">
              Lat: {currentCoords.lat.toFixed(6)}, Lng: {currentCoords.lng.toFixed(6)}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md shadow-red-600/25 active:scale-[0.99] transition flex items-center gap-1.5"
            >
              <span>✓ ยืนยันหมุดตำแหน่งนี้</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
