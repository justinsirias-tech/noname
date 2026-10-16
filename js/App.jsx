import React, { useState, useEffect } from 'react';
import { laundryStore, CONTACT_CHANNELS } from './store.js';
import { Navbar } from './components/Navbar.jsx';
import { Hero } from './components/Hero.jsx';
import { DigitalSupportBanner } from './components/DigitalSupportBanner.jsx';
import { ServicesSection } from './components/ServicesSection.jsx';
import { HowItWorks } from './components/HowItWorks.jsx';
import { BookingWizard } from './components/BookingWizard.jsx';
import { OrderTracker } from './components/OrderTracker.jsx';
import { TermsAndConditions } from './components/TermsAndConditions.jsx';
import { AdminPOS } from './components/AdminPOS.jsx';
import { AdminLogin } from './components/AdminLogin.jsx';
import { DigitalContactModal } from './components/DigitalContactModal.jsx';
import { CoverageSection } from './components/CoverageSection.jsx';
import { CustomerReviews } from './components/CustomerReviews.jsx';
import { FaqSection } from './components/FaqSection.jsx';
import { CustomerRegister } from './components/CustomerRegister.jsx';
import { CustomerLogin } from './components/CustomerLogin.jsx';
import { CustomerPortal } from './components/CustomerPortal.jsx';
import { Footer } from './components/Footer.jsx';
import { Icon } from './components/Icons.jsx';
import { LanguageContext, translations } from './i18n.jsx';

const getInitialUrlParams = () => {
  if (typeof window === 'undefined') return { view: 'home', trackingId: '', openPayment: false, city: 'Bangkok' };
  try {
    const url = new URL(window.location.href);
    const trackId = url.searchParams.get('track') || url.searchParams.get('order') || url.searchParams.get('id') || '';
    const payParam = url.searchParams.get('pay');
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();

    // Detect localized city from pathname
    let city = 'Bangkok';
    if (path.includes('pattaya')) {
      city = 'Pattaya';
    } else if (path.includes('bangkok')) {
      city = 'Bangkok';
    }

    const openPayment = payParam === '1' || payParam === 'true' || hash === 'pay';
    let view = 'home';
    if (trackId || hash === 'track' || path === 'track') {
      view = 'track';
    } else if (hash === 'admin' || path === 'admin') {
      view = 'admin';
    } else if (hash === 'services' || path === 'services') {
      view = 'services';
    } else if (hash === 'terms' || path === 'terms') {
      view = 'terms';
    } else if (hash === 'book' || path === 'book') {
      view = 'book';
    } else if (hash === 'faq' || path === 'faq') {
      view = 'faq';
    } else if (['how-it-works', 'coverage', 'reviews'].includes(hash) || ['how-it-works', 'coverage', 'reviews'].includes(path)) {
      view = 'home';
    } else if (hash === 'login' || path === 'login') {
      view = 'login';
    } else if (hash === 'register' || path === 'register') {
      view = 'register';
    } else if (hash === 'portal' || path === 'portal') {
      view = 'portal';
    }
    return { view, trackingId: trackId, openPayment, city };
  } catch (e) {
    return { view: 'home', trackingId: '', openPayment: false, city: 'Bangkok' };
  }
};

