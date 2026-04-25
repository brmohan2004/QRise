export interface ErrorPageOptions {
  statusCode?: number;
  message: string;
  shortCode?: string;
  appUrl: string;
}

export function buildErrorPage(options: ErrorPageOptions): string {
  const { statusCode = 500, message, shortCode, appUrl } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusCode} - Error</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
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
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .error-code {
      font-size: 72px;
      font-weight: 700;
      color: #ff6b6b;
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
    .details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      color: #666;
      margin-bottom: 24px;
      word-break: break-all;
    }
    a {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
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
    <div class="error-code">${statusCode}</div>
    <h1>Something Went Wrong</h1>
    <p>${message}</p>
    ${shortCode ? `<div class="details">QR Code: ${shortCode}</div>` : ''}
    <a href="${appUrl}">Go to Homepage</a>
  </div>
</body>
</html>`;
}
