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
 * Sends a notification email to the business email whenever a new booking is created.
 * @param {Object} order - Full order details
 */
async function sendBookingNotificationEmail(order) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('[MAILER] SMTP_PASS not configured. Skipping email dispatch for order:', order.id);
    return { sent: false, reason: 'SMTP_PASS_NOT_CONFIGURED' };
  }

  const trackingId = order.id || order.trackingNumber || 'NNL-NEW';
  const customerName = order.customerName || order.customer_name || 'Customer';
  const contactChannel = (order.contactChannel || order.contact_channel || 'Online').toUpperCase();
  const contactValue = order.contactValue || order.contact_value || 'N/A';
  const customerEmail = order.email || 'None provided';
  const serviceName = order.serviceName || order.service_name || 'Wash / Fold';
  const weightOrQty = order.actualWeightKg || order.actual_weight_kg || order.estimatedWeightKg || order.estimated_weight_kg || order.quantity || '-';
  const unit = order.unit || 'KG';
  const pickupDate = order.pickupDate || order.pickup_date || 'Today';
  const pickupTime = order.pickupTime || order.pickup_time || 'Standard';
  const deliveryDate = order.deliveryDate || order.delivery_date || 'Standard';
  const condo = order.condoName || order.condo_name || '';
  const room = order.roomNumber || order.room_number || '';
  const district = order.district || '';
  const juristic = order.leaveWithJuristic || order.leave_with_juristic ? 'YES (Leave at Lobby / Juristic Office)' : 'NO (Meet in Person)';
  const totalPrice = Number(order.totalPrice || order.total_price || 0);
  const deliveryFee = Number(order.deliveryFee || order.delivery_fee || 0);
  const instructions = order.specialInstructions || order.special_instructions || 'None';
  const speed = order.turnaroundSpeed || order.turnaround_speed || 'standard';

  const addressLine = [room && `Room ${room}`, condo, district, 'Bangkok'].filter(Boolean).join(', ');

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">🧺 New Laundry Booking Received!</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Order Reference: <strong>${trackingId}</strong></p>
      </div>

      <!-- Main Body -->
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
          <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0284c7; letter-spacing: 0.5px;">Turnaround Speed</span>
          <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 2px;">
            ${speed.toUpperCase().replace(/_/g, ' ')}
          </div>
        </div>

        <!-- Customer Section -->
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0;">👤 Customer Information</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Name:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Contact:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${contactChannel}: ${contactValue}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Customer Email:</td>
            <td style="padding: 6px 0; color: #0f172a;">${customerEmail}</td>
          </tr>
        </table>

        <!-- Pickup & Delivery Section -->
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">📍 Pickup & Delivery Details</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Pickup Schedule:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0284c7;">${pickupDate} (${pickupTime})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Delivery Target:</td>
            <td style="padding: 6px 0; color: #0f172a;">${deliveryDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Address:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${addressLine || 'Bangkok'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Juristic Dropoff:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${juristic}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Special Notes:</td>
            <td style="padding: 6px 0; color: #e11d48; font-style: italic;">${instructions}</td>
          </tr>
        </table>

        <!-- Order Summary Section -->
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">🧺 Order Summary</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Service:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Est. Weight/Qty:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${weightOrQty} ${unit}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Delivery Fee:</td>
            <td style="padding: 6px 0; color: #0f172a;">฿${deliveryFee.toLocaleString()} THB</td>
          </tr>
          <tr style="border-top: 1px dashed #cbd5e1;">
            <td style="padding: 10px 0; font-weight: 700; font-size: 16px; color: #0f172a;">Estimated Total:</td>
            <td style="padding: 10px 0; font-weight: 700; font-size: 18px; color: #059669;">฿${totalPrice.toLocaleString()} THB</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            This automated alert was dispatched directly from the NoName Laundry online booking system.
          </p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"NoName Laundry System" <${SMTP_USER}>`,
    to: NOTIFICATION_EMAIL,
    subject: `🚨 [New Booking] ${trackingId} - ${customerName} (${pickupDate} ${pickupTime})`,
    html: htmlContent
  };

  try {
    const info = await mailer.sendMail(mailOptions);
    console.log(`[MAILER] Booking notification sent for ${trackingId}. MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[MAILER] Failed to send email for ${trackingId}:`, error);
    return { sent: false, error: error.message };
  }
}

module.exports = {
  sendBookingNotificationEmail
};
