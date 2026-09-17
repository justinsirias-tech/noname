# NoName Laundry Bangkok — 100% Digital Laundry Platform

> **Bangkok's premier cloud laundry pickup & delivery service by KG.**  
> Purely digital door-to-door operations across Bangkok condominiums and private residences.

---

## 🚀 Key Operating Model & Architecture

### 1. Zero Physical Storefront
- Operates entirely as a digital door-to-door collection & delivery model.
- Designed specifically for Bangkok high-rise condominium living and expat communities (Watthana, Khlong Toei, Bang Rak, Sathon, Pathum Wan, Ari, etc.).
- Seamless support for **Condo Juristic Office / Front Lobby Drop-off & Collection**.

### 2. Strictly Online Communications (No Phone Calls Policy)
- **Official Channels**:
  - **WhatsApp**: Direct click-to-chat integration (`+66 94 882 1920`)
  - **LINE Official**: `@nonamelaundry`
  - **Email**: `support@nonamelaundry.com`
- **Zero Phone Calls Policy**: Prominently emphasized across the top banner, hero section, booking terms modal, incident tracker, and footer. All inquiries, driver coordination, and incident claims are handled strictly online with written photographic records.

### 3. Services by Weight (KG)
- **Wash / Fold**: Everyday wear, t-shirts, gym apparel, towels, bed linens.
- **Wash / Iron / Fold**: Work shirts, trousers, blouses with crisp steam pressing.
- **Wash / Iron / Hang**: Business suits, formal wear returned on heavy-duty hangers in protective breathable garment bags.

### 4. Admin Dynamic Pricing & Minimum Weight Control
- The **Admin POS** back-office (`/admin`) allows management to dynamically adjust:
  - **Price per KG (THB)** for each service.
  - **Minimum Weight (KG)** threshold for each service.
- Changes update in real-time and immediately reflect in the customer booking calculator and dynamic price quotes.

### 5. Terms & Conditions Summary Flow & Mandatory Checkbox
- **Summary Modal**: Customers can review the 6 key operational points (Zero Phone Support, Digital Scale Weighing, Condo Juristic Protocol, 24–48h Turnaround, Garment Exclusions, 24h Incident Window).
- **Mandatory Agreement Checkbox**: The booking form enforces a required checkbox stating agreement to the terms and understanding the online-only support policy before booking submission is permitted.
- **Dedicated Full Legal Page**: Detailed legal agreement covering liability limits, care label exclusions, and claims procedures.

### 6. Robust POS & Job Tracking System
- **10-Step State Machine**:
  `Booking Requested` ➔ `Pickup Scheduled` ➔ `Bag Collected (Barcode Tagged)` ➔ `Weighed & Inspected` ➔ `In Wash / Drying` ➔ `Ironing & Finishing` ➔ `Ready for Dispatch` ➔ `Out for Delivery` ➔ `Delivered & Complete` (or `Cancelled`).
- **Scale Weight Audit**:
  - Compares Customer Estimated KG against Central Facility Digital Scale KG.
  - Automatically calculates final invoice total based on `Math.max(ScaleWeight, MinWeight) * Rate`.
- **Customer Self-Service Tracking**:
  - Real-time status lookup using Tracking ID (e.g. `NNL-8491-BK`) or phone/LINE.
  - Step-by-step activity timeline with staff timestamps.
  - Direct WhatsApp & LINE buttons with prefilled tracking query.
  - Built-in Online Support Ticket Submission form.
- **Admin POS Operations**:
  - Real-time KPI stats (Active Orders, Revenue, Pending Scale Weigh-ins, Open Tickets).
  - Order detail editor (assign barcode tag number, log scale weight, change status, add internal notes).
  - Manual Walk-in / Chat-in Order Entry form.
  - Online Incident & Complaint Resolution Queue.

---

## 💻 Running the Application Locally

The application is structured to run seamlessly without dependency lockups or build steps:

### Option 1: Python (Instant)
```bash
python -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option 2: Node.js / NPX
```bash
npx serve .
```

---

## 📁 Project Structure

```
noname-laundry/
├── index.html                       # Application entry point with Tailwind & Babel
├── package.json                     # Project scripts and metadata
├── README.md                        # Documentation and architecture guide
├── css/
│   └── custom.css                   # Custom styling, fonts, and status indicators
├── js/
│   ├── App.jsx                      # Main router, state coordinator, floating support
│   ├── store.js                     # LocalStorage reactive store for orders & pricing
│   ├── data/
│   │   ├── servicesData.js          # Services, Bangkok districts, initial demo orders
│   │   └── termsData.js             # Legal clauses and summary highlights
│   └── components/
│       ├── Icons.jsx                # High-fidelity SVG icons (WhatsApp, LINE, Scale, etc.)
│       ├── Navbar.jsx               # Header with digital badges and quick links
│       ├── Hero.jsx                 # Tagline, value propositions, interactive calculator
│       ├── DigitalSupportBanner.jsx # Strict online-only support highlight banner
│       ├── ServicesSection.jsx      # Cards for 3 services with dynamic min weight & rate
│       ├── HowItWorks.jsx           # 4-step Bangkok pickup & delivery workflow
│       ├── BookingWizard.jsx        # Step-by-step booking with mandatory T&C agreement
│       ├── TermsModal.jsx           # Pre-booking key terms summary modal
│       ├── OrderTracker.jsx         # Live customer tracking portal & ticket reporting
│       ├── TermsAndConditions.jsx   # Dedicated full terms and conditions page
│       ├── AdminPOS.jsx             # Back-office POS, pricing configurator, order manager
│       ├── DigitalContactModal.jsx  # Floating contact modal with direct chat links
│       └── Footer.jsx               # Bangkok coverage, legal links, and policy notices
```
