export function buildNotFoundPage(options) {
    const { shortCode, appUrl } = options;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Code Not Found</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }
    .error-code {
      font-size: 72px;
      font-weight: 700;
      color: #667eea;
      line-height: 1;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 12px;
      color: #333;
    }
    p {
      color: #666;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    a {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.1s;
    }
    a:active {
      transform: scale(0.98);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-code">404</div>
    <h1>QR Code Not Found</h1>
    <p>
      ${shortCode
        ? `The QR code "<strong>${shortCode}</strong>" does not exist or has been removed.`
        : 'The QR code you are looking for could not be found.'}
    </p>
    <a href="${appUrl}">Go to Homepage</a>
  </div>
</body>
</html>`;
}
//# sourceMappingURL=not-found.js.map