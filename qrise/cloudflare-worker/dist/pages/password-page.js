export function buildPasswordPage(options) {
    const { qrId, shortCode, label, appUrl } = options;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${label ? `${label} - Password Required` : 'Password Required'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    h1 {
      font-size: 24px;
      margin-bottom: 12px;
      color: #333;
    }
    .subtitle {
      color: #666;
      margin-bottom: 24px;
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 16px;
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.1s;
    }
    button:active {
      transform: scale(0.98);
    }
    .error {
      color: #e53e3e;
      font-size: 14px;
      margin-top: 12px;
      display: none;
    }
    .error.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${label ? `Access ${label}` : 'Access Required'}</h1>
    <p class="subtitle">Please enter the password to continue</p>
    <form id="password-form">
      <input type="password" id="password" placeholder="Enter password" autocomplete="current-password" required>
      <button type="submit">Unlock</button>
      <p class="error" id="error-message">Incorrect password. Please try again.</p>
    </form>
  </div>

  <script>
    const form = document.getElementById('password-form');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-message');
    const qrId = '${qrId}';
    const shortCode = '${shortCode}';
    const appUrl = '${appUrl}';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.classList.remove('show');

      const password = passwordInput.value;
      if (!password) return;

      try {
        const response = await fetch(\`\${appUrl}/api/verify-password?shortCode=\${shortCode}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, qrId })
        });

        const data = await response.json();

        if (data.valid) {
          window.location.href = data.redirectUrl || '/';
        } else {
          errorMsg.classList.add('show');
          passwordInput.value = '';
          passwordInput.focus();
        }
      } catch (err) {
        errorMsg.textContent = 'Network error. Please try again.';
        errorMsg.classList.add('show');
      }
    });

    passwordInput.focus();
  </script>
</body>
</html>`;
}
//# sourceMappingURL=password-page.js.map