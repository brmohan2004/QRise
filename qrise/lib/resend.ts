import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@qrise.io';

/**
 * Corporate email template wrapper
 */
function wrapInCorporateTemplate(title: string, content: string): string {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #1a1a1a; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 40px;">
        <img src="https://qrise.io/logo.png" alt="QRise Logo" style="height: 40px;" />
      </div>
      
      <h1 style="font-size: 24px; font-weight: 800; color: #000; margin-bottom: 24px; text-align: center;">${title}</h1>
      
      ${content}
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-top: 40px; margin-bottom: 32px;" />
      
      <p style="font-size: 12px; color: #6b7280; text-align: center;">
        © 2026 QRise Inc. All rights reserved.<br />
        Premium Dynamic QR Code Solutions
      </p>
    </div>
  `;
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(
  to: string,
  otp: string,
  expiresMin: number
): Promise<void> {
  try {
    const content = `
      <p style="font-size: 16px; margin-bottom: 24px;">Hello,</p>
      <p style="font-size: 16px; margin-bottom: 24px;">Your verification code for QRise is:</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; font-size: 32px; text-align: center; letter-spacing: 8px; font-weight: 800; color: #0f6e56; margin-bottom: 24px;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #64748b; text-align: center;">This code expires in ${expiresMin} minutes.</p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your QRise verification code',
      html: wrapInCorporateTemplate('Verify your email', content),
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
    const content = `
      <p style="font-size: 16px; margin-bottom: 24px;">Welcome to QRise, ${name}!</p>
      <p style="font-size: 16px; margin-bottom: 32px;">
        We're excited to have you on board. QRise helps you create, manage, and track dynamic QR codes with ease.
      </p>
      <div style="text-align: center;">
        <a href="https://qrise.io/dashboard" style="display: inline-block; background-color: #0f6e56; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
          GET STARTED
        </a>
      </div>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to QRise!',
      html: wrapInCorporateTemplate('Welcome aboard!', content),
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
    const content = `
      <p style="font-size: 16px; margin-bottom: 24px;">Your bulk QR generation job is complete!</p>
      <p style="font-size: 16px; margin-bottom: 32px;">
        All your QR codes have been generated and are ready for download.
      </p>
      <div style="text-align: center;">
        <a href="${downloadUrl}" style="display: inline-block; background-color: #0f6e56; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
          DOWNLOAD QR CODES
        </a>
      </div>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your QR codes are ready',
      html: wrapInCorporateTemplate('Generation Complete', content),
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
    const content = `
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 16px;">Security Alert</p>
        <p style="margin-top: 8px; font-size: 14px; color: #b91c1c;">
          There have been ${attemptCount} failed password attempts on your QR code <strong>"${qrName}"</strong> from IP: ${ip}.
        </p>
      </div>
      <p style="font-size: 14px; color: #64748b;">
        If this wasn't you, we recommend reviewing your QR code settings or changing the password for added security.
      </p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Alert: Multiple password attempts on your QR code',
      html: wrapInCorporateTemplate('Security Alert', content),
    });
  } catch (error) {
    console.error('Failed to send brute force alert:', error);
  }
}

/**
 * Send account deletion confirmation email (User Requested)
 */
export async function sendAccountDeletionEmail(to: string, name: string): Promise<void> {
  try {
    const content = `
      <p style="font-size: 16px; margin-bottom: 24px;">Hello ${name},</p>
      <p style="font-size: 16px; margin-bottom: 24px;">
        We are writing to confirm that your QRise workspace has been successfully <strong>destroyed</strong> per your request.
      </p>
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 14px;">
          Your data is now scheduled for permanent deletion. You will no longer be able to access your dashboard or any associated QR codes.
        </p>
      </div>
      <p style="font-size: 14px; color: #64748b; margin-bottom: 32px;">
        If this was a mistake, please contact our support team immediately, though we cannot guarantee data recovery once the deletion process has begun.
      </p>
      <div style="text-align: center;">
        <a href="mailto:support@qrise.io" style="display: inline-block; background-color: #0f6e56; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
          CONTACT SUPPORT
        </a>
      </div>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Confirmation: Your QRise Workspace has been destroyed',
      html: wrapInCorporateTemplate('Workspace Destroyed', content),
    });
  } catch (error) {
    console.error('Failed to send account deletion email:', error);
  }
}

