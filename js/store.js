// State and LocalStorage / PostgreSQL Management for NoName Laundry
import { INITIAL_SERVICES, INITIAL_ORDERS, INITIAL_INCIDENTS, INITIAL_CUSTOMERS } from './data/servicesData.js';
import { INITIAL_FAQS } from './data/faqData.js';

const STORAGE_KEYS = {
  SERVICES: 'noname_laundry_services_v2',
  ORDERS: 'noname_laundry_orders_v2',
  INCIDENTS: 'noname_laundry_incidents_v2',
  CUSTOMERS: 'noname_laundry_customers_v2',
  SETTINGS: 'noname_laundry_settings_v2',
  FAQS: 'noname_laundry_faqs_v2',
};

export const CONTACT_CHANNELS = {
  whatsapp: {
    name: 'WhatsApp',
    handle: '+66 94 882 1920',
    url: 'https://wa.me/66948821920?text=',
    color: 'emerald',
    badge: 'Fastest Response (~5 mins)',
    icon: 'MessageCircle'
  },
  line: {
    name: 'LINE Official',
    handle: '@nonamelaundry',
    url: 'https://line.me/R/ti/p/@nonamelaundry',
    oaMessageUrl: 'https://line.me/R/oaMessage/@nonamelaundry/?',
    color: 'green',
    badge: 'Bangkok Favorite',
    icon: 'Smartphone'
  },
  email: {
    name: 'Email Support',
    handle: 'support@nonamelaundry.com',
    url: 'mailto:support@nonamelaundry.com?subject=',
    color: 'sky',
    badge: 'Formal & Invoicing',
    icon: 'Mail'
  }
};

export function getLineOaAddFriendUrl(lineId = '@nonamelaundry') {
  const cleanId = lineId.startsWith('@') ? lineId : ('@' + lineId);
  return 'https://line.me/R/ti/p/' + encodeURIComponent(cleanId);
}

export function getLineOaMessageUrl(message = '', lineId = '@nonamelaundry') {
  const cleanId = lineId.startsWith('@') ? lineId : ('@' + lineId);
  return 'https://line.me/R/oaMessage/' + encodeURIComponent(cleanId) + '/?' + encodeURIComponent(message);
}

export function getLineQrCodeUrl(lineId = '@nonamelaundry') {
  const targetUrl = getLineOaAddFriendUrl(lineId);
  return 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=' + encodeURIComponent(targetUrl);
}

export function generatePromptPayQrUrl(amount = 0) {
  // Generates dynamic demo PromptPay QR code image for the exact bill amount
  const promptPayData = '00020101021129370016A000000677010111011300669488219205802TH5303764540' + amount.toFixed(2);
  return 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=' + encodeURIComponent(promptPayData);
}

