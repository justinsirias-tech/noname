import React, { useState, useEffect, useRef } from 'react';
import { COUNTRY_LIST, parsePhoneNumber } from '../data/countriesData.js';

export function CountryPhoneInput({
  value = '',
  onChange,
  defaultCountryCode = 'TH',
  placeholder,
  required = false,
  disabled = false,
  className = '',
  id
}) {
  // Parse initial or incoming full value
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return parsePhoneNumber(value, defaultCountryCode).country;
  });
  
  const [nationalNumber, setNationalNumber] = useState(() => {
    return parsePhoneNumber(value, defaultCountryCode).nationalNumber;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  // Sync internal state if external value changes (e.g. resetting form or selecting different customer)
  useEffect(() => {
    const parsed = parsePhoneNumber(value, defaultCountryCode);
    setSelectedCountry(parsed.country);
    setNationalNumber(parsed.nationalNumber);
  }, [value, defaultCountryCode]);

  // Handle outside click & Esc key to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        e.stopPropagation();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus search input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter countries by name or dial code
  const filteredCountries = COUNTRY_LIST.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const cleanDial = c.dialCode.replace('+', '').toLowerCase();
    const cleanQ = q.replace('+', '');
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      cleanDial.startsWith(cleanQ)
    );
  });

  // Handle changing country from dropdown
  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');

    // Emit updated combined phone number
    const updatedFull = nationalNumber.trim() 
      ? `${country.dialCode} ${nationalNumber.trim()}`
      : country.dialCode + ' ';
      
    if (onChange) {
      onChange(updatedFull, country, nationalNumber);
    }

    // Focus phone input
    if (phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  };

  // Handle typing in phone number input
  const handlePhoneChange = (e) => {
    const inputVal = e.target.value;

    // Check if user pasted a full number with a + prefix
    if (inputVal.trim().startsWith('+')) {
      const parsed = parsePhoneNumber(inputVal, selectedCountry.code);
      setSelectedCountry(parsed.country);
      setNationalNumber(parsed.nationalNumber);
      if (onChange) {
        onChange(inputVal.trim(), parsed.country, parsed.nationalNumber);
      }
      return;
    }

    setNationalNumber(inputVal);

    const fullNumber = inputVal.trim() 
      ? `${selectedCountry.dialCode} ${inputVal.trim()}`
      : '';

    if (onChange) {
      onChange(fullNumber, selectedCountry, inputVal);
    }
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`} ref={dropdownRef}>
      
      {/* Country Code Trigger Button (matches screenshot: TH +66 ⌵) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className="h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-between gap-1.5 transition shadow-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500"
        title="Select Country Calling Code"
      >
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-800 tracking-tight">{selectedCountry.code}</span>
          <span className="font-mono text-slate-600 font-bold">{selectedCountry.dialCode}</span>
        </div>
        <svg 
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-sky-600' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* National Phone Number Input */}
      <div className="relative flex-1 min-w-0">
        <input
          ref={phoneInputRef}
          type="tel"
          id={id}
          required={required}
          disabled={disabled}
          placeholder={placeholder || selectedCountry.placeholder || '08x-xxx-xxxx'}
          value={nationalNumber}
          onChange={handlePhoneChange}
          className="w-full h-10 px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm placeholder:font-mono placeholder:font-normal placeholder:text-slate-400"
        />
      </div>

      {/* Searchable Country Dropdown Popup */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
          
          {/* Search Header */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-0.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Countries Scrollable List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100/60 custom-scrollbar">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = country.code === selectedCountry.code;
                return (
                  <button
                    key={`${country.code}-${country.dialCode}`}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition ${
                      isSelected 
                        ? 'bg-sky-50 text-sky-900 font-bold' 
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-bold text-[11px] text-slate-600 w-12 shrink-0 font-mono">
                        {country.code}
                      </span>
                      <span className="truncate font-medium text-slate-800">
                        {country.name}
                      </span>
                    </div>

                    <span className="font-mono text-slate-500 font-semibold text-xs shrink-0 ml-2">
                      {country.dialCode}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No country found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Quick Footer Helper */}
          <div className="px-3 py-1.5 bg-slate-50/80 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{filteredCountries.length} countries</span>
            <span>Press Esc to close</span>
          </div>

        </div>
      )}

    </div>
  );
}