/**
 * Send account suspended email (Administrative)
 */
export async function sendAccountSuspendedEmail(to: string, name: string, reason?: string): Promise<void> {
  try {
    const content = `
      <p style="font-size: 16px; margin-bottom: 24px;">Hello ${name},</p>
      <p style="font-size: 16px; margin-bottom: 24px;">
        We are writing to inform you that your QRise account has been suspended by our administration.
      </p>
      ${reason ? `
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 14px;">Reason for suspension:</p>
        <p style="margin-top: 8px; font-size: 14px; color: #b91c1c;">${reason}</p>
      </div>
      ` : ''}
      <p style="font-size: 14px; color: #64748b; margin-bottom: 32px;">
        While suspended, your access to the dashboard and your active QR codes may be restricted. If you believe this is an error, please contact our administration.
      </p>
      <div style="text-align: center;">
        <a href="mailto:support@qrise.io" style="display: inline-block; background-color: #0f6e56; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
          CONTACT ADMINISTRATION
        </a>
      </div>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Important: Your QRise account has been suspended',
      html: wrapInCorporateTemplate('Account Suspended', content),
    });
  } catch (error) {
    console.error('Failed to send account suspension email:', error);
  }
}

/**
 * Send export ready email
 */
export async function sendExportEmail(
  to: string,
  type: string,
  downloadUrl: string
): Promise<void> {
  try {
    const content = `
      <p style="font-size: 16px; margin-bottom: 24px;">Your data export is ready!</p>
      <p style="font-size: 16px; margin-bottom: 32px;">
        The ${type === 'qr-codes' ? 'QR Code Archive' : 'Form Submission Ledger'} you requested has been generated.
      </p>
      <div style="text-align: center;">
        <a href="${downloadUrl}" style="display: inline-block; background-color: #0f6e56; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
          DOWNLOAD EXPORT
        </a>
      </div>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your QRise export is ready: ${type === 'qr-codes' ? 'QR Codes' : 'Forms'}`,
      html: wrapInCorporateTemplate('Export Ready', content),
    });
  } catch (error) {
    console.error('Failed to send export email:', error);
  }
}

/**
 * Send usage alert email
 */
export async function sendUsageAlertEmail(opts: {
  to: string;
  pct: number;
  consumed: number;
  limit: number;
  unit: string;
  resetAt: string;
}): Promise<void> {
  try {
    const { to, pct, consumed, limit, unit, resetAt } = opts;
    const resetDate = new Date(resetAt).toLocaleDateString();
    
    const content = `
      <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="margin: 0; color: #92400e; font-weight: 700; font-size: 18px;">Usage Alert: ${pct}% Reached</p>
        <p style="margin-top: 8px; font-size: 16px; color: #b45309;">
          You have consumed <strong>${consumed.toLocaleString()}</strong> / ${limit.toLocaleString()} ${unit}.
        </p>
      </div>
      <p style="font-size: 16px; margin-bottom: 24px;">
        Your monthly quota will reset on <strong>${resetDate}</strong>.
      </p>
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="https://qrise.app/billing" style="display: inline-block; background-color: #0f6e56; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
          UPGRADE PLAN
        </a>
      </div>
      <p style="font-size: 14px; color: #6b7280; text-align: center;">
        You can manage your alert channels in your dashboard settings.
      </p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `⚠️ QRise Usage Alert: ${pct}% Reached`,
      html: wrapInCorporateTemplate('Usage Threshold Reached', content),
    });
  } catch (error) {
    console.error('Failed to send usage alert email:', error);
  }
}

