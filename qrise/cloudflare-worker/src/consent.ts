export interface ConsentPreferences {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

export interface ConsentState {
  hasConsent: boolean;
  preferences: ConsentPreferences;
  timestamp: number;
}

export const STORAGE_KEY = 'qrise_consent';

export const DEFAULT_PREFERENCES: ConsentPreferences = {
  analytics: false,
  functional: true,
  marketing: false,
};

export function getConsentFromCookie(cookieHeader: string | null): ConsentState | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/qrise_consent=([^;]+)/);
  if (!match) return null;

  try {
    const decoded = decodeURIComponent(match[1]);
    const parsed = JSON.parse(decoded);
    return {
      hasConsent: parsed.analytics || parsed.functional,
      preferences: parsed,
      timestamp: parsed.timestamp || 0,
    };
  } catch {
    return null;
  }
}

export function setConsentCookie(preferences: ConsentPreferences): string {
  const state: ConsentState = {
    hasConsent: preferences.analytics || preferences.functional,
    preferences,
    timestamp: Date.now(),
  };

  const value = encodeURIComponent(JSON.stringify(state));
  const oneYear = 365 * 24 * 60 * 60;

  return `qrise_consent=${value}; Path=/; Max-Age=${oneYear}; HttpOnly; Secure; SameSite=Strict`;
}

export function buildConsentBanner(appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cookie Consent</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .consent-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #fff;
      padding: 20px;
      box-shadow: 0 -2px 20px rgba(0,0,0,0.1);
      z-index: 10000;
    }
    .consent-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
    .consent-text {
      flex: 1;
      min-width: 200px;
      font-size: 14px;
      color: #333;
    }
    .consent-text a {
      color: #667eea;
      text-decoration: none;
    }
    .consent-buttons {
      display: flex;
      gap: 12px;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-secondary {
      background: #e1e5e9;
      color: #333;
    }
    .consent-settings {
      display: none;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e1e5e9;
    }
    .consent-settings.show {
      display: block;
    }
    .setting-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .setting-item label {
      flex: 1;
      font-size: 14px;
      color: #333;
    }
    .toggle {
      position: relative;
      width: 48px;
      height: 24px;
      background: #ccc;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .toggle input { display: none; }
    .toggle-slider {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s;
    }
    .toggle input:checked + .toggle-slider {
      transform: translateX(24px);
    }
    .toggle input:checked ~ .toggle {
      background: #667eea;
    }
  </style>
</head>
<body>
  <div class="consent-banner" id="consent-banner">
    <div class="consent-content">
      <div class="consent-text">
        We use cookies to improve your experience. By continuing to visit this site you agree to our use of cookies.
        <a href="${appUrl}/privacy">Learn more</a>
      </div>
      <div class="consent-buttons">
        <button class="btn btn-secondary" id="customize-btn">Customize</button>
        <button class="btn btn-primary" id="accept-btn">Accept All</button>
      </div>
    </div>
    <div class="consent-settings" id="consent-settings">
      <div class="setting-item">
        <label>Functional (required)</label>
        <label class="toggle" style="background: #667eea;">
          <input type="checkbox" checked disabled>
          <div class="toggle-slider"></div>
        </label>
      </div>
      <div class="setting-item">
        <label>Analytics</label>
        <label class="toggle">
          <input type="checkbox" id="analytics-toggle">
          <div class="toggle-slider"></div>
        </label>
      </div>
      <div class="setting-item">
        <label>Marketing</label>
        <label class="toggle">
          <input type="checkbox" id="marketing-toggle">
          <div class="toggle-slider"></div>
        </label>
      </div>
      <div class="consent-buttons">
        <button class="btn btn-primary" id="save-consent-btn">Save Preferences</button>
      </div>
    </div>
  </div>

  <script>
    const banner = document.getElementById('consent-banner');
    const customizeBtn = document.getElementById('customize-btn');
    const acceptBtn = document.getElementById('accept-btn');
    const settingsPanel = document.getElementById('consent-settings');
    const saveBtn = document.getElementById('save-consent-btn');
    const analyticsToggle = document.getElementById('analytics-toggle');
    const marketingToggle = document.getElementById('marketing-toggle');

    customizeBtn.addEventListener('click', () => {
      settingsPanel.classList.toggle('show');
    });

    acceptBtn.addEventListener('click', () => {
      savePreferences({
        analytics: true,
        functional: true,
        marketing: true
      });
    });

    saveBtn.addEventListener('click', () => {
      savePreferences({
        analytics: analyticsToggle.checked,
        functional: true,
        marketing: marketingToggle.checked
      });
    });

    function savePreferences(preferences) {
      fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences })
      }).then(() => {
        banner.remove();
      });
    }
  </script>
</body>
</html>`;
}

export function getConsentHtml(appUrl: string): string {
  return buildConsentBanner(appUrl);
}
