// State and LocalStorage / PostgreSQL Management for NoName Laundry
import { INITIAL_SERVICES, INITIAL_ORDERS, INITIAL_INCIDENTS } from './data/servicesData.js';

const STORAGE_KEYS = {
  SERVICES: 'noname_laundry_services_v2',
  ORDERS: 'noname_laundry_orders_v2',
  INCIDENTS: 'noname_laundry_incidents_v2',
  SETTINGS: 'noname_laundry_settings_v2',
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
      // Guarantee minimum weight default is at least 4.0 KG
      this.services = loadedServices.map(s => ({
        ...s,
        minWeightKg: Number(s.minWeightKg) < 4.0 ? 4.0 : Number(s.minWeightKg)
      }));

      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      this.orders = savedOrders ? JSON.parse(savedOrders) : INITIAL_ORDERS;

      const savedIncidents = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      this.incidents = savedIncidents ? JSON.parse(savedIncidents) : INITIAL_INCIDENTS;

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
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      this.services = INITIAL_SERVICES.map(s => ({ ...s, minWeightKg: 4.0 }));
      this.orders = INITIAL_ORDERS;
      this.incidents = INITIAL_INCIDENTS;
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
        return {
          ...srv,
          ...updatedData,
          name: updatedData.name ? updatedData.name.trim() : srv.name,
          nameTh: updatedData.nameTh ? updatedData.nameTh.trim() : srv.nameTh,
          description: updatedData.description !== undefined ? updatedData.description.trim() : srv.description,
          pricePerKg: updatedData.pricePerKg !== undefined ? Number(updatedData.pricePerKg) : srv.pricePerKg,
          minWeightKg: updatedData.minWeightKg !== undefined ? Math.max(1, Number(updatedData.minWeightKg)) : srv.minWeightKg,
          turnaroundHours: updatedData.turnaroundHours !== undefined ? Number(updatedData.turnaroundHours) : srv.turnaroundHours,
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

    const res = await fetch(`/api/services/${encodeURIComponent(serviceId)}`, {
      method: 'PUT',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(updatedData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update service ${serviceId} (HTTP ${res.status})`);
    }
    const saved = await res.json();
    this.services = this.services.map(s => s.id === serviceId ? { ...s, ...saved } : s);
    this.persist(STORAGE_KEYS.SERVICES, this.services);
    this.notify();
    return saved;
  }

  async updateAllServices(servicesList) {
    if (!Array.isArray(servicesList)) return;

    // Optimistically update
    const map = new Map(servicesList.map(s => [s.id, s]));
    this.services = this.services.map(srv => {
      const draft = map.get(srv.id);
      if (!draft) return srv;
      return {
        ...srv,
        ...draft,
        pricePerKg: draft.pricePerKg !== undefined ? Number(draft.pricePerKg) : srv.pricePerKg,
        minWeightKg: draft.minWeightKg !== undefined ? Math.max(1, Number(draft.minWeightKg)) : srv.minWeightKg,
        turnaroundHours: draft.turnaroundHours !== undefined ? Number(draft.turnaroundHours) : srv.turnaroundHours,
        features: Array.isArray(draft.features) ? draft.features : srv.features
      };
    });
    this.persist(STORAGE_KEYS.SERVICES, this.services);
    this.notify();

    const res = await fetch('/api/services', {
      method: 'PUT',
      headers: this.getAdminAuthHeaders(),
      body: JSON.stringify(servicesList)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to batch update services (HTTP ${res.status})`);
    }
    const savedServices = await res.json();
    if (Array.isArray(savedServices) && savedServices.length > 0) {
      this.services = savedServices;
      this.persist(STORAGE_KEYS.SERVICES, this.services);
      this.notify();
    }
    return savedServices;
  }

  // Add a brand new service dynamically
  addService(serviceData) {
    const id = serviceData.id || serviceData.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);
    const newService = {
      id,
      name: serviceData.name.trim(),
      nameTh: serviceData.nameTh ? serviceData.nameTh.trim() : serviceData.name.trim(),
      description: serviceData.description.trim(),
      unit: 'KG',
      pricePerKg: Number(serviceData.pricePerKg) || 80,
      minWeightKg: Number(serviceData.minWeightKg) || 4.0,
      turnaroundHours: Number(serviceData.turnaroundHours) || 24,
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
    const weightToBill = Math.max(Number(orderInput.estimatedWeightKg), Number(service.minWeightKg));
    const calculatedTotal = Math.round(weightToBill * Number(service.pricePerKg));

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
      pricePerKg: service.pricePerKg,
      totalPrice: calculatedTotal,
      status: 'BOOKING_REQUESTED',
      paymentStatus: 'PENDING', // PENDING, PAID
      paymentMethod: null,
      paymentRef: null,
      tagNumber: 'TAG-PENDING',
      pickupDate: orderInput.pickupDate,
      pickupTime: orderInput.pickupTime,
      deliveryDate: orderInput.deliveryDate || 'Scheduled (24-48h)',
      deliveryTime: orderInput.deliveryTime || 'TBD',
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

  resetAllData() {
    this.services = INITIAL_SERVICES.map(s => ({ ...s, minWeightKg: 4.0 }));
    this.orders = INITIAL_ORDERS;
    this.incidents = INITIAL_INCIDENTS;
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    this.notify();
  }
}

export const laundryStore = new LaundryStore();
