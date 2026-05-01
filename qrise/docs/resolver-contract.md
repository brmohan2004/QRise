# Resolver Response Contract

This document defines the protocol for custom QR type resolvers in QRise.

## Request Format

When a QR code of a custom type is scanned, QRise sends a `POST` request to the configured `resolver_url`.

### Headers

- `Content-Type: application/json`
- `X-QRise-Signature: t={timestamp},v1={hmac}`
- `X-QRise-Type: {type_slug}`
- `X-QRise-QR-Id: {qr_id}`
- `User-Agent: QRise-Resolver/1.0`

### Body

The body is a JSON object containing the scan context:

```typescript
interface ResolverRequest {
  scan_context: {
    device_type: 'mobile' | 'tablet' | 'desktop'
    os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'other'
    country: string     // ISO 3166-1 alpha-2, e.g. 'US', 'GB'
    language: string    // BCP 47, e.g. 'en-US'
    timestamp: string   // ISO 8601
    qr_payload: {       // The fields as defined in the custom type's fields_schema
      [key: string]: any
    }
  }
}
```

## Signature Verification

The `X-QRise-Signature` header contains a timestamp (`t`) and an HMAC-SHA256 signature (`v1`).
The signature is calculated by hashing the string `{timestamp}.{json_body}` using the `resolver_secret`.

### Example (Node.js)

```javascript
const crypto = require('crypto');

function verifySignature(payload, signatureHeader, secret) {
  const parts = signatureHeader.split(',');
  const timestamp = parts.find(p => p.startsWith('t=')).split('=')[1];
  const signature = parts.find(p => p.startsWith('v1=')).split('=')[1];

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Response Format

The resolver must return a JSON response with one of the following structures:

### 1. Redirect
Redirects the user to a specific URL.

```json
{
  "type": "redirect",
  "url": "https://example.com/target"
}
```

### 2. HTML
Serves a custom HTML page directly.

```json
{
  "type": "html",
  "html": "<h1>Welcome</h1><p>This is custom content.</p>"
}
```

### 3. JSON (Templated)
Returns data to be rendered using a registered Mustache template in QRise.

```json
{
  "type": "json",
  "data": {
    "name": "John Doe",
    "status": "Checked In"
  },
  "template": "my-template-slug"
}
```

## Example Logic (Healthcare)

```javascript
// Hospital example decision logic:
if (scan_context.os === 'ios' && isNurseApp(request.headers['User-Agent'])) {
  return { 
    type: 'redirect', 
    url: `https://hms.hospital.com/patient/${qr_payload.patient_id}` 
  }
} else {
  return { 
    type: 'html', 
    html: '<h1>Visiting Hours: 9 AM – 8 PM</h1>' 
  }
}
```
