const path = require('path');
const nodemailer = require('nodemailer');

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'nonamelaundrybooking@gmail.com';
const SMTP_USER = process.env.SMTP_USER || 'nonamelaundrybooking@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS;

let transporter = null;

function getTransporter() {
  if (!SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS.replace(/\s+/g, '') // remove spaces from app password
      }
    });
  }
  return transporter;
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

  let recipientsList = [];
  if (overrideRecipient) {
    recipientsList = Array.isArray(overrideRecipient) ? overrideRecipient : [overrideRecipient];
  } else {
    recipientsList = [NOTIFICATION_EMAIL];
    if (customerEmail && customerEmail.includes('@') && !customerEmail.includes('@customer.local')) {
      recipientsList.push(customerEmail);
    }
  }

  const mailOptions = {
    from: `"NoName Laundry" <${SMTP_USER}>`,
    to: recipientsList.join(', '),
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
    console.log(`[MAILER] Booking confirmation email sent for ${trackingId} to [${recipientsList.join(', ')}]. MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId, recipients: recipientsList };
  } catch (error) {
    console.error(`[MAILER] Failed to send booking confirmation for ${trackingId}:`, error);
    return { sent: false, error: error.message };
  }
}

/**
 * 2. SECOND EMAIL: Confirmed Billing & Cashless Payment Link
 * Dispatched by the Admin after all needed weighing and intake is complete.
 * Contains verified scale weights, itemized total, and direct payment gateway link.
 */
async function sendConfirmedBillingEmail(order, overrideRecipient = null) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('[MAILER] SMTP_PASS not configured. Skipping confirmed billing email for order:', order?.id);
    return { sent: false, reason: 'SMTP_PASS_NOT_CONFIGURED' };
  }

  const trackingId = order.id || order.trackingNumber || 'NNL-NEW';
  const customerName = order.customerName || order.customer_name || 'Customer';
  const customerEmail = order.email || '';
  const serviceName = order.serviceName || order.service_name || 'Wash / Fold';
  const actualWeight = order.actualWeightKg !== null && order.actualWeightKg !== undefined ? order.actualWeightKg : (order.estimatedWeightKg || 4.0);
  const minWeight = order.minWeightAppliedKg || 4.0;
  const billableKg = Math.max(actualWeight, minWeight);
  const rate = Number(order.pricePerKg || 70);
  const deliveryFee = Number(order.deliveryFee || 0);
  const totalPrice = Number(order.totalPrice || Math.round(billableKg * rate) + deliveryFee);
  const isPaid = order.paymentStatus === 'PAID';

  const baseUrl = process.env.BASE_URL || 'https://apptest.thatlaundryshop.com';
  const paymentUrl = `${baseUrl}/?track=${encodeURIComponent(trackingId)}&pay=1`;
  const logoPath = path.join(__dirname, '../images/logo.png');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmed Billing & Payment Link - Order #${trackingId}</title>
    </head>
    <body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
        
        <!-- Header with Official Company Logo -->
        <div style="background-color: #ffffff; padding: 28px 24px 20px 24px; text-align: center; border-bottom: 2px solid #f1f5f9;">
          <img src="cid:companylogo" alt="NoName Laundry" style="height: 52px; width: auto; max-width: 220px; object-fit: contain; margin: 0 auto 10px auto; display: block;" />
          <div style="display: inline-block; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 9999px; padding: 4px 14px; margin-top: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #92400e; letter-spacing: 0.5px; text-transform: uppercase;">
              ⚖️ Verified Scale Weight • Payment Request
            </span>
          </div>
        </div>

        <!-- Greeting & Billing Confirmation -->
        <div style="padding: 26px 28px; line-height: 1.6;">
          <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
            Hi ${customerName},
          </h2>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.5;">
            Your laundry bag has arrived at our facility and all needed weighing and intake inspection has been completed.
          </p>

          <!-- Confirmed Billing Summary Card -->
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 22px;">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px; margin-bottom: 12px;">
              🧺 Verified Order & Weighing Summary
            </div>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              ${Array.isArray(order.items) && order.items.length > 0 ? `
                <tr style="background-color: #f1f5f9; font-weight: 700; font-size: 11px; color: #475569; text-transform: uppercase;">
                  <td style="padding: 8px 10px; border-radius: 6px 0 0 6px;">Item / Service</td>
                  <td style="padding: 8px 10px; text-align: center;">Verified Weight/Qty</td>
                  <td style="padding: 8px 10px; text-align: right; border-radius: 0 6px 6px 0;">Subtotal</td>
                </tr>
                ${order.items.map(it => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 10px; color: #0f172a; font-weight: 600;">
                      ${it.name || it.serviceName || 'Service'}
                      <div style="font-size: 11px; color: #64748b; font-weight: normal;">
                        ฿${it.rate || it.pricePerKg || 70}/${it.unit || 'KG'}
                      </div>
                    </td>
                    <td style="padding: 10px 10px; text-align: center; color: #475569; font-weight: 700;">
                      ${it.pricingType === 'piece' ? `${it.quantity || 1} pcs` : `${it.actualWeightKg || it.billableAmount || it.quantity || actualWeight} KG`}
                    </td>
                    <td style="padding: 10px 10px; text-align: right; font-weight: 700; color: #0f172a;">
                      ฿${Number(it.subtotal || 0).toLocaleString()} THB
                    </td>
                  </tr>
                `).join('')}
              ` : `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${serviceName} (฿${rate}/KG)</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #0f172a;">
                    ${actualWeight} KG ${actualWeight < minWeight ? `(Min. ${minWeight} KG applied)` : ''}
                  </td>
                </tr>
              `}
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Delivery Fee:</td>
                <td style="padding: 8px 0; text-align: right; color: #0f172a; font-weight: 600;" colspan="${Array.isArray(order.items) && order.items.length > 0 ? '2' : '1'}">
                  ${deliveryFee > 0 ? `฿${deliveryFee.toLocaleString()} THB` : '<span style="color: #15803d; font-weight: 700;">FREE (฿0)</span>'}
                </td>
              </tr>
              <tr style="border-top: 2px dashed #cbd5e1;">
                <td style="padding: 12px 0 0 0; font-weight: 800; font-size: 15px; color: #0f172a;">Confirmed Total Due:</td>
                <td style="padding: 12px 0 0 0; font-weight: 900; font-size: 20px; color: #0284c7; text-align: right;" colspan="${Array.isArray(order.items) && order.items.length > 0 ? '2' : '1'}">
                  ฿${totalPrice.toLocaleString()} THB
                </td>
              </tr>
            </table>
          </div>

          <!-- Cashless Payment Gateway Box -->
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border-radius: 14px; padding: 24px 20px; text-align: center; color: #ffffff; margin-bottom: 22px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);">
            <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
              💳 100% Cashless Payment Gateway
            </div>
            <p style="font-size: 13px; color: #e0f2fe; margin: 0 0 18px 0; line-height: 1.5;">
              Please tap below to complete your payment securely via PromptPay QR Code or Credit/Debit Card:
            </p>
            <a href="${paymentUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #0284c7; text-decoration: none; padding: 13px 32px; border-radius: 10px; font-weight: 800; font-size: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.15);">
              👉 Pay ฿${totalPrice.toLocaleString()} THB Online
            </a>
            <div style="font-size: 11px; color: #bae6fd; margin-top: 12px; word-break: break-all;">
              Direct Gateway Link: <a href="${paymentUrl}" style="color: #ffffff; text-decoration: underline;">${paymentUrl}</a>
            </div>
          </div>

          <!-- Customer Support Notice -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; font-size: 12px; color: #475569; text-align: center; line-height: 1.6;">
            <strong>Questions regarding your weighing or order?</strong><br />
            💬 WhatsApp: <strong style="color: #0f172a;">@nonamelaundry</strong> &nbsp;|&nbsp; 💬 LINE: <strong style="color: #0f172a;">@nonamelaundry</strong> &nbsp;|&nbsp; 📞 Phone: <strong style="color: #0f172a;">+66 80 888 9885</strong>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
            NoName Laundry Bangkok Co., Ltd. • 100% Cashless Digital Laundry by KG<br />
            Confirmed Billing Invoice for Order #${trackingId}
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  let recipientsList = [];
  if (overrideRecipient) {
    recipientsList = Array.isArray(overrideRecipient) ? overrideRecipient : [overrideRecipient];
  } else {
    recipientsList = [NOTIFICATION_EMAIL];
    if (customerEmail && customerEmail.includes('@') && !customerEmail.includes('@customer.local')) {
      recipientsList.push(customerEmail);
    }
  }

  const mailOptions = {
    from: `"NoName Laundry" <${SMTP_USER}>`,
    to: recipientsList.join(', '),
    subject: `💳 Confirmed Billing & Payment Link - Order #${trackingId} (฿${totalPrice} THB)`,
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
    console.log(`[MAILER] Confirmed billing email sent for ${trackingId} to [${recipientsList.join(', ')}]. MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId, recipients: recipientsList };
  } catch (error) {
    console.error(`[MAILER] Failed to send confirmed billing email for ${trackingId}:`, error);
    return { sent: false, error: error.message };
  }
}

module.exports = {
  sendBookingConfirmationEmail,
  sendConfirmedBillingEmail,
  sendBookingNotificationEmail: sendBookingConfirmationEmail
};
