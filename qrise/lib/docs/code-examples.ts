export const CREATE_QR_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/qr', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Summer sale campaign', type: 'url', target_url: 'https://yourstore.com/summer-sale', is_dynamic: true }) })
const qr = await response.json()
console.log(qr.redirect_url)`,

  python: `import requests
response = requests.post('https://api.qrise.io/qr',
    headers={'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json'},
    json={'name': 'Summer sale campaign', 'type': 'url', 'target_url': 'https://yourstore.com/summer-sale', 'is_dynamic': True})
qr = response.json()
print(qr['redirect_url'])`,

  curl: `curl -X POST https://api.qrise.io/qr -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"name": "Summer sale campaign", "type": "url", "target_url": "https://yourstore.com/summer-sale", "is_dynamic": true}'`,
}

export const LIST_QR_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/qr?type=url&status=active&limit=20', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })
const data = await response.json()
console.log(data.items, data.total)`,

  python: `import requests
response = requests.get('https://api.qrise.io/qr',
    params={'type': 'url', 'status': 'active', 'limit': 20}, headers={'Authorization': 'Bearer YOUR_API_KEY'})
data = response.json()
print(data['items'])`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" "https://api.qrise.io/qr?type=url&status=active&limit=20"`,
}

export const GET_QR_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}\`, { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })
const qr = await response.json()`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.get(f'https://api.qrise.io/qr/{qr_id}', headers={'Authorization': 'Bearer YOUR_API_KEY'})
qr = response.json()`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890`,
}

export const UPDATE_QR_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}\`, {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ target_url: 'https://yourstore.com/autumn-sale', is_active: true }) })
const updated = await response.json()`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.put(f'https://api.qrise.io/qr/{qr_id}',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'target_url': 'https://yourstore.com/autumn-sale', 'is_active': True})`,

  curl: `curl -X PUT https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890 -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"target_url": "https://yourstore.com/autumn-sale", "is_active": true}'`,
}

export const DELETE_QR_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}\`, { method: 'DELETE', headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
requests.delete(f'https://api.qrise.io/qr/{qr_id}', headers={'Authorization': 'Bearer YOUR_API_KEY'})`,

  curl: `curl -X DELETE https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890 -H "Authorization: Bearer YOUR_API_KEY"`,
}

export const EXPORT_QR_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}/export?format=png&size=400\`,
  { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })
const blob = await response.blob()
const url = URL.createObjectURL(blob)
document.createElement('a').then(a => { a.href = url; a.download = 'qr-code.png'; a.click() })`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.get(f'https://api.qrise.io/qr/{qr_id}/export',
    params={'format': 'png', 'size': 400}, headers={'Authorization': 'Bearer YOUR_API_KEY'})
with open('qr-code.png', 'wb') as f: f.write(response.content)`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" "https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890/export?format=png&size=400" -o qr-code.png`,
}

export const QR_HISTORY_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}/history\`, { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })
const history = await response.json()`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.get(f'https://api.qrise.io/qr/{qr_id}/history', headers={'Authorization': 'Bearer YOUR_API_KEY'})
history = response.json()`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890/history`,
}

export const SMART_ROUTING_GET_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}/routing-rules\`, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})
const data = await response.json()`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.get(f'https://api.qrise.io/qr/{qr_id}/routing-rules',
    headers={'Authorization': 'Bearer YOUR_API_KEY'})
data = response.json()`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890/routing-rules`,
}

export const SMART_ROUTING_UPDATE_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}/routing-rules\`, {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ rules: [
    { priority: 0, label: 'Mobile', conditions: [{ field: 'device', op: 'eq', value: 'mobile' }], target_url: 'https://m.yoursite.com' },
    { priority: 1, label: 'Desktop', conditions: [{ field: 'device', op: 'eq', value: 'desktop' }], target_url: 'https://yoursite.com' }],
    default_url: 'https://yoursite.com' }) })`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.put(f'https://api.qrise.io/qr/{qr_id}/routing-rules',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'rules': [{'priority': 0, 'label': 'Mobile', 'conditions': [{'field': 'device', 'op': 'eq', 'value': 'mobile'}], 'target_url': 'https://m.yoursite.com'},
    {'priority': 1, 'label': 'Desktop', 'conditions': [{'field': 'device', 'op': 'eq', 'value': 'desktop'}], 'target_url': 'https://yoursite.com'}],
    'default_url': 'https://yoursite.com'})`,

  curl: `curl -X PUT https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890/routing-rules -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"rules": [{"priority": 0, "label": "Mobile", "conditions": [{"field": "device", "op": "eq", "value": "mobile"}], "target_url": "https://m.yoursite.com"}, {"priority": 1, "label": "Desktop", "conditions": [{"field": "device", "op": "eq", "value": "desktop"}], "target_url": "https://yoursite.com"}], "default_url": "https://yoursite.com"}'`,
}

