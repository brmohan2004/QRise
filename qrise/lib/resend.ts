import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';

/**
 * Send OTP email
 */
export async function sendOTPEmail(
  to: string,
  otp: string,
  expiresMin: number
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your QRise verification code',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h1>Verify your email</h1>
          <p>Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 16px; font-size: 24px; text-align: center; letter-spacing: 4px;">
            ${otp}
          </div>
          <p>This code expires in ${expiresMin} minutes.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to QRise!',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h1>Welcome to QRise, ${name}!</h1>
          <p>Thank you for signing up. Start creating QR codes now.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

/**
 * Send bulk job ready email
 */
export async function sendBulkJobReadyEmail(
  to: string,
  jobId: string,
  downloadUrl: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your QR codes are ready',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h1>Your QR codes are ready!</h1>
          <p>Your bulk generation job is complete.</p>
          <a href="${downloadUrl}" style="background: #0f6e56; color: white; padding: 12px 24px; text-decoration: none;">
            Download QR Codes
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send bulk job email:', error);
  }
}

/**
 * Send password brute force alert
 */
export async function sendPasswordBruteForceAlert(
  to: string,
  qrName: string,
  attemptCount: number,
  ip: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Alert: Multiple password attempts on your QR code',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h1>Security Alert</h1>
          <p>There have been ${attemptCount} failed password attempts on "${qrName}" from IP: ${ip}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send brute force alert:', error);
  }
}
