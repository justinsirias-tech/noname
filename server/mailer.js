require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'nonamelaundrybooking@gmail.com';
const SMTP_USER = process.env.SMTP_USER || 'nonamelaundrybooking@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS;

let transporter = null;

function getTransporter() {
  const pass = (process.env.SMTP_PASS || SMTP_PASS || '').replace(/\s+/g, '');
  if (!pass) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || SMTP_USER,
        pass: pass
      }
    });
  }
  return transporter;
}

function resetTransporter() {
  transporter = null;
}

async function verifySmtpConnection() {
  const mailer = getTransporter();
  if (!mailer) {
    return { ok: false, error: 'SMTP_PASS environment variable is not configured.' };
  }
  return new Promise((resolve) => {
    mailer.verify((error) => {
      if (error) {
        resolve({ ok: false, error: error.message || String(error) });
      } else {
        resolve({ ok: true, user: process.env.SMTP_USER || SMTP_USER });
      }
    });
  });
}

/**
 * 1. FIRST EMAIL: Booking Confirmation Only
 * Sent immediately when the customer books online.
 * Contains only schedule, pickup details, and service expectations.
 * No tracking and no premature payment request.
 */
async function sendBookingConfirmationEmail(order, overrideRecipient = null) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('[MAILER] SMTP_PASS not configured. Skipping booking confirmation for order:', order?.id);
    return { sent: false, reason: 'SMTP_PASS_NOT_CONFIGURED' };
  }

  const trackingId = order.id || order.trackingNumber || 'NNL-NEW';
  const customerName = order.customerName || order.customer_name || 'Customer';
  const contactChannel = (order.contactChannel || order.contact_channel || 'Online').toUpperCase();
  const contactValue = order.contactValue || order.contact_value || 'N/A';
  const customerEmail = order.email || '';
  const serviceName = order.serviceName || order.service_name || 'Wash / Fold';
  const pickupDate = order.pickupDate || order.pickup_date || 'Today';
  const pickupTime = order.pickupTime || order.pickup_time || '14:00 - 16:00';
  const deliveryDate = order.deliveryDate || order.delivery_date || 'Standard';
  const condo = order.condoName || order.condo_name || '';
  const room = order.roomNumber || order.room_number || '';
  const district = order.district || '';
  const juristic = order.leaveWithJuristic || order.leave_with_juristic ? 'Leave at Lobby / Juristic Office' : 'Meet in Person (subject to rider availability)';
  const instructions = order.specialInstructions || order.special_instructions || 'None';
  const speed = order.turnaroundSpeed || order.turnaround_speed || 'standard';

  const addressLine = [room && `Room ${room}`, condo, district, 'Bangkok'].filter(Boolean).join(', ');
  const logoPath = path.join(__dirname, '../images/logo.png');
  const speedLabel = speed === 'same_day' ? '⚡ Same-Day Rush (12h)' : speed === 'next_day' ? '🚀 Next-Day Fast (24h)' : '✨ Standard Care (48h)';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - ${trackingId}</title>
    </head>
    <body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
        
        <!-- Header with Official Company Logo -->
        <div style="background-color: #ffffff; padding: 28px 24px 20px 24px; text-align: center; border-bottom: 2px solid #f1f5f9;">
          <img src="cid:companylogo" alt="NoName Laundry" style="height: 52px; width: auto; max-width: 220px; object-fit: contain; margin: 0 auto 10px auto; display: block;" />
          <div style="display: inline-block; background-color: #e0f2fe; border: 1px solid #bae6fd; border-radius: 9999px; padding: 4px 14px; margin-top: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #0369a1; letter-spacing: 0.5px; text-transform: uppercase;">
              ✓ Booking Scheduled • Order #${trackingId}
            </span>
          </div>
        </div>

        <!-- Greeting & Confirmation -->
        <div style="padding: 26px 28px; line-height: 1.6;">
          <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
            Hi ${customerName},
          </h2>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.5;">
            Thank you for booking with <strong>NoName Laundry Bangkok</strong>! We have received your pickup request. Our rider will collect your laundry during your scheduled time window.
          </p>

          <!-- Pickup & Schedule Details Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0284c7; letter-spacing: 0.5px; margin-bottom: 12px;">
              📍 Scheduled Pickup Details
            </div>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; color: #64748b; width: 140px;">Pickup Time:</td>
                <td style="padding: 5px 0; font-weight: 700; color: #0284c7;">${pickupDate} (${pickupTime})</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;">Service Requested:</td>
                <td style="padding: 5px 0; font-weight: 700; color: #0f172a;">${serviceName} (฿70/KG, min 4 KG)</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;">Service Speed:</td>
                <td style="padding: 5px 0; font-weight: 600; color: #0f172a;">${speedLabel}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;">Delivery Target:</td>
                <td style="padding: 5px 0; color: #0f172a;">${deliveryDate}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;">Pickup Address:</td>
                <td style="padding: 5px 0; font-weight: 600; color: #0f172a;">${addressLine || 'Bangkok'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;">Handover Preference:</td>
                <td style="padding: 5px 0; font-weight: 600; color: #0f172a;">${juristic}</td>
              </tr>
              ${instructions && instructions !== 'None' ? `
              <tr>
                <td style="padding: 5px 0; color: #64748b;">Special Notes:</td>
                <td style="padding: 5px 0; color: #e11d48;">${instructions}</td>
              </tr>` : ''}
            </table>
          </div>

          <!-- What Happens Next Box -->
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin-bottom: 22px;">
            <div style="font-size: 13px; font-weight: 800; color: #166534; margin-bottom: 8px;">
              👉 What Happens Next?
            </div>
            <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e293b; line-height: 1.6;">
              <li style="margin-bottom: 6px;">Our rider collects your laundry bag at your scheduled pickup window.</li>
              <li style="margin-bottom: 6px;">At our facility, our staff inspects and weighs your clothes on a certified digital scale.</li>
              <li>Once weighed, you will receive your <strong>Confirmed Billing & Payment Link</strong> via email and WhatsApp to complete payment easily via PromptPay QR Code or Credit/Debit Card.</li>
            </ol>
          </div>

          <!-- Customer Support Notice -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; font-size: 12px; color: #475569; text-align: center; line-height: 1.6;">
            <strong>Need to adjust your pickup time or have any questions?</strong><br />
            💬 WhatsApp: <strong style="color: #0f172a;">@nonamelaundry</strong> &nbsp;|&nbsp; 💬 LINE: <strong style="color: #0f172a;">@nonamelaundry</strong> &nbsp;|&nbsp; 📞 Phone: <strong style="color: #0f172a;">+66 80 888 9885</strong>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
            NoName Laundry Bangkok Co., Ltd. • 100% Cashless Digital Laundry by KG<br />
            Booking Confirmation for Order #${trackingId}
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  const targetEmail = (overrideRecipient || customerEmail || '').trim();
  const hasValidCustomerEmail = targetEmail && targetEmail.includes('@') && !targetEmail.includes('@customer.local');

  const mailOptions = {
    from: `"NoName Laundry" <${process.env.SMTP_USER || SMTP_USER}>`,
    to: hasValidCustomerEmail ? targetEmail : NOTIFICATION_EMAIL,
    bcc: hasValidCustomerEmail ? NOTIFICATION_EMAIL : undefined,
    subject: `🧺 Booking Confirmation - Order #${trackingId} (${customerName})`,
    html: htmlContent,
    attachments: [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'companylogo'
      }
    ]
  };

  try {
    const info = await mailer.sendMail(mailOptions);
    console.log(`[MAILER] Booking confirmation email sent for ${trackingId} to [${mailOptions.to}]. MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId, recipients: [mailOptions.to, mailOptions.bcc].filter(Boolean) };
  } catch (error) {
    console.error(`[MAILER] Failed to send booking confirmation for ${trackingId}:`, error);
    return { sent: false, error: error.message };
  }
}

/**
 * 2. SECOND EMAIL: Confirmed Billing & Cashless Payment Link
 * Dispatched by the Admin after all needed weighing and intake is complete.
 * Contains verified scale weights, itemized total, and direct payment gateway link.
 * Exactly matches the official Tax Invoice & Payment Due template.
 */
async function sendConfirmedBillingEmail(order, overrideRecipient = null) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('[MAILER] SMTP_PASS not configured. Skipping confirmed billing email for order:', order?.id);
    return { sent: false, reason: 'SMTP_PASS_NOT_CONFIGURED' };
  }

  const trackingId = order.id || order.trackingNumber || 'NNL-NEW';
  const invoiceNumber = (order.id || 'NEW').startsWith('INV-') ? order.id : `INV-${order.id}`;
  const customerName = order.customerName || order.customer_name || 'Customer';
  const customerEmail = order.email || '';
  const serviceName = order.serviceName || order.service_name || 'Wash / Iron / Fold';

  const condoName = order.condoName || order.condo_name || ((order.city || 'Bangkok') + ' Residence');
  const roomNumber = order.roomNumber || order.room_number || 'Lobby Reception';
  const subdistrict = order.subdistrict || order.sub_district || '';
  const district = order.district || '';
  const city = order.city || 'Bangkok';
  const postalCode = order.postalCode || order.postal_code || '10110';
  const contactChannel = (order.contactChannel || order.contact_channel || 'WhatsApp').toUpperCase();
  const contactValue = order.contactValue || order.contact_value || 'N/A';

  const pickupDate = order.pickupDate || order.pickup_date || 'Scheduled';
  const pickupTime = order.pickupTime || order.pickup_time || '12:30 - 14:30';
  const deliveryDate = order.deliveryDate || order.delivery_date || 'Scheduled';
  const deliveryTime = order.deliveryTime || order.delivery_time || 'Before 18:00 hrs';

  const speed = (order.turnaroundSpeed || order.turnaround_speed || '').toLowerCase();
  let speedLabel = 'Standard (48h)';
  if (speed.includes('same_day')) {
    speedLabel = 'Same Day Express (<18:00)';
  } else if (speed.includes('next_day')) {
    speedLabel = 'Next Day (24h)';
  }

  const isPiece = order.unit === 'piece' || order.pricingType === 'piece';
  const unitLabel = isPiece ? (order.unit || 'pc') : 'KG';
  const scaleWeight = order.actualWeightKg !== null && order.actualWeightKg !== undefined
    ? Number(order.actualWeightKg)
    : (Number(order.estimatedWeightKg) || (isPiece ? 1 : 4.0));
  const minWeight = Number(order.minWeightAppliedKg || (isPiece ? 1 : 4.0));
  const billableWeight = isPiece ? scaleWeight : Math.max(scaleWeight, minWeight);
  const unitRate = Number(order.pricePerKg || 70);

  const deliveryFee = Number(order.deliveryFee !== undefined && order.deliveryFee !== null ? order.deliveryFee : 0);
  const serviceSubtotal = Number(order.serviceSubtotal !== undefined && order.serviceSubtotal !== null 
    ? order.serviceSubtotal 
    : Math.round(billableWeight * unitRate));
  const totalPrice = Number(order.totalPrice || (serviceSubtotal + deliveryFee));

  const subtotalExclTax = Math.round(totalPrice / 1.07);
  const vatAmount = totalPrice - subtotalExclTax;

  const issueDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const districtParts = [subdistrict, district, city].filter(Boolean).join(', ');
  const districtLine = `${districtParts}${postalCode ? ` (📮 ${postalCode})` : ''}`;
  const deliveryZoneText = `${city} · ${subdistrict || district || 'Central'} – ${postalCode}`;

  const baseUrl = process.env.BASE_URL || 'https://apptest.thatlaundryshop.com';
  const paymentUrl = `${baseUrl}/?track=${encodeURIComponent(trackingId)}&pay=1`;
  const logoPath = path.join(__dirname, '../images/logo.png');

  const hasMultiItems = Array.isArray(order.items) && order.items.length > 0;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tax Invoice & Payment Due - ${invoiceNumber}</title>
    </head>
    <body style="margin: 0; padding: 28px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
      <div style="max-width: 660px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05); padding: 36px 36px 28px 36px; box-sizing: border-box;">
        
        <!-- HEADER ROW: Company Legal Details (Left) + Invoice Due Badge (Right) -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td width="60%" style="vertical-align: top; padding-right: 15px;">
              <img src="cid:companylogo" alt="NoName Laundry" style="height: 48px; width: auto; max-width: 210px; object-fit: contain; margin-bottom: 12px; display: block;" />
              <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.4; margin-bottom: 2px;">
                บริษัท โนเนม ลอนดรี้ แบงค็อก จำกัด (NoName Laundry Bangkok Co., Ltd.)
              </div>
              <div style="font-size: 12px; color: #64748b; line-height: 1.4; margin-bottom: 2px;">
                Watthana / Khlong Toei, Sukhumvit, Bangkok 10110
              </div>
              <div style="font-size: 12px; color: #64748b; line-height: 1.4; margin-bottom: 2px;">
                Tax ID: 0105567089123 • Commercial Garment Care
              </div>
              <div style="font-size: 12px; color: #64748b; line-height: 1.4; margin-bottom: 2px;">
                LINE OA: <strong style="color: #334155;">@nonamelaundry</strong> • WhatsApp: <strong style="color: #334155;">@nonamelaundry</strong> • Phone: <strong style="color: #334155;">+66 80 888 9885</strong>
              </div>
              <div style="font-size: 12px; color: #64748b; line-height: 1.4;">
                Email: nonamelaundrybooking@gmail.com • 100% Cashless Facility
              </div>
            </td>
            <td width="40%" style="vertical-align: top; text-align: right;">
              <div style="display: inline-block; padding: 6px 14px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #b45309; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;">
                TAX INVOICE / PAYMENT DUE
              </div>
              <div style="font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; margin-bottom: 4px;">
                ${invoiceNumber}
              </div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 3px;">
                Issue Date: <strong style="color: #0f172a;">${issueDate}</strong>
              </div>
              <div style="font-size: 12px; color: #64748b;">
                Order Ref: <strong style="color: #0f172a; font-family: monospace;">${trackingId}</strong>
              </div>
            </td>
          </tr>
        </table>

        <!-- TWO SIDE-BY-SIDE CARDS: Customer Information & Delivery Timetable -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 26px;">
          <tr>
            <td width="48.5%" style="vertical-align: top;">
              <div style="border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px; background-color: #ffffff; min-height: 145px; box-sizing: border-box;">
                <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                  BILLED TO / CUSTOMER INFORMATION
                </div>
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
                  ${customerName}
                </div>
                <div style="font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 2px;">
                  ${condoName}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">
                  Unit / Room: ${roomNumber}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
                  ${districtLine}
                </div>
                <div style="border-top: 1px solid #f1f5f9; padding-top: 8px; font-size: 12px; color: #475569;">
                  Contact: <strong style="color: #0f172a; text-transform: uppercase;">${contactChannel}</strong> (${contactValue})
                  ${customerEmail ? `<div style="color: #64748b; font-size: 12px; margin-top: 2px;">${customerEmail}</div>` : ''}
                </div>
              </div>
            </td>
            <td width="3%"></td>
            <td width="48.5%" style="vertical-align: top;">
              <div style="border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px; background-color: #ffffff; min-height: 145px; box-sizing: border-box;">
                <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                  PICKUP & DELIVERY TIMETABLE
                </div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">
                  Pickup Window:
                </div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 14px;">
                  ${pickupDate} • ${pickupTime}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">
                  Scheduled Delivery:
                </div>
                <div style="font-size: 14px; font-weight: 800; color: #0284c7;">
                  ${speedLabel} • ${deliveryTime}
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- CERTIFIED SERVICE SPECIFICATIONS & CERTIFIED WEIGHT -->
        <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
          CERTIFIED SERVICE SPECIFICATIONS & CERTIFIED WEIGHT
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase;">
              <th align="left" style="padding: 10px 6px; font-weight: 800;">ITEM DESCRIPTION</th>
              <th align="center" style="padding: 10px 6px; font-weight: 800;">SCALE WEIGHT</th>
              <th align="center" style="padding: 10px 6px; font-weight: 800;">BILLABLE WEIGHT</th>
              <th align="right" style="padding: 10px 6px; font-weight: 800;">UNIT RATE</th>
              <th align="right" style="padding: 10px 6px; font-weight: 800;">AMOUNT (THB)</th>
            </tr>
          </thead>
          <tbody>
            ${hasMultiItems ? order.items.map(it => {
              const itIsPiece = it.pricingType === 'piece' || it.unit === 'piece';
              const itUnit = it.unit || (itIsPiece ? 'pc' : 'KG');
              const itQty = itIsPiece ? (it.quantity || 1) : (it.actualWeightKg || it.estimatedWeightKg || it.quantity || 4);
              const itBillable = it.billableAmount || itQty;
              const itRate = it.rate || it.pricePerKg || 70;
              const itSub = it.subtotal || Math.round(itBillable * itRate);
              return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td align="left" style="padding: 14px 6px; vertical-align: top;">
                    <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${it.name || it.serviceName}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                      Turnaround: <strong style="color: #0284c7;">${speedLabel}</strong>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                      ${itIsPiece ? 'Specialized linen / garment sanitization & packaging' : 'Certified facility wash, tumble dry & packaging'}
                    </div>
                  </td>
                  <td align="center" style="padding: 14px 6px; vertical-align: top; font-weight: 700; color: #0f172a;">
                    ${itQty} ${itUnit}
                  </td>
                  <td align="center" style="padding: 14px 6px; vertical-align: top; font-weight: 800; color: #0f172a;">
                    ${itBillable} ${itUnit}
                  </td>
                  <td align="right" style="padding: 14px 6px; vertical-align: top; color: #475569;">
                    ฿${itRate} / ${itUnit}
                  </td>
                  <td align="right" style="padding: 14px 6px; vertical-align: top; font-weight: 800; color: #0f172a;">
                    ฿${Number(itSub).toLocaleString()}
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td align="left" style="padding: 14px 6px; vertical-align: top;">
                  <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${serviceName}</div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                    Turnaround: <strong style="color: #0284c7;">${speedLabel}</strong>
                  </div>
                  <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                    Certified facility wash, tumble dry & packaging
                  </div>
                </td>
                <td align="center" style="padding: 14px 6px; vertical-align: top; font-weight: 700; color: #0f172a;">
                  ${scaleWeight} ${unitLabel}
                </td>
                <td align="center" style="padding: 14px 6px; vertical-align: top; font-weight: 800; color: #0f172a;">
                  ${billableWeight} ${unitLabel}
                  ${!isPiece && billableWeight > scaleWeight ? `<div style="font-size: 9px; color: #b45309; font-weight: normal;">(Min ${minWeight} KG applied)</div>` : ''}
                </td>
                <td align="right" style="padding: 14px 6px; vertical-align: top; color: #475569;">
                  ฿${unitRate} / ${unitLabel}
                </td>
                <td align="right" style="padding: 14px 6px; vertical-align: top; font-weight: 800; color: #0f172a;">
                  ฿${serviceSubtotal.toLocaleString()}
                </td>
              </tr>
            `}

            <!-- Fixed Pickup & Delivery row -->
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td colspan="4" align="left" style="padding: 14px 6px; vertical-align: top;">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a;">
                  🚚 Fixed Pickup & Delivery (${deliveryZoneText})
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                  Flat-rate two-way courier to condominium lobby / juristic reception
                </div>
              </td>
              <td align="right" style="padding: 14px 6px; vertical-align: top; font-weight: 800; color: #0f172a;">
                ${deliveryFee > 0 ? `฿${deliveryFee}` : '<span style="color: #059669; font-weight: 800;">FREE</span>'}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- TOTALS BREAKDOWN -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td width="55%"></td>
            <td width="45%" align="right">
              <table width="100%" cellpadding="3" cellspacing="0" border="0" style="font-size: 13px;">
                <tr>
                  <td align="left" style="color: #64748b; padding: 4px 0;">Subtotal (Excl. VAT):</td>
                  <td align="right" style="color: #64748b; font-family: monospace; font-weight: 600; padding: 4px 0;">฿${subtotalExclTax.toLocaleString()} THB</td>
                </tr>
                <tr>
                  <td align="left" style="color: #64748b; padding: 4px 0;">VAT 7% (Included):</td>
                  <td align="right" style="color: #64748b; font-family: monospace; font-weight: 600; padding: 4px 0;">฿${vatAmount.toLocaleString()} THB</td>
                </tr>
                <tr>
                  <td align="left" style="font-size: 16px; font-weight: 900; color: #0f172a; padding: 12px 0 0 0; border-top: 2px solid #e2e8f0;">
                    Total Amount Due:
                  </td>
                  <td align="right" style="font-size: 22px; font-weight: 900; color: #059669; padding: 12px 0 0 0; border-top: 2px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ฿${totalPrice.toLocaleString()} THB
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CASHLESS PAYMENT GATEWAY ACTION BOX -->
        <div style="background-color: #f8fafc; border: 2px solid #bbf7d0; border-radius: 16px; padding: 22px 20px; text-align: center; margin-bottom: 22px;">
          <div style="font-size: 14px; font-weight: 800; color: #166534; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
            💳 100% Cashless Payment Gateway
          </div>
          <p style="font-size: 13px; color: #334155; margin: 0 0 16px 0; line-height: 1.5;">
            Please tap the button below to complete your payment securely via <strong>PromptPay QR</strong> or <strong>Credit/Debit Card</strong>:
          </p>
          <a href="${paymentUrl}" target="_blank" style="display: block; max-width: 380px; margin: 0 auto; background-color: #059669; color: #ffffff; text-align: center; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 16px; font-weight: 800; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);">
            💳 Pay ฿${totalPrice.toLocaleString()} THB Online
          </a>
          <div style="font-size: 11px; color: #64748b; margin-top: 12px; word-break: break-all;">
            Direct Payment Link: <a href="${paymentUrl}" style="color: #0284c7; text-decoration: underline; font-weight: 600;">${paymentUrl}</a>
          </div>
          <div style="margin-top: 12px; font-size: 11px; color: #166534; font-weight: 600;">
            ✓ Instant PromptPay QR scan with all Thai banking apps • Visa, Mastercard, JCB accepted with 3D-Secure OTP
          </div>
        </div>

        <!-- Customer Support Notice -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; font-size: 12px; color: #64748b; text-align: center; line-height: 1.6; margin-bottom: 20px;">
          <strong>Questions regarding your weighing or invoice?</strong><br />
          💬 WhatsApp: <strong style="color: #0f172a;">@nonamelaundry</strong> &nbsp;|&nbsp; 💬 LINE OA: <strong style="color: #0f172a;">@nonamelaundry</strong> &nbsp;|&nbsp; 📞 Phone: <strong style="color: #0f172a;">+66 80 888 9885</strong>
        </div>

        <!-- FOOTER -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
            NoName Laundry Bangkok Co., Ltd. • 100% Cashless Digital Garment Care by KG<br />
            Official Tax Invoice & Cashless Payment Request for Order #${trackingId}
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  const targetEmail = (overrideRecipient || customerEmail || '').trim();
  if (!targetEmail || !targetEmail.includes('@') || targetEmail.includes('@customer.local')) {
    return {
      sent: false,
      error: 'Recipient email is missing or invalid. Please check customer email address before sending invoice.'
    };
  }

  const mailOptions = {
    from: `"NoName Laundry Bangkok" <${process.env.SMTP_USER || SMTP_USER}>`,
    to: targetEmail,
    bcc: NOTIFICATION_EMAIL,
    subject: `🧾 Tax Invoice & Payment Due - Order #${trackingId} (฿${totalPrice.toLocaleString()} THB)`,
    html: htmlContent,
    attachments: [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'companylogo'
      }
    ]
  };

  try {
    const info = await mailer.sendMail(mailOptions);
    console.log(`[MAILER] Confirmed billing email sent for ${trackingId} to [${targetEmail}] (BCC: ${NOTIFICATION_EMAIL}). MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId, recipients: [targetEmail, NOTIFICATION_EMAIL] };
  } catch (error) {
    console.error(`[MAILER] Failed to send confirmed billing email for ${trackingId}:`, error);
    return { sent: false, error: error.message };
  }
}

module.exports = {
  sendBookingConfirmationEmail,
  sendConfirmedBillingEmail,
  sendBookingNotificationEmail: sendBookingConfirmationEmail,
  verifySmtpConnection,
  resetTransporter
};