export const ANALYTICS_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}/analytics?range=30d&group_by=day\`,
  { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })
const data = await response.json()`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.get(f'https://api.qrise.io/qr/{qr_id}/analytics',
    params={'range': '30d', 'group_by': 'day'}, headers={'Authorization': 'Bearer YOUR_API_KEY'})
data = response.json()`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" "https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890/analytics?range=30d&group_by=day"`,
}

export const BULK_CREATE_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/bulk', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ rows: [
    { name: 'Product A', target_url: 'https://yourstore.com/products/a', is_dynamic: true },
    { name: 'Product B', target_url: 'https://yourstore.com/products/b', is_dynamic: true }] }) })
const job = await response.json()`,

  python: `import requests
response = requests.post('https://api.qrise.io/bulk',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'rows': [{'name': 'Product A', 'target_url': 'https://yourstore.com/products/a', 'is_dynamic': True},
    {'name': 'Product B', 'target_url': 'https://yourstore.com/products/b', 'is_dynamic': True}]})
job = response.json()`,

  curl: `curl -X POST https://api.qrise.io/bulk -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"rows": [{"name": "Product A", "target_url": "https://yourstore.com/products/a", "is_dynamic": true}, {"name": "Product B", "target_url": "https://yourstore.com/products/b", "is_dynamic": true}]}'`,
}

export const BULK_STATUS_EXAMPLES = {
  js: `const jobId = 'g7h8i9j0-k1l2-3456-mnop-qrstuvwxyz12'
async function pollUntilDone(jobId) {
  while (true) {
    const response = await fetch(\`https://api.qrise.io/bulk/\${jobId}\`, {
      headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })
    const job = await response.json()
    if (job.status === 'done') return job.zip_url
    if (job.status === 'failed') throw new Error(job.error)
    await new Promise(r => setTimeout(r, 3000)) } }`,

  python: `import time, requests
job_id = 'g7h8i9j0-k1l2-3456-mnop-qrstuvwxyz12'
def poll_until_done(job_id):
  while True:
    response = requests.get(f'https://api.qrise.io/bulk/{job_id}',
        headers={'Authorization': 'Bearer YOUR_API_KEY'})
    job = response.json()
    if job['status'] == 'done': return job['zip_url']
    if job['status'] == 'failed': raise Exception(job['error'])
    time.sleep(3)`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/bulk/g7h8i9j0-k1l2-3456-mnop-qrstuvwxyz12`,
}

export const WEBHOOK_CREATE_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/webhooks', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ endpoint_url: 'https://yourapp.com/api/qrise-webhook',
    events: ['scan.received', 'qr.updated'], secret: 'your-webhook-secret-here' }) })`,

  python: `import requests
response = requests.post('https://api.qrise.io/webhooks',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'endpoint_url': 'https://yourapp.com/api/qrise-webhook',
    'events': ['scan.received', 'qr.updated'], 'secret': 'your-webhook-secret-here'})`,

  curl: `curl -X POST https://api.qrise.io/webhooks -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"endpoint_url": "https://yourapp.com/api/qrise-webhook", "events": ["scan.received", "qr.updated"], "secret": "your-webhook-secret-here"}'`,
}

export const WEBHOOK_VERIFICATION_EXAMPLES = {
  js: `// Verify QRise webhook signature (Next.js App Router)
import crypto from 'crypto'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('X-QRise-Signature')
  const expected = crypto
    .createHmac('sha256', process.env.QRISE_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  if (signature !== 'sha256=' + expected) {
    return new Response('Unauthorized', { status: 401 })
  }

  const event = JSON.parse(body)
  if (event.event === 'scan.received') {
    console.log('QR ' + event.qr_id + ' scanned from ' + event.country)
  }

  return new Response('OK')
}`,

  python: `import hmac, hashlib
from flask import Flask, request, abort

app = Flask(__name__)
WEBHOOK_SECRET = os.environ.get('QRISE_WEBHOOK_SECRET', '')

@app.route('/qrise-webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-QRise-Signature', '')
    body = request.get_data()
    expected = 'sha256=' + hmac.new(
        WEBHOOK_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        abort(401)

    event = request.get_json(silent=True) or {}
    if event.get('event') == 'scan.received':
        print(f"QR {event['qr_id']} scanned from {event['country']}")

    return '', 200`,
}

export const QUICKSTART_EXAMPLES = {
  js: `const res = await fetch('https://api.qrise.io/qr', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'My first QR', type: 'url', target_url: 'https://example.com' }) })
const { redirect_url } = await res.json() // redirect_url is now scannable: https://r.qrise.io/abc12345`,
}