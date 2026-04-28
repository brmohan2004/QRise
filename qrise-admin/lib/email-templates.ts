export const getNotificationEmailTemplate = ({
  subject,
  content,
  type = 'email',
  appUrl = 'https://qrise.app'
}: {
  subject: string;
  content: string;
  type?: 'email' | 'push';
  appUrl?: string;
}) => {
  if (type === 'push') {
    // Push-style template: Minimalist, centered, mobile-first look
    return `
      <div style="background-color: #f9f9f9; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #f0f0f0;">
          <div style="padding: 20px; border-bottom: 1px solid #f5f5f5; display: flex; align-items: center; gap: 10px;">
            <img src="${appUrl}/favicon.ico" width="24" height="24" style="border-radius: 6px;" />
            <span style="font-size: 13px; font-weight: 800; color: #111; text-transform: uppercase; letter-spacing: 0.5px;">QRise Notification</span>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #000; letter-spacing: -0.5px;">${subject}</h2>
            <p style="margin: 0; font-size: 15px; color: #555; line-height: 1.5; font-weight: 400;">${content}</p>
            <div style="margin-top: 32px;">
              <a href="${appUrl}/dashboard" style="display: block; background: #000; color: #fff; text-decoration: none; padding: 14px; border-radius: 14px; font-weight: 700; font-size: 14px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">View in Dashboard</a>
            </div>
          </div>
        </div>
        <p style="text-align: center; font-size: 11px; color: #bbb; margin-top: 32px; font-weight: 500;">
          This is an automated notification. To manage alerts, visit <a href="${appUrl}/settings" style="color: #666; text-decoration: underline;">Settings</a>.
        </p>
      </div>
    `;
  }

  // Standard Rich HTML Email (Broadcast style)
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; background: #fff;">
      <div style="padding: 40px 0;">
        <img src="${appUrl}/logo.png" alt="QRise" style="height: 32px; margin-bottom: 30px;" />
        <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 24px; letter-spacing: -1px; line-height: 1.2;">${subject}</h1>
        <div style="font-size: 16px; line-height: 1.7; color: #333;">
          ${content}
        </div>
        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999; margin-bottom: 8px;">
            Sent by <strong>QRise Team</strong>
          </p>
          <p style="font-size: 11px; color: #aaa; margin: 0;">
            You received this update because you are a registered user of QRise. 
            <br />
            <a href="${appUrl}/settings" style="color: #000; text-decoration: underline;">Account Settings</a> &bull; <a href="${appUrl}/unsubscribe" style="color: #000; text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </div>
  `;
};