export class LaundryStore {
  constructor() {
    this.subscribers = new Set();
    this.dbStatus = 'connecting';
    this.adminToken = 
      (typeof localStorage !== 'undefined' && localStorage.getItem('noname_admin_token')) ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('noname_admin_token')) ||
      null;
    this.loadState();
    this.fetchRemoteState();
  }

  setAdminToken(token) {
    this.adminToken = token;
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('noname_admin_token', token);
      } else {
        localStorage.removeItem('noname_admin_token');
      }
    }
    if (typeof sessionStorage !== 'undefined') {
      if (token) {
        sessionStorage.setItem('noname_admin_token', token);
      } else {
        sessionStorage.removeItem('noname_admin_token');
      }
    }
  }

  getAdminAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.adminToken || 
      (typeof localStorage !== 'undefined' && localStorage.getItem('noname_admin_token')) ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('noname_admin_token'));
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  syncContactChannels(settings) {
    if (!settings) return;
    if (settings.lineOaId) {
      CONTACT_CHANNELS.line.handle = settings.lineOaId;
      CONTACT_CHANNELS.line.url = getLineOaAddFriendUrl(settings.lineOaId);
      CONTACT_CHANNELS.line.oaMessageUrl = 'https://line.me/R/oaMessage/' + encodeURIComponent(settings.lineOaId) + '/?';
    }
    if (settings.whatsappNumber) {
      CONTACT_CHANNELS.whatsapp.handle = settings.whatsappNumber;
      const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
      CONTACT_CHANNELS.whatsapp.url = `https://wa.me/${cleanPhone}?text=`;
    }
    if (settings.supportEmail) {
      CONTACT_CHANNELS.email.handle = settings.supportEmail;
      CONTACT_CHANNELS.email.url = `mailto:${settings.supportEmail}?subject=`;
    }
  }

  loadState() {
    try {
      const savedServices = localStorage.getItem(STORAGE_KEYS.SERVICES);
      let loadedServices = savedServices ? JSON.parse(savedServices) : INITIAL_SERVICES;
      this.services = loadedServices.map(s => {
        const stdPrice = s.standardPricePerKg !== undefined 
          ? Number(s.standardPricePerKg) 
          : Number(s.pricePerKg || 65);
        let nextPrice = s.nextDayPricePerKg !== undefined ? Number(s.nextDayPricePerKg) : 0;
        let samePrice = s.sameDayPricePerKg !== undefined ? Number(s.sameDayPricePerKg) : 0;
        if (!nextPrice || (nextPrice === stdPrice && s.id === 'wash_fold')) {
          if (s.id === 'wash_fold') nextPrice = 85;
          else if (s.id === 'wash_iron_fold') nextPrice = 130;
          else if (s.id === 'wash_iron_hang') nextPrice = 160;
          else nextPrice = Math.round(stdPrice * 1.3);
        }
        if (!samePrice || (samePrice === 95 && s.id === 'wash_fold')) {
          if (s.id === 'wash_fold') samePrice = 115;
          else if (s.id === 'wash_iron_fold') samePrice = 175;
          else if (s.id === 'wash_iron_hang') samePrice = 210;
          else samePrice = Math.round(stdPrice * 1.75);
        }
        return {
          ...s,
          standardPricePerKg: stdPrice,
          nextDayPricePerKg: nextPrice,
          sameDayPricePerKg: samePrice,
          sameDayAvailable: s.sameDayAvailable !== undefined ? Boolean(s.sameDayAvailable) : true,
          pricePerKg: stdPrice,
          turnaroundHours: s.turnaroundHours ? Number(s.turnaroundHours) : 48,
          minWeightKg: Number(s.minWeightKg) < 4.0 ? 4.0 : Number(s.minWeightKg)
        };
      });

      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      this.orders = savedOrders ? JSON.parse(savedOrders) : INITIAL_ORDERS;

      const savedIncidents = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      const parsedIncidents = savedIncidents ? JSON.parse(savedIncidents) : INITIAL_INCIDENTS;
      this.incidents = parsedIncidents.map(inc => ({
        ...inc,
        category: inc.category || (inc.id === 'INC-101' ? 'Special Laundry Request' : 'General Inquiry'),
        severity: inc.severity || 'normal',
        affectedItem: inc.affectedItem !== undefined ? inc.affectedItem : (inc.id === 'INC-101' ? 'Blue button-down shirt' : ''),
        imageUrl: inc.imageUrl || null
      }));

      const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const parsedCusts = savedCustomers ? JSON.parse(savedCustomers) : INITIAL_CUSTOMERS;
      this.customers = parsedCusts.map(c => {
        const item = {
          ...c,
          mobileNumber: c.mobileNumber || '',
          isWhatsApp: c.isWhatsApp !== undefined ? Boolean(c.isWhatsApp) : true,
          secondaryMobile: c.secondaryMobile !== undefined ? c.secondaryMobile : '',
          isSecondaryWhatsApp: c.isSecondaryWhatsApp !== undefined ? Boolean(c.isSecondaryWhatsApp) : false
        };
        if (item.id === 'CUST-8491') {
          if (!item.secondaryMobile) {
            item.secondaryMobile = '+1 (415) 890-1234';
            item.isSecondaryWhatsApp = true;
          }
        }
        if (item.id === 'CUST-7741') {
          if (!item.secondaryMobile) {
            item.secondaryMobile = '+33 6 12 34 56 78';
            item.isSecondaryWhatsApp = true;
          }
        }
        if (item.id === 'CUST-3920') {
          item.isWhatsApp = true;
          if (!item.secondaryMobile) {
            item.secondaryMobile = '+81 90 1234 5678';
            item.isSecondaryWhatsApp = false;
          }
        }
        return item;
      });

      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      this.settings = savedSettings ? JSON.parse(savedSettings) : {
        storeName: 'NoName Laundry',
        city: 'Bangkok, Thailand',
        turnaroundStd: '24–48 Hours',
        currency: 'THB',
        lineOaId: '@nonamelaundry',
        whatsappNumber: '+66 94 882 1920',
        supportEmail: 'support@nonamelaundry.com',
        paymentGateway: {
          provider: 'Omise / Opn Payments (Thailand)',
          merchantName: 'NoName Laundry Bangkok Co., Ltd.',
          promptpayEnabled: true,
          creditCardEnabled: true,
          trueMoneyEnabled: true,
          testMode: true,
          modeNotice: '100% Cashless System via 3rd-Party Gateway'
        },
        contact: CONTACT_CHANNELS
      };
      this.syncContactChannels(this.settings);

      const savedFaqs = localStorage.getItem(STORAGE_KEYS.FAQS);
      this.faqs = savedFaqs ? JSON.parse(savedFaqs) : INITIAL_FAQS;
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      this.services = INITIAL_SERVICES.map(s => ({ ...s, minWeightKg: 4.0 }));
      this.orders = INITIAL_ORDERS;
      this.incidents = INITIAL_INCIDENTS;
      this.customers = INITIAL_CUSTOMERS;
      this.faqs = INITIAL_FAQS;
    }
  }

  async fetchRemoteState() {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      
      if (Array.isArray(data.services) && data.services.length > 0) {
        this.services = data.services;
        this.persist(STORAGE_KEYS.SERVICES, this.services);
      }
      if (Array.isArray(data.orders)) {
        this.orders = data.orders;
        this.persist(STORAGE_KEYS.ORDERS, this.orders);
      }
      if (Array.isArray(data.incidents)) {
        this.incidents = data.incidents;
        this.persist(STORAGE_KEYS.INCIDENTS, this.incidents);
      }
      if (Array.isArray(data.customers)) {
        this.customers = data.customers;
        this.persist(STORAGE_KEYS.CUSTOMERS, this.customers);
      }
      if (data.settings && Object.keys(data.settings).length > 0) {
        this.settings = { ...this.settings, ...data.settings };
        this.persist(STORAGE_KEYS.SETTINGS, this.settings);
        this.syncContactChannels(this.settings);
      }
      this.dbStatus = 'connected';
      this.notify();
    } catch (e) {
      console.warn('Operating with local storage cache (PostgreSQL sync offline):', e.message);
      this.dbStatus = 'offline';
      this.notify();
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(cb => {
      try { cb(); } catch (err) { console.error('Subscriber notification error', err); }
    });
  }

  persist(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to persist to localStorage', e);
    }
  }

  async updateLineOaSettings(newLineOaId, newWhatsapp, newEmail) {
    this.settings = {
      ...this.settings,
      lineOaId: newLineOaId || this.settings.lineOaId,
      whatsappNumber: newWhatsapp || this.settings.whatsappNumber,
      supportEmail: newEmail || this.settings.supportEmail
    };
    this.syncContactChannels(this.settings);
    this.persist(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(this.settings)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to save settings (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json;
  }

  async updatePaymentGatewaySettings(gatewayConfig) {
    this.settings = {
      ...this.settings,
      paymentGateway: {
        ...this.settings.paymentGateway,
        ...gatewayConfig
      }
    };
    this.persist(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(this.settings)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to save gateway settings (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json;
  }

  // Service Pricing, Min Weight & Features Methods
  async updateService(serviceId, newPricePerKg, newMinWeightKg, features) {
    return this.updateServiceFull(serviceId, {
      pricePerKg: Number(newPricePerKg),
      minWeightKg: Math.max(1, Number(newMinWeightKg)),
      features: Array.isArray(features) ? features : undefined
    });
  }

  async updateServiceFull(serviceId, updatedData) {
    this.services = this.services.map(srv => {
      if (srv.id === serviceId) {
        const stdPrice = updatedData.standardPricePerKg !== undefined
          ? Number(updatedData.standardPricePerKg)
          : (updatedData.pricePerKg !== undefined ? Number(updatedData.pricePerKg) : (srv.standardPricePerKg || srv.pricePerKg || 65));
        const nextPrice = updatedData.nextDayPricePerKg !== undefined 
          ? Number(updatedData.nextDayPricePerKg) 
          : (srv.nextDayPricePerKg || Math.round(stdPrice * 1.3));
        const samePrice = updatedData.sameDayPricePerKg !== undefined 
          ? Number(updatedData.sameDayPricePerKg) 
          : (srv.sameDayPricePerKg || Math.round(stdPrice * 1.75));
        const sameAvail = updatedData.sameDayAvailable !== undefined 
          ? Boolean(updatedData.sameDayAvailable) 
          : (srv.sameDayAvailable !== undefined ? srv.sameDayAvailable : true);

        return {
          ...srv,
          ...updatedData,
          name: updatedData.name ? updatedData.name.trim() : srv.name,
          nameTh: updatedData.nameTh ? updatedData.nameTh.trim() : srv.nameTh,
          description: updatedData.description !== undefined ? updatedData.description.trim() : srv.description,
          pricePerKg: stdPrice,
          standardPricePerKg: stdPrice,
          nextDayPricePerKg: nextPrice,
          sameDayPricePerKg: samePrice,
          sameDayAvailable: sameAvail,
          minWeightKg: updatedData.minWeightKg !== undefined ? Math.max(1, Number(updatedData.minWeightKg)) : srv.minWeightKg,
          turnaroundHours: updatedData.turnaroundHours !== undefined ? Number(updatedData.turnaroundHours) : (srv.turnaroundHours || 48),
          popular: updatedData.popular !== undefined ? Boolean(updatedData.popular) : srv.popular,
          features: Array.isArray(updatedData.features)
            ? updatedData.features.filter(f => typeof f === 'string' && f.trim().length > 0)
            : srv.features
        };
      }
      return srv;
    });
    this.persist(STORAGE_KEYS.SERVICES, this.services);
    this.notify();

    try {
      const res = await fetch(`/api/services/${encodeURIComponent(serviceId)}`, {
        method: 'PUT',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const saved = await res.json();
        this.services = this.services.map(s => s.id === serviceId ? { ...s, ...saved } : s);
        this.persist(STORAGE_KEYS.SERVICES, this.services);
        this.notify();
        return saved;
      }
      if (res.status === 401) {
        throw new Error('Admin session expired. Please log in again.');
      }
      if (res.status === 501 || res.status === 502 || res.status === 503) {
        console.warn(`Backend returned HTTP ${res.status}, saved in local cache.`);
        return updatedData;
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update service ${serviceId} (HTTP ${res.status})`);
    } catch (networkErr) {
      if (networkErr.message && (networkErr.message.includes('Failed to fetch') || networkErr.message.includes('NetworkError'))) {
        console.warn('Backend offline, saved in local cache.');
        return updatedData;
      }
      throw networkErr;
    }
  }

  async updateAllServices(servicesList) {
    if (!Array.isArray(servicesList)) return;

    // Optimistically update
    const map = new Map(servicesList.map(s => [s.id, s]));
    this.services = this.services.map(srv => {
      const draft = map.get(srv.id);
      if (!draft) return srv;
      const stdPrice = draft.standardPricePerKg !== undefined
        ? Number(draft.standardPricePerKg)
        : (draft.pricePerKg !== undefined ? Number(draft.pricePerKg) : (srv.standardPricePerKg || srv.pricePerKg || 65));
      const nextPrice = draft.nextDayPricePerKg !== undefined 
        ? Number(draft.nextDayPricePerKg) 
        : (srv.nextDayPricePerKg || Math.round(stdPrice * 1.3));
      const samePrice = draft.sameDayPricePerKg !== undefined 
        ? Number(draft.sameDayPricePerKg) 
        : (srv.sameDayPricePerKg || Math.round(stdPrice * 1.75));
      const sameAvail = draft.sameDayAvailable !== undefined 
        ? Boolean(draft.sameDayAvailable) 
        : (srv.sameDayAvailable !== undefined ? srv.sameDayAvailable : true);

      return {
        ...srv,
        ...draft,
        pricePerKg: stdPrice,
        standardPricePerKg: stdPrice,
        nextDayPricePerKg: nextPrice,
        sameDayPricePerKg: samePrice,
        sameDayAvailable: sameAvail,
        minWeightKg: draft.minWeightKg !== undefined ? Math.max(1, Number(draft.minWeightKg)) : srv.minWeightKg,
        turnaroundHours: draft.turnaroundHours !== undefined ? Number(draft.turnaroundHours) : (srv.turnaroundHours || 48),
        features: Array.isArray(draft.features) ? draft.features : srv.features
      };
    });
    this.persist(STORAGE_KEYS.SERVICES, this.services);
    this.notify();

    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: this.getAdminAuthHeaders(),
        body: JSON.stringify(servicesList)
      });
      if (res.ok) {
        const savedServices = await res.json();
        if (Array.isArray(savedServices) && savedServices.length > 0) {
          this.services = savedServices;
          this.persist(STORAGE_KEYS.SERVICES, this.services);
          this.notify();
        }
        return savedServices;
      }
      if (res.status === 401) {
        throw new Error('Admin session expired. Please log in again.');
      }
      if (res.status === 501 || res.status === 502 || res.status === 503) {
        console.warn(`Backend returned HTTP ${res.status}, saved in local cache.`);
        return servicesList;
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to batch update services (HTTP ${res.status})`);
    } catch (networkErr) {
      if (networkErr.message && (networkErr.message.includes('Failed to fetch') || networkErr.message.includes('NetworkError'))) {
        console.warn('Backend offline, saved in local cache.');
        return servicesList;
      }
      throw networkErr;
    }
  }

  // Add a brand new service dynamically
  addService(serviceData) {
    const id = serviceData.id || serviceData.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);
    const stdPrice = Number(serviceData.standardPricePerKg || serviceData.pricePerKg) || 65;
    const nextPrice = Number(serviceData.nextDayPricePerKg) || Math.round(stdPrice * 1.3);
    const samePrice = Number(serviceData.sameDayPricePerKg) || Math.round(stdPrice * 1.75);
    const newService = {
      id,
      name: serviceData.name.trim(),
      nameTh: serviceData.nameTh ? serviceData.nameTh.trim() : serviceData.name.trim(),
      description: serviceData.description.trim(),
      unit: 'KG',
      pricePerKg: stdPrice,
      standardPricePerKg: stdPrice,
      nextDayPricePerKg: nextPrice,
      sameDayPricePerKg: samePrice,
      sameDayAvailable: serviceData.sameDayAvailable !== undefined ? Boolean(serviceData.sameDayAvailable) : true,
      minWeightKg: Number(serviceData.minWeightKg) || 4.0,
      turnaroundHours: Number(serviceData.turnaroundHours) || 48,
      popular: Boolean(serviceData.popular),
      features: serviceData.features && serviceData.features.length > 0
        ? serviceData.features
        : [
            'Premium hypoallergenic detergent',
            'Care label inspection',
            'Sealed protective packaging',
            'Pickup & delivery across Bangkok'
          ]
    };

    this.services = [...this.services, newService];
    this.persist(STORAGE_KEYS.SERVICES, this.services);
    this.notify();

    fetch('/api/services', {
      method: 'POST',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(newService)
    }).catch(err => console.warn('PostgreSQL add service error:', err));

    return newService;
  }

  deleteService(serviceId) {
    if (this.services.length <= 1) {
      alert('Cannot delete the last remaining service.');
      return;
    }
    this.services = this.services.filter(s => s.id !== serviceId);
    this.persist(STORAGE_KEYS.SERVICES, this.services);
    this.notify();

    fetch(`/api/services/${encodeURIComponent(serviceId)}`, {
      method: 'DELETE',
      headers: this.getAdminAuthHeaders()
    }).catch(err => console.warn('PostgreSQL delete service error:', err));
  }

  // Order Management
  createOrder(orderInput) {
    const service = this.services.find(s => s.id === orderInput.serviceId) || this.services[0];
    const rawSpeed = orderInput.turnaroundSpeed || 'standard_48h';
    let speed = 'standard_48h';
    if (rawSpeed === 'same_day') speed = 'same_day';
    else if (rawSpeed === 'next_day' || rawSpeed === 'next_day_24h') speed = 'next_day_24h';
    else speed = 'standard_48h';

    let unitPrice = Number(service.standardPricePerKg || service.pricePerKg || 65);
    if (speed === 'same_day') {
      unitPrice = Number(service.sameDayPricePerKg) || Math.round(Number(service.standardPricePerKg || service.pricePerKg || 65) * 1.75);
    } else if (speed === 'next_day_24h') {
      unitPrice = Number(service.nextDayPricePerKg) || Math.round(Number(service.standardPricePerKg || service.pricePerKg || 65) * 1.3);
    } else {
      unitPrice = Number(service.standardPricePerKg || service.pricePerKg || 65);
    }
    const weightToBill = Math.max(Number(orderInput.estimatedWeightKg), Number(service.minWeightKg));
    const calculatedTotal = Math.round(weightToBill * unitPrice);

    let defaultDeliveryDate = 'Scheduled in 48 Hours (~2 Days)';
    let defaultDeliveryTime = '16:00 - 18:00 (Early Evening)';
    if (speed === 'same_day') {
      defaultDeliveryDate = `${orderInput.pickupDate} (Same Day Before 18:00)`;
      defaultDeliveryTime = 'Anytime before 18:00 hrs';
    } else if (speed === 'next_day_24h') {
      defaultDeliveryDate = 'Scheduled Next Day (~24 Hours)';
      defaultDeliveryTime = '18:00 - 20:30 (Evening Rush)';
    }

    const trackingNumber = 'NNL-' + Math.floor(1000 + Math.random() * 9000) + '-BK';

    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);

    const newOrder = {
      id: trackingNumber,
      customerName: orderInput.customerName,
      contactChannel: orderInput.contactChannel,
      contactValue: orderInput.contactValue,
      email: orderInput.email,
      serviceId: service.id,
      serviceName: service.name,
      district: orderInput.district,
      condoName: orderInput.condoName,
      roomNumber: orderInput.roomNumber,
      leaveWithJuristic: Boolean(orderInput.leaveWithJuristic),
      estimatedWeightKg: Number(orderInput.estimatedWeightKg),
      actualWeightKg: null,
      minWeightAppliedKg: service.minWeightKg,
      pricePerKg: unitPrice,
      totalPrice: calculatedTotal,
      turnaroundSpeed: speed,
      status: 'BOOKING_REQUESTED',
      paymentStatus: 'PENDING', // PENDING, PAID
      paymentMethod: null,
      paymentRef: null,
      tagNumber: 'TAG-PENDING',
      pickupDate: orderInput.pickupDate,
      pickupTime: orderInput.pickupTime,
      deliveryDate: orderInput.deliveryDate || defaultDeliveryDate,
      deliveryTime: orderInput.deliveryTime || defaultDeliveryTime,
      specialInstructions: orderInput.specialInstructions || '',
      agreedTerms: true,
      cashlessPolicyAcknowledged: true,
      createdAt: now.toISOString(),
      timeline: [
        {
          status: 'BOOKING_REQUESTED',
          timestamp: timestampStr,
          note: 'Booking created online via ' + (orderInput.contactChannel || 'online').toUpperCase() + '. Pick-up requested at ' + (orderInput.condoName || orderInput.district || 'Bangkok') + '.'
        }
      ]
    };

    this.orders = [newOrder, ...this.orders];
    this.persist(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();

    // Auto-create or link Customer in CRM
    try {
      const existingCust = (this.customers || []).find(c =>
        (orderInput.customerName && c.fullName && c.fullName.trim().toLowerCase() === orderInput.customerName.trim().toLowerCase()) ||
        (orderInput.email && c.email && c.email.trim().toLowerCase() === orderInput.email.trim().toLowerCase()) ||
        (orderInput.contactValue && c.mobileNumber && c.mobileNumber.replace(/[^0-9]/g, '') === orderInput.contactValue.replace(/[^0-9]/g, ''))
      );

      if (existingCust) {
        // If customer ordered at a new condo/address, add it to their saved addresses
        const hasAddr = (existingCust.addresses || []).some(a => 
          orderInput.condoName && (a.address.toLowerCase().includes(orderInput.condoName.toLowerCase()) || a.label.toLowerCase().includes(orderInput.condoName.toLowerCase()))
        );
        if (!hasAddr && orderInput.condoName) {
          this.addCustomerAddress(existingCust.id, {
            label: orderInput.condoName,
            address: `${orderInput.condoName}, ${orderInput.district}`,
            district: orderInput.district,
            roomNumber: orderInput.roomNumber || '',
            leaveWithJuristic: Boolean(orderInput.leaveWithJuristic),
            isPrimary: false
          });
        }
        // Update company tax if provided in booking
        if (orderInput.companyTax?.required) {
          this.updateCustomer(existingCust.id, { companyTax: orderInput.companyTax });
        }
      } else if (orderInput.customerName) {
        this.createCustomer({
          fullName: orderInput.customerName,
          nickName: orderInput.nickName || orderInput.customerName.split(' ')[0],
          gender: orderInput.gender || 'Rather not say',
          mobileNumber: orderInput.contactChannel === 'whatsapp' || /^\+?\d{8,15}$/.test(orderInput.contactValue) ? orderInput.contactValue : '',
          isWhatsApp: orderInput.contactChannel === 'whatsapp' || Boolean(orderInput.isWhatsApp),
          email: orderInput.email || '',
          lineId: orderInput.contactChannel === 'line' ? orderInput.contactValue : (orderInput.lineId || ''),
          address: `${orderInput.condoName || ''}, ${orderInput.district || ''}`,
          district: orderInput.district,
          roomNumber: orderInput.roomNumber || '',
          leaveWithJuristic: Boolean(orderInput.leaveWithJuristic),
          companyTax: orderInput.companyTax
        });
      }
    } catch (custErr) {
      console.warn('Auto CRM sync warning:', custErr);
    }

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).then(res => {
      if (res.ok) return res.json();
    }).then(savedOrder => {
      if (savedOrder && savedOrder.id) {
        this.orders = this.orders.map(o => o.id === newOrder.id ? savedOrder : o);
        this.persist(STORAGE_KEYS.ORDERS, this.orders);
        this.notify();
      }
    }).catch(err => {
      console.warn('Failed to sync order to PostgreSQL:', err);
    });

    return newOrder;
  }

  updateOrderStatus(orderId, newStatus, note = '', actualWeightKg = null, tagNumber = null) {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);

    this.orders = this.orders.map(order => {
      if (order.id === orderId) {
        let updated = { ...order, status: newStatus };
        
        if (tagNumber && tagNumber.trim()) {
          updated.tagNumber = tagNumber.trim();
        }

        if (actualWeightKg !== null && actualWeightKg !== undefined && actualWeightKg !== '') {
          const actualKg = Number(actualWeightKg);
          updated.actualWeightKg = actualKg;
          // Recalculate price: maximum of actual weight or minimum weight
          const billableKg = Math.max(actualKg, updated.minWeightAppliedKg || 4.0);
          updated.totalPrice = Math.round(billableKg * updated.pricePerKg);
        }

        const newTimelineEvent = {
          status: newStatus,
          timestamp: timestampStr,
          note: note || ('Status updated to ' + newStatus.replace(/_/g, ' ') + '.')
        };

        updated.timeline = [...(order.timeline || []), newTimelineEvent];
        return updated;
      }
      return order;
    });

    this.persist(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();

    fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStatus, note, actualWeightKg, tagNumber })
    }).catch(err => {
      console.warn('Failed to sync order status to PostgreSQL:', err);
    });
  }

  // Mark Order Paid via 3rd-Party Gateway
  markOrderPaid(orderId, paymentMethod = 'PromptPay QR', transactionRef = '') {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const ref = transactionRef || 'TXN-' + Math.floor(100000 + Math.random() * 900000);

    this.orders = this.orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          paymentStatus: 'PAID',
          paymentMethod,
          paymentRef: ref,
          timeline: [
            ...(order.timeline || []),
            {
              status: 'PAID',
              timestamp: timestampStr,
              note: `Cashless payment verified via 3rd-Party Gateway (${paymentMethod}). Ref: ${ref}. Amount: ฿${order.totalPrice} THB.`
            }
          ]
        };
      }
      return order;
    });

    this.persist(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();

    fetch(`/api/orders/${encodeURIComponent(orderId)}/pay`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod, transactionRef: ref })
    }).catch(err => {
      console.warn('Failed to sync payment status to PostgreSQL:', err);
    });
  }

  createIncident(incidentInput) {
    const now = new Date();
    const newInc = {
      id: 'INC-' + Math.floor(100 + Math.random() * 900),
      orderId: incidentInput.orderId,
      customerName: incidentInput.customerName,
      channel: incidentInput.channel,
      contact: incidentInput.contact,
      subject: incidentInput.subject,
      message: incidentInput.message,
      category: incidentInput.category || 'General Inquiry',
      severity: incidentInput.severity || 'normal',
      affectedItem: incidentInput.affectedItem || '',
      imageUrl: incidentInput.imageUrl || null,
      status: 'pending',
      createdAt: now.toISOString(),
      response: null
    };

    this.incidents = [newInc, ...this.incidents];
    this.persist(STORAGE_KEYS.INCIDENTS, this.incidents);
    this.notify();

    fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInc)
    }).catch(err => {
      console.warn('Failed to sync incident to PostgreSQL:', err);
    });

    return newInc;
  }

  resolveIncident(incidentId, responseText) {
    this.incidents = this.incidents.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'resolved',
          response: responseText
        };
      }
      return inc;
    });
    this.persist(STORAGE_KEYS.INCIDENTS, this.incidents);
    this.notify();

    fetch(`/api/incidents/${encodeURIComponent(incidentId)}/resolve`, {
      method: 'PATCH',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify({ responseText })
    }).catch(err => {
      console.warn('Failed to sync incident resolution to PostgreSQL:', err);
    });
  }

  // ==========================================
  // CRM & Customer Management Methods
  // ==========================================

  getEnrichedCustomers() {
    return (this.customers || []).map(cust => {
      // Find orders matching customer name, mobile, or email
      const custOrders = (this.orders || []).filter(o => {
        if (!o) return false;
        const matchName = o.customerName && cust.fullName && 
          o.customerName.trim().toLowerCase() === cust.fullName.trim().toLowerCase();
        const matchEmail = o.email && cust.email && 
          o.email.trim().toLowerCase() === cust.email.trim().toLowerCase();
        const matchPhone = o.contactValue && cust.mobileNumber && 
          o.contactValue.replace(/[^0-9]/g, '') === cust.mobileNumber.replace(/[^0-9]/g, '');
        return matchName || matchEmail || matchPhone;
      });

      const activeOrders = custOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
      const pastOrders = custOrders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');
      const totalSpend = custOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
      const totalKg = custOrders.reduce((sum, o) => sum + (Number(o.actualWeightKg || o.estimatedWeightKg) || 0), 0);

      // Find incidents matching customer name, contact or orderId
      const custIncidents = (this.incidents || []).filter(inc => {
        if (!inc) return false;
        const matchCustName = inc.customerName && cust.fullName &&
          inc.customerName.trim().toLowerCase() === cust.fullName.trim().toLowerCase();
        const matchOrderId = inc.orderId && custOrders.some(o => o.id === inc.orderId);
        return matchCustName || matchOrderId;
      });

      const openIncidents = custIncidents.filter(i => i.status === 'pending');
      const primaryAddress = (cust.addresses || []).find(a => a.isPrimary) || (cust.addresses || [])[0] || null;

      return {
        ...cust,
        orders: custOrders,
        activeOrders,
        pastOrders,
        totalOrders: custOrders.length,
        totalSpend,
        totalKg: Number(totalKg.toFixed(1)),
        incidents: custIncidents,
        openIncidentsCount: openIncidents.length,
        primaryAddress
      };
    });
  }

  createCustomer(data) {
    const newId = 'CUST-' + Math.floor(1000 + Math.random() * 9000);
    const newCustomer = {
      id: newId,
      fullName: (data.fullName || '').trim(),
      nickName: (data.nickName || '').trim(),
      gender: data.gender || 'Rather not say',
      dateOfBirth: data.dateOfBirth || '',
      mobileNumber: (data.mobileNumber || '').trim(),
      isWhatsApp: Boolean(data.isWhatsApp),
      secondaryMobile: (data.secondaryMobile || '').trim(),
      isSecondaryWhatsApp: Boolean(data.isSecondaryWhatsApp),
      email: (data.email || '').trim().toLowerCase(),
      lineId: (data.lineId || '').trim(),
      pinCode: data.pinCode || '123456',
      isVerified: Boolean(data.isVerified),
      verifiedVia: data.verifiedVia || null,
      companyTax: {
        required: Boolean(data.companyTax?.required),
        companyName: (data.companyTax?.companyName || '').trim(),
        taxId: (data.companyTax?.taxId || '').trim(),
        branch: (data.companyTax?.branch || '').trim(),
        companyAddress: (data.companyTax?.companyAddress || '').trim()
      },
      addresses: Array.isArray(data.addresses) && data.addresses.length > 0 ? data.addresses : [
        {
          id: 'ADDR-' + Math.floor(100 + Math.random() * 900),
          label: data.addressLabel || 'Home',
          address: data.address || '',
          district: data.district || 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
          roomNumber: data.roomNumber || '',
          googleMapsUrl: data.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address || data.condoName || 'Bangkok')}`,
          leaveWithJuristic: Boolean(data.leaveWithJuristic),
          isPrimary: true
        }
      ],
      tier: data.tier || 'Regular',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    this.customers = [newCustomer, ...(this.customers || [])];
    this.persist(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();

    fetch('/api/customers', {
      method: 'POST',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(newCustomer)
    }).catch(err => console.warn('PostgreSQL customer sync error:', err));

    return newCustomer;
  }

  updateCustomer(id, data) {
    this.customers = (this.customers || []).map(cust => {
      if (cust.id === id) {
        return {
          ...cust,
          ...data,
          fullName: data.fullName !== undefined ? data.fullName.trim() : cust.fullName,
          nickName: data.nickName !== undefined ? data.nickName.trim() : cust.nickName,
          gender: data.gender !== undefined ? data.gender : cust.gender,
          dateOfBirth: data.dateOfBirth !== undefined ? data.dateOfBirth : cust.dateOfBirth,
          mobileNumber: data.mobileNumber !== undefined ? data.mobileNumber.trim() : cust.mobileNumber,
          isWhatsApp: data.isWhatsApp !== undefined ? Boolean(data.isWhatsApp) : cust.isWhatsApp,
          secondaryMobile: data.secondaryMobile !== undefined ? data.secondaryMobile.trim() : (cust.secondaryMobile || ''),
          isSecondaryWhatsApp: data.isSecondaryWhatsApp !== undefined ? Boolean(data.isSecondaryWhatsApp) : Boolean(cust.isSecondaryWhatsApp),
          email: data.email !== undefined ? data.email.trim().toLowerCase() : cust.email,
          lineId: data.lineId !== undefined ? data.lineId.trim() : cust.lineId,
          tier: data.tier !== undefined ? data.tier : cust.tier,
          notes: data.notes !== undefined ? data.notes : cust.notes,
          companyTax: data.companyTax ? { ...cust.companyTax, ...data.companyTax } : cust.companyTax,
          addresses: Array.isArray(data.addresses) ? data.addresses : cust.addresses
        };
      }
      return cust;
    });
    this.persist(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();

    fetch(`/api/customers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(data)
    }).catch(err => console.warn('PostgreSQL update customer error:', err));
  }

  deleteCustomer(id) {
    this.customers = (this.customers || []).filter(c => c.id !== id);
    this.persist(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();

    fetch(`/api/customers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getAdminAuthHeaders()
    }).catch(err => console.warn('PostgreSQL delete customer error:', err));
  }

  addCustomerAddress(customerId, addressData) {
    const addrId = 'ADDR-' + Math.floor(100 + Math.random() * 900);
    const newAddr = {
      id: addrId,
      label: addressData.label || 'Home',
      address: addressData.address || '',
      district: addressData.district || 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
      roomNumber: addressData.roomNumber || '',
      googleMapsUrl: addressData.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressData.address || 'Bangkok')}`,
      leaveWithJuristic: Boolean(addressData.leaveWithJuristic),
      isPrimary: Boolean(addressData.isPrimary)
    };

    this.customers = (this.customers || []).map(cust => {
      if (cust.id === customerId) {
        let addresses = [...(cust.addresses || [])];
        if (newAddr.isPrimary) {
          addresses = addresses.map(a => ({ ...a, isPrimary: false }));
        }
        addresses.push(newAddr);
        return { ...cust, addresses };
      }
      return cust;
    });

    this.persist(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();
    return newAddr;
  }

  updateCustomerAddress(customerId, addressId, addressData) {
    this.customers = (this.customers || []).map(cust => {
      if (cust.id === customerId) {
        let addresses = (cust.addresses || []).map(a => {
          if (a.id === addressId) {
            const updated = {
              ...a,
              ...addressData,
              googleMapsUrl: addressData.googleMapsUrl || (addressData.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressData.address)}` : a.googleMapsUrl)
            };
            return updated;
          }
          return addressData.isPrimary ? { ...a, isPrimary: false } : a;
        });
        return { ...cust, addresses };
      }
      return cust;
    });
    this.persist(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();
  }

  deleteCustomerAddress(customerId, addressId) {
    this.customers = (this.customers || []).map(cust => {
      if (cust.id === customerId) {
        let addresses = (cust.addresses || []).filter(a => a.id !== addressId);
        if (addresses.length > 0 && !addresses.some(a => a.isPrimary)) {
          addresses[0].isPrimary = true;
        }
        return { ...cust, addresses };
      }
      return cust;
    });
    this.persist(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();
  }

  setCustomerPin(customerId, pinCode) {
    if (!/^\d{6}$/.test(pinCode)) {
      throw new Error('PIN must be exactly 6 digits.');
    }
    this.customers = (this.customers || []).map(cust => {
      if (cust.id === customerId) {
        return { ...cust, pinCode };
      }
      return cust;
    });
    this.persist(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();
    return true;
  }

  verifyCustomerPin(customerIdOrContact, pinCode) {
    const cust = (this.customers || []).find(c => 
      c.id === customerIdOrContact ||
      c.mobileNumber === customerIdOrContact ||
      c.email === customerIdOrContact
    );
    if (!cust) return { success: false, error: 'Customer not found.' };
    if (cust.pinCode === pinCode) {
      return { success: true, customer: cust };
    }
    return { success: false, error: 'Incorrect 6-digit PIN.' };
  }

  generateOtp(channel, contact) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    if (!this.activeOtps) this.activeOtps = new Map();
    const key = `${channel}:${contact.trim().toLowerCase()}`;
    this.activeOtps.set(key, { code, expiry });
    return { success: true, code, channel, contact, expiry };
  }

  verifyOtp(channel, contact, enteredCode) {
    if (!this.activeOtps) return { success: false, error: 'No OTP generated.' };
    const key = `${channel}:${contact.trim().toLowerCase()}`;
    const entry = this.activeOtps.get(key);
    if (!entry) {
      // Demo fallback: accept 123456 or 888888 as universal test OTP
      if (enteredCode === '123456' || enteredCode === '888888') {
        return { success: true };
      }
      return { success: false, error: 'Expired or invalid OTP.' };
    }
    if (Date.now() > entry.expiry.getTime()) {
      this.activeOtps.delete(key);
      return { success: false, error: 'OTP has expired. Please request a new one.' };
    }
    if (entry.code === enteredCode.trim()) {
      this.activeOtps.delete(key);
      // Mark customer verified if found
      this.customers = (this.customers || []).map(c => {
        if (c.mobileNumber === contact || c.email === contact) {
          return { ...c, isVerified: true, verifiedVia: channel };
        }
        return c;
      });
      this.persist(STORAGE_KEYS.CUSTOMERS, this.customers);
      this.notify();
      return { success: true };
    }
    return { success: false, error: 'Incorrect verification code.' };
  }

  addCustomerNote(customerId, noteText) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.customers = (this.customers || []).map(cust => {
      if (cust.id === customerId) {
        const currentNotes = cust.notes ? cust.notes + `\n[${timestamp}] ${noteText}` : `[${timestamp}] ${noteText}`;
        return { ...cust, notes: currentNotes };
      }
      return cust;
    });
    this.persist(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();
  }

  // ==========================================
  // FAQ MANAGEMENT
  // ==========================================
  getFaqs() {
    return [...(this.faqs || [])].sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  getPublishedFaqs() {
    return this.getFaqs().filter(f => f.isPublished !== false);
  }

  addFaq(faqData) {
    const newFaq = {
      id: 'FAQ-' + Math.floor(100 + Math.random() * 900),
      category: (faqData.category || 'General').trim(),
      question: (faqData.question || '').trim(),
      answer: (faqData.answer || '').trim(),
      order: parseInt(faqData.order) || ((this.faqs?.length || 0) + 1),
      isPublished: faqData.isPublished !== undefined ? Boolean(faqData.isPublished) : true,
      createdAt: new Date().toISOString()
    };
    if (!this.faqs) this.faqs = [];
    this.faqs.push(newFaq);
    this.persist(STORAGE_KEYS.FAQS, this.faqs);
    this.notify();
    return newFaq;
  }

  updateFaq(faqId, updatedData) {
    if (!this.faqs) return null;
    const idx = this.faqs.findIndex(f => f.id === faqId);
    if (idx === -1) return null;

    this.faqs[idx] = {
      ...this.faqs[idx],
      category: updatedData.category !== undefined ? updatedData.category.trim() : this.faqs[idx].category,
      question: updatedData.question !== undefined ? updatedData.question.trim() : this.faqs[idx].question,
      answer: updatedData.answer !== undefined ? updatedData.answer.trim() : this.faqs[idx].answer,
      order: updatedData.order !== undefined ? parseInt(updatedData.order) : this.faqs[idx].order,
      isPublished: updatedData.isPublished !== undefined ? Boolean(updatedData.isPublished) : this.faqs[idx].isPublished,
      updatedAt: new Date().toISOString()
    };
    this.persist(STORAGE_KEYS.FAQS, this.faqs);
    this.notify();
    return this.faqs[idx];
  }

  deleteFaq(faqId) {
    if (!this.faqs) return false;
    this.faqs = this.faqs.filter(f => f.id !== faqId);
    this.persist(STORAGE_KEYS.FAQS, this.faqs);
    this.notify();
    return true;
  }

  toggleFaqPublish(faqId) {
    if (!this.faqs) return false;
    const faq = this.faqs.find(f => f.id === faqId);
    if (faq) {
      faq.isPublished = !faq.isPublished;
      this.persist(STORAGE_KEYS.FAQS, this.faqs);
      this.notify();
      return faq.isPublished;
    }
    return false;
  }

  resetAllData() {
    this.services = INITIAL_SERVICES.map(s => ({ ...s, minWeightKg: 4.0 }));
    this.orders = INITIAL_ORDERS;
    this.incidents = INITIAL_INCIDENTS;
    this.customers = INITIAL_CUSTOMERS;
    this.faqs = INITIAL_FAQS;
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.FAQS);
    this.notify();
  }
}

export const laundryStore = new LaundryStore();