export function App() {
  const initialParams = getInitialUrlParams();
  const [currentView, setCurrentView] = useState(initialParams.view);
  const [currentCity, setCurrentCity] = useState(initialParams.city || 'Bangkok');
  const [language, setLanguageState] = useState(() => {
    try {
      return (typeof localStorage !== 'undefined' && localStorage.getItem('noname_language')) || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('noname_language', lang);
      }
    } catch (e) {}
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };
  const [storeState, setStoreState] = useState(() => ({
    services: [...laundryStore.services],
    categories: [...(laundryStore.categories || [])],
    orders: [...laundryStore.orders],
    incidents: [...laundryStore.incidents],
    settings: { ...laundryStore.settings }
  }));

  // Admin Authentication State (supports localStorage and sessionStorage)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return (typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('noname_admin_token'))) ||
           (typeof sessionStorage !== 'undefined' && Boolean(sessionStorage.getItem('noname_admin_token')));
  });
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const savedUser = 
        (typeof localStorage !== 'undefined' && localStorage.getItem('noname_admin_user')) ||
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('noname_admin_user'));
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      if (parsed) {
        if (
          (parsed.email && parsed.email.toLowerCase() === 'justin.sirias@gmail.com') ||
          (parsed.username && parsed.username.toLowerCase() === 'test@nonamelaundry.com') ||
          (parsed.fullName && parsed.fullName.toLowerCase().includes('justin'))
        ) {
          parsed.role = 'super_admin';
          parsed.permissions = [
            'orders', 'sales-reconciliation', 'users', 'crm', 'faq',
            'services-pricing', 'postal-rates', 'gateway', 'line-oa', 'incidents', 'new-pos'
          ];
          try {
            if (typeof localStorage !== 'undefined') localStorage.setItem('noname_admin_user', JSON.stringify(parsed));
            if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('noname_admin_user', JSON.stringify(parsed));
          } catch (e) {}
        }
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  // Booking Flow parameters
  const [bookingPrefillService, setBookingPrefillService] = useState(null);
  const [bookingPrefillWeight, setBookingPrefillWeight] = useState(null);
  const [bookingPrefillItems, setBookingPrefillItems] = useState(null);
  const [bookingPrefillSpeed, setBookingPrefillSpeed] = useState('standard_48h');
  const [activeTrackingId, setActiveTrackingId] = useState(initialParams.trackingId);
  const [initialOpenPayment, setInitialOpenPayment] = useState(initialParams.openPayment);

  // Modals & Notifications
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Customer Authentication & Profile State
  const [currentCustomer, setCurrentCustomer] = useState(() => laundryStore.getCurrentCustomer());
  const [prefillCustomer, setPrefillCustomer] = useState(null);

  // Verify stored admin token on mount
  useEffect(() => {
    const token = 
      (typeof localStorage !== 'undefined' && localStorage.getItem('noname_admin_token')) ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('noname_admin_token'));
    if (token) {
      setIsAdminAuthenticated(true);
      laundryStore.setAdminToken(token);

      fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401 && !token.startsWith('local_admin_session_')) {
            handleAdminLogout(false);
          }
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.authenticated && data.user) {
          const u = data.user;
          if (
            (u.email && u.email.toLowerCase() === 'justin.sirias@gmail.com') ||
            (u.username && u.username.toLowerCase() === 'test@nonamelaundry.com') ||
            (u.fullName && u.fullName.toLowerCase().includes('justin'))
          ) {
            u.role = 'super_admin';
            u.permissions = [
              'orders', 'sales-reconciliation', 'users', 'crm', 'faq',
              'services-pricing', 'postal-rates', 'gateway', 'line-oa', 'incidents', 'new-pos'
            ];
          }
          setIsAdminAuthenticated(true);
          setAdminUser(u);
          laundryStore.setAdminToken(token);
          try {
            if (typeof localStorage !== 'undefined') localStorage.setItem('noname_admin_user', JSON.stringify(u));
            if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('noname_admin_user', JSON.stringify(u));
          } catch (e) {}
        }
      })
      .catch(() => {
        // Backend API offline or static server mode - retain local session
        setIsAdminAuthenticated(true);
        laundryStore.setAdminToken(token);
      });
    }
  }, []);

  const handleAdminLogin = (loginData) => {
    setIsAdminAuthenticated(true);
    setAdminUser(loginData.user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('noname_admin_token', loginData.token);
      localStorage.setItem('noname_admin_user', JSON.stringify(loginData.user));
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('noname_admin_token', loginData.token);
      sessionStorage.setItem('noname_admin_user', JSON.stringify(loginData.user));
    }
    laundryStore.setAdminToken(loginData.token);
    triggerToast(`Welcome, ${loginData.user.username}! Admin session authenticated.`);
  };

  const handleAdminLogout = (redirectToHome = true) => {
    const token = 
      (typeof localStorage !== 'undefined' && localStorage.getItem('noname_admin_token')) ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('noname_admin_token'));
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('noname_admin_token');
      localStorage.removeItem('noname_admin_user');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('noname_admin_token');
      sessionStorage.removeItem('noname_admin_user');
    }
    laundryStore.setAdminToken(null);
    if (redirectToHome) {
      navigateTo('home');
      triggerToast('Logged out of Admin Back-Office.');
    }
  };

  // Subscribe to laundryStore changes
  useEffect(() => {
    const unsubscribe = laundryStore.subscribe(() => {
      setStoreState({
        services: [...laundryStore.services],
        categories: [...(laundryStore.categories || [])],
        orders: [...laundryStore.orders],
        incidents: [...laundryStore.incidents],
        settings: { ...laundryStore.settings }
      });
    });
    return unsubscribe;
  }, []);

  // Show temporary toast
  const triggerToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Switch to Booking with selected service
  const handleSelectServiceForBooking = (serviceId, minWeight, multiItems = null, speed = 'standard_48h') => {
    setBookingPrefillService(serviceId);
    setBookingPrefillWeight(minWeight);
    setBookingPrefillItems(multiItems);
    setBookingPrefillSpeed(speed || 'standard_48h');
    setCurrentView('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Booking successful handler
  const handleBookingSuccess = (orderOrInput) => {
    const orderId = orderOrInput?.id || (orderOrInput ? laundryStore.createOrder(orderOrInput).id : '');
    if (orderId) {
      triggerToast(`Booking #${orderId} confirmed! Pick-up requested.`);
    }
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update Service Pricing & Min Weight handler
  const handleUpdateServicePricing = (serviceId, pricePerKg, minWeightKg, features) => {
    laundryStore.updateService(serviceId, pricePerKg, minWeightKg, features);
    triggerToast('Service pricing & minimum weights updated!');
  };

  // Full Service Update (pricing, min weight, description, sublist features)
  const handleUpdateService = (serviceId, updatedData) => {
    laundryStore.updateServiceFull(serviceId, updatedData);
    triggerToast('Service details and feature checklist updated!');
  };

  // Update Order Status in POS
  const handleUpdateOrderStatus = (orderId, status, note, actualWeightKg, tagNumber, serviceUpdates = {}) => {
    laundryStore.updateOrderStatus(orderId, status, note, actualWeightKg, tagNumber, serviceUpdates);
    triggerToast(`Order ${orderId} updated successfully`);
  };

  // Create manual POS order
  const handleCreateManualOrder = (orderInput) => {
    const newOrder = laundryStore.createOrder(orderInput);
    triggerToast(`Manual POS order created! ID: ${newOrder.id}`);
  };

  // Report incident from Tracker
  const handleReportIncident = (incidentData) => {
    const newInc = laundryStore.createIncident(incidentData);
    triggerToast(`Ticket ${newInc.id} received. Staff will reply online via ${incidentData.channel.toUpperCase()}.`);
  };

  // Resolve incident in POS
  const handleResolveIncident = (incidentId, responseText) => {
    laundryStore.resolveIncident(incidentId, responseText);
    triggerToast(`Ticket ${incidentId} marked as resolved.`);
  };

  // Reset demo data
  const handleResetData = () => {
    if (confirm('Reset store back to initial demonstration orders and pricing?')) {
      laundryStore.resetAllData();
      triggerToast('Store reset to initial demonstration state.');
    }
  };

  // Handle URL hash changes & keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A) for staff
  useEffect(() => {
    const syncViewWithHash = () => {
      try {
        const url = new URL(window.location.href);
        const trackId = url.searchParams.get('track') || url.searchParams.get('order') || url.searchParams.get('id');
        const payParam = url.searchParams.get('pay');
        const hash = window.location.hash.replace('#', '').toLowerCase();
        const path = window.location.pathname.replace(/^\//, '').toLowerCase();

        // Sync city from URL
        if (path.includes('pattaya')) {
          setCurrentCity('Pattaya');
        } else if (path.includes('bangkok')) {
          setCurrentCity('Bangkok');
        }

        if (trackId) {
          setActiveTrackingId(trackId);
          setCurrentView('track');
          if (payParam === '1' || payParam === 'true' || hash === 'pay') {
            setInitialOpenPayment(true);
          }
          return;
        }

        const target = hash || path;
        if (['admin', 'track', 'services', 'terms', 'book', 'login', 'portal', 'register', 'faq'].includes(target)) {
          setCurrentView(target);
        } else if (['how-it-works', 'coverage', 'reviews'].includes(target)) {
          setCurrentView('home');
          setTimeout(() => {
            const el = document.getElementById(target);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        } else if (!hash) {
          setCurrentView('home');
        }
      } catch (e) {}
    };

    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigateTo('admin');
      }
      if (e.key === 'Escape' || e.key === 'Esc') {
        setIsContactModalOpen(false);
      }
    };

    window.addEventListener('hashchange', syncViewWithHash);
    window.addEventListener('popstate', syncViewWithHash);
    window.addEventListener('keydown', onKeyDown);

    // Run immediately on mount to ensure URL matches view
    syncViewWithHash();

    return () => {
      window.removeEventListener('hashchange', syncViewWithHash);
      window.removeEventListener('popstate', syncViewWithHash);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleSwitchCity = (newCity) => {
    setCurrentCity(newCity);
    if (typeof window !== 'undefined') {
      const citySlug = newCity.toLowerCase();
      const currentHash = window.location.hash ? window.location.hash : '';
      const newUrl = `/${citySlug}${currentHash}`;
      window.history.pushState(null, '', newUrl);
    }
    triggerToast(`Location switched to ${newCity}`);
  };

  const navigateTo = (view) => {
    const sectionIds = ['how-it-works', 'coverage', 'reviews'];
    if (sectionIds.includes(view)) {
      if (currentView !== 'home') {
        setCurrentView('home');
        setTimeout(() => {
          const el = document.getElementById(view);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById(view);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      if (typeof window !== 'undefined') {
        window.location.hash = view;
      }
      return;
    }

    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const isPattayaPath = window.location.pathname.includes('/pattaya');
      const isBangkokPath = window.location.pathname.includes('/bangkok');
      const cityPath = currentCity === 'Pattaya' ? '/pattaya' : (isBangkokPath ? '/bangkok' : (isPattayaPath ? '/pattaya' : window.location.pathname));
      if (view === 'home') {
        if (window.location.hash) {
          history.replaceState(null, '', cityPath);
        }
      } else {
        window.location.hash = view;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] w-full max-w-full overflow-x-clip">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 animate-bounce">
            <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* Main Navigation Bar (Hidden when in Admin Back-Office) */}
        {currentView !== 'admin' && (
          <Navbar
            currentView={currentView}
            setView={navigateTo}
            onOpenContactModal={() => setIsContactModalOpen(true)}
            customer={currentCustomer}
            currentCity={currentCity}
            onSwitchCity={handleSwitchCity}
            language={language}
            onSwitchLanguage={setLanguage}
          />
        )}

      {/* Main Content Router */}
      <main className="flex-1 w-full max-w-full overflow-x-clip">
        {currentView === 'home' && (
          <>
            <Hero
              services={storeState.services}
              setView={navigateTo}
              onSelectServiceForBooking={handleSelectServiceForBooking}
              city={currentCity}
              onSwitchCity={handleSwitchCity}
              onOpenContactModal={() => setIsContactModalOpen(true)}
            />
            <HowItWorks
              setView={navigateTo}
            />
            <CoverageSection
              setView={navigateTo}
              city={currentCity}
              onSwitchCity={handleSwitchCity}
            />
            <CustomerReviews
              setView={navigateTo}
            />
            <DigitalSupportBanner
              onOpenContactModal={() => setIsContactModalOpen(true)}
            />
            <FaqSection
              setView={navigateTo}
            />
            
            {/* Informational Page Bottom Banner */}
            <section className="py-14 sm:py-16 bg-gradient-to-r from-sky-700 via-sky-600 to-teal-600 text-white text-center relative overflow-hidden">
              <div className="max-w-4xl mx-auto px-4 relative z-10">
                <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                  {language === 'th' ? 'พร้อมสัมผัสประสบการณ์ซักอบรีดส่งถึงที่หรือยัง?' : 'Ready to Experience Cloud Laundry?'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {language === 'th' ? 'จองบริการรับผ้าถึงหน้าประตูในไม่กี่นาที' : 'Start Your Doorstep Laundry Order in Minutes'}
                </h2>
                <p className="mt-3 text-sky-100 text-sm sm:text-base max-w-xl mx-auto">
                  {language === 'th'
                    ? 'คิดราคาตามน้ำหนักจริงอย่างโปร่งใส ส่งรูปถ่ายเครื่องชั่งดิจิทัลยืนยัน พร้อมรองรับการฝากนิติบุคคลคอนโดทั่วกรุงเทพฯ และพัทยา'
                    : 'Transparent KG pricing, precision digital scale photo receipts, and full juristic reception drop-off support across Bangkok & Pattaya.'}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => navigateTo('book')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-sky-900 hover:bg-slate-100 font-extrabold text-base px-8 py-3.5 rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
                  >
                    <Icon name="truck" className="w-5 h-5 text-sky-600" />
                    <span>{language === 'th' ? 'จองรับผ้าทันที' : 'Book Pickup Now'}</span>
                  </button>
                  <button
                    onClick={() => navigateTo('services')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-800/60 hover:bg-sky-800 text-white font-bold text-base px-6 py-3.5 rounded-xl border border-white/30 backdrop-blur-md transition"
                  >
                    <Icon name="scale" className="w-5 h-5" />
                    <span>{language === 'th' ? 'ดูราคาและคำนวณค่าบริการ' : 'View Pricing & Calculator'}</span>
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {currentView === 'services' && (
          <div className="py-8">
            <ServicesSection
              services={storeState.services}
              categories={storeState.categories}
              onSelectServiceForBooking={handleSelectServiceForBooking}
              onBookingSuccess={handleBookingSuccess}
            />
            <DigitalSupportBanner
              onOpenContactModal={() => setIsContactModalOpen(true)}
            />
          </div>
        )}

        {currentView === 'how-it-works' && (
          <div className="py-8">
            <HowItWorks setView={navigateTo} />
            <DigitalSupportBanner onOpenContactModal={() => setIsContactModalOpen(true)} />
          </div>
        )}

        {currentView === 'faq' && (
          <div className="py-8">
            <FaqSection setView={navigateTo} />
          </div>
        )}

        {currentView === 'book' && (
          <BookingWizard
            services={storeState.services}
            categories={storeState.categories}
            initialServiceId={bookingPrefillService}
            initialWeight={bookingPrefillWeight}
            initialSelectedItems={bookingPrefillItems}
            initialTurnaroundSpeed={bookingPrefillSpeed}
            initialCustomer={currentCustomer || prefillCustomer}
            initialCity={currentCity}
            onBookingSuccess={handleBookingSuccess}
            onViewFullTerms={() => navigateTo('terms')}
          />
        )}

        {currentView === 'track' && (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center text-3xl shadow-sm">
              💬
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {language === 'th' ? 'ฝ่ายบริการลูกค้าและการติดตามสถานะคำสั่งซื้อ' : 'Customer Support & Order Updates'}
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
              {language === 'th'
                ? 'หากต้องการตรวจสอบสถานะคำสั่งซื้อ ตรวจสอบเวลารับ-ส่งผ้า หรือสอบถามข้อมูลเพิ่มเติม สามารถติดต่อทีมงานบริการลูกค้าได้โดยตรง ทุกการติดต่อจะมีบันทึกเป็นลายลักษณ์อักษรพร้อมรูปถ่ายยืนยันการชั่งน้ำหนัก'
                : 'To check on your order status, verify pickup or delivery times, or ask questions, please contact our Customer Service team directly. All communications are documented in writing with digital scale verification photos.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`${CONTACT_CHANNELS.whatsapp.url}Hi%20NoName%20Laundry,%20I%20would%20like%20an%20update%20on%20my%20order`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition"
              >
                <Icon name="whatsapp" className="w-4 h-4 text-white" />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href={CONTACT_CHANNELS.line.url}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition"
              >
                <Icon name="line" className="w-4 h-4 text-white" />
                <span>Chat on LINE: @nonamelaundry</span>
              </a>
            </div>
            <div className="pt-4">
              <button
                onClick={() => navigateTo('home')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                {language === 'th' ? '← กลับสู่หน้าหลัก' : '← Return to Home'}
              </button>
            </div>
          </div>
        )}

        {currentView === 'terms' && (
          <TermsAndConditions
            setView={navigateTo}
          />
        )}

                {currentView === 'login' && (
          <CustomerLogin
            onLoginSuccess={(customer) => {
              setCurrentCustomer(customer);
              triggerToast(`ยินดีต้อนรับคุณ ${customer.nickName || customer.fullName}!`);
              navigateTo('portal');
            }}
            onNavigateToRegister={() => navigateTo('register')}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'portal' && (
          !currentCustomer ? (
            <CustomerLogin
              onLoginSuccess={(customer) => {
                setCurrentCustomer(customer);
                triggerToast(`ยินดีต้อนรับคุณ ${customer.nickName || customer.fullName}!`);
                navigateTo('portal');
              }}
              onNavigateToRegister={() => navigateTo('register')}
              onNavigateHome={() => navigateTo('home')}
            />
          ) : (
            <CustomerPortal
              customer={currentCustomer}
              onNavigateHome={() => navigateTo('home')}
              onBookNewOrder={(cust) => {
                setPrefillCustomer(cust);
                navigateTo('book');
              }}
              onTrackOrder={(orderId) => {
                setActiveTrackingId(orderId);
                navigateTo('track');
              }}
              onLogout={() => {
                laundryStore.logoutCustomer();
                setCurrentCustomer(null);
                triggerToast('ออกจากระบบเรียบร้อยแล้ว');
                navigateTo('home');
              }}
            />
          )
        )}

        {currentView === 'register' && (
          <CustomerRegister
            onRegisterSuccess={(customer) => {
              laundryStore.setCurrentCustomer(customer);
              setCurrentCustomer(customer);
              triggerToast(`ยินดีต้อนรับคุณ ${customer.fullName}! ลงทะเบียนและเข้าสู่ระบบเรียบร้อยแล้ว`);
              navigateTo('portal');
            }}
            onNavigateToBook={(customer) => {
              laundryStore.setCurrentCustomer(customer);
              setCurrentCustomer(customer);
              setPrefillCustomer(customer);
              navigateTo('book');
            }}
            onNavigateToLogin={() => navigateTo('login')}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'admin' && (
          !isAdminAuthenticated ? (
            <AdminLogin
              onLoginSuccess={handleAdminLogin}
              onCancel={() => navigateTo('home')}
            />
          ) : (
            <AdminPOS
              adminUser={adminUser}
              onLogout={handleAdminLogout}
              onViewStorefront={() => navigateTo('home')}
              services={storeState.services}
              orders={storeState.orders}
              incidents={storeState.incidents}
              settings={storeState.settings}
              onUpdateServicePricing={handleUpdateServicePricing}
              onUpdateService={handleUpdateService}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onCreateManualOrder={handleCreateManualOrder}
              onResolveIncident={handleResolveIncident}
              onResetData={handleResetData}
            />
          )
        )}
      </main>

      {/* Floating Action Button: Digital Support (Hidden in Admin Back-Office) */}
      {currentView !== 'admin' && (
        <div className={`fixed right-4 sm:right-6 z-30 transition-all ${
          (currentView === 'home' || currentView === 'services')
            ? 'bottom-24 lg:bottom-6'
            : 'bottom-6'
        }`}>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-xl shadow-emerald-900/20 hover:shadow-2xl transition transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Online Support (WhatsApp / LINE / Email)"
          >
            <div className="flex -space-x-1">
              <Icon name="whatsapp" className="w-4 h-4 text-white" />
              <Icon name="line" className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:inline">{language === 'th' ? 'แชทติดต่อสอบถาม' : 'Online Chat Support'}</span>
            <span className="w-2 h-2 rounded-full bg-white animate-ping-subtle" />
          </button>
        </div>
      )}

      {/* Digital Support Modal */}
      <DigitalContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Site Footer (Hidden in Admin Back-Office) */}
      {currentView !== 'admin' && (
        <Footer setView={navigateTo} />
      )}
      
      </div>
    </LanguageContext.Provider>
  );
}
