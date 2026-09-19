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
import { Footer } from './components/Footer.jsx';
import { Icon } from './components/Icons.jsx';

const getInitialView = () => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();
    if (hash === 'admin' || path === 'admin') return 'admin';
    if (hash === 'track' || path === 'track') return 'track';
    if (hash === 'services' || path === 'services') return 'services';
    if (hash === 'terms' || path === 'terms') return 'terms';
    if (hash === 'book' || path === 'book') return 'book';
  }
  return 'home';
};

export function App() {
  const [currentView, setCurrentView] = useState(getInitialView);
  const [storeState, setStoreState] = useState(() => ({
    services: [...laundryStore.services],
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
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Booking Flow parameters
  const [bookingPrefillService, setBookingPrefillService] = useState(null);
  const [bookingPrefillWeight, setBookingPrefillWeight] = useState(null);
  const [activeTrackingId, setActiveTrackingId] = useState('');

  // Modals & Notifications
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Verify stored admin token on mount
  useEffect(() => {
    const token = 
      (typeof localStorage !== 'undefined' && localStorage.getItem('noname_admin_token')) ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('noname_admin_token'));
    if (token) {
      fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Token expired');
        return res.json();
      })
      .then(data => {
        if (data.authenticated) {
          setIsAdminAuthenticated(true);
          setAdminUser(data.user);
          laundryStore.setAdminToken(token);
        } else {
          handleAdminLogout();
        }
      })
      .catch(() => {
        handleAdminLogout();
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

  const handleAdminLogout = () => {
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
    setCurrentView('home');
    triggerToast('Logged out of Admin Back-Office.');
  };

  // Subscribe to laundryStore changes
  useEffect(() => {
    const unsubscribe = laundryStore.subscribe(() => {
      setStoreState({
        services: [...laundryStore.services],
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
  const handleSelectServiceForBooking = (serviceId, minWeight) => {
    setBookingPrefillService(serviceId);
    setBookingPrefillWeight(minWeight);
    setCurrentView('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Booking successful handler
  const handleBookingSuccess = (bookingInput) => {
    const newOrder = laundryStore.createOrder(bookingInput);
    setActiveTrackingId(newOrder.id);
    triggerToast(`Booking confirmed! Your Tracking ID is ${newOrder.id}`);
    setCurrentView('track');
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
  const handleUpdateOrderStatus = (orderId, status, note, actualWeightKg, tagNumber) => {
    laundryStore.updateOrderStatus(orderId, status, note, actualWeightKg, tagNumber);
    triggerToast(`Order ${orderId} updated to ${status.replace(/_/g, ' ')}`);
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
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash) {
        setCurrentView(hash);
      }
    };

    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigateTo('admin');
      }
    };

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'home') {
        history.replaceState(null, '', window.location.pathname);
      } else {
        window.location.hash = view;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        currentView={currentView}
        setView={navigateTo}
        onOpenContactModal={() => setIsContactModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero
              services={storeState.services}
              setView={navigateTo}
              onSelectServiceForBooking={handleSelectServiceForBooking}
            />
            <DigitalSupportBanner
              onOpenContactModal={() => setIsContactModalOpen(true)}
            />
            <ServicesSection
              services={storeState.services}
              onSelectServiceForBooking={handleSelectServiceForBooking}
            />
            <HowItWorks
              setView={navigateTo}
            />
          </>
        )}

        {currentView === 'services' && (
          <div className="py-8">
            <ServicesSection
              services={storeState.services}
              onSelectServiceForBooking={handleSelectServiceForBooking}
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

        {currentView === 'book' && (
          <BookingWizard
            services={storeState.services}
            initialServiceId={bookingPrefillService}
            initialWeight={bookingPrefillWeight}
            onBookingSuccess={handleBookingSuccess}
            onViewFullTerms={() => navigateTo('terms')}
          />
        )}

        {currentView === 'track' && (
          <OrderTracker
            orders={storeState.orders}
            initialTrackingId={activeTrackingId}
            onReportIncident={handleReportIncident}
          />
        )}

        {currentView === 'terms' && (
          <TermsAndConditions
            setView={navigateTo}
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

      {/* Floating Action Button: Digital Support */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsContactModalOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-3 rounded-full shadow-xl shadow-emerald-900/20 hover:shadow-2xl transition transform hover:scale-105 active:scale-95"
          title="Online Support (WhatsApp / LINE / Email)"
        >
          <div className="flex -space-x-1">
            <Icon name="whatsapp" className="w-4 h-4 text-white" />
            <Icon name="line" className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:inline">Online Chat Support</span>
          <span className="w-2 h-2 rounded-full bg-white animate-ping-subtle" />
        </button>
      </div>

      {/* Digital Support Modal */}
      <DigitalContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Site Footer */}
      <Footer setView={navigateTo} />
      
    </div>
  );
}
