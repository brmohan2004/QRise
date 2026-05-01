export const SMART_ROUTING_GET_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}/routing-rules\`, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})
const data = await response.json()
console.log('Rules:', data.rules)`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.get(f'https://api.qrise.io/qr/{qr_id}/routing-rules',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})
data = response.json()
for rule in data['rules']:
  print(f"Priority {rule['priority']}: {rule['label']}")`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890/routing-rules`,
}

export const SMART_ROUTING_UPDATE_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}/routing-rules\`, {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rules: [
      { priority: 0, label: 'Mobile', conditions: [{ field: 'device', op: 'eq', value: 'mobile' }], target_url: 'https://m.yoursite.com' },
      { priority: 1, label: 'Desktop', conditions: [{ field: 'device', op: 'eq', value: 'desktop' }], target_url: 'https://yoursite.com' }
    ],
    default_url: 'https://yoursite.com'
  })
})
const result = await response.json()
console.log('Updated', result.rules_count, 'rules')`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.put(f'https://api.qrise.io/qr/{qr_id}/routing-rules',
  headers={'Authorization': 'Bearer YOUR_API_KEY'},
  json={
    'rules': [
      {'priority': 0, 'label': 'Mobile', 'conditions': [{'field': 'device', 'op': 'eq', 'value': 'mobile'}], 'target_url': 'https://m.yoursite.com'},
      {'priority': 1, 'label': 'Desktop', 'conditions': [{'field': 'device', 'op': 'eq', 'value': 'desktop'}], 'target_url': 'https://yoursite.com'}
    ],
    'default_url': 'https://yoursite.com'
  })
result = response.json()
print(f"Rules count: {result['rules_count']}")`,

  curl: `curl -X PUT https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890/routing-rules \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"rules":[{"priority":0,"label":"Mobile","conditions":[{"field":"device","op":"eq","value":"mobile"}],"target_url":"https://m.yoursite.com"},{"priority":1,"label":"Desktop","conditions":[{"field":"device","op":"eq","value":"desktop"}],"target_url":"https://yoursite.com"}],"default_url":"https://yoursite.com"}'`,
}

export const BULK_CREATE_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/bulk', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rows: [
      { name: 'Product A', target_url: 'https://yourstore.com/products/a', is_dynamic: true },
      { name: 'Product B', target_url: 'https://yourstore.com/products/b', is_dynamic: true },
      { name: 'Product C', target_url: 'https://yourstore.com/products/c' }
    ]
  })
})
const job = await response.json()
console.log('Job ID:', job.job_id)
console.log('Status:', job.status)`,

  python: `import requests
response = requests.post('https://api.qrise.io/bulk',
  headers={'Authorization': 'Bearer YOUR_API_KEY'},
  json={
    'rows': [
      {'name': 'Product A', 'target_url': 'https://yourstore.com/products/a', 'is_dynamic': True},
      {'name': 'Product B', 'target_url': 'https://yourstore.com/products/b', 'is_dynamic': True},
      {'name': 'Product C', 'target_url': 'https://yourstore.com/products/c'}
    ]
  })
job = response.json()
print(f"Job {job['job_id']} status: {job['status']}")`,

  curl: `curl -X POST https://api.qrise.io/bulk \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"rows":[{"name":"Product A","target_url":"https://yourstore.com/products/a","is_dynamic":true},{"name":"Product B","target_url":"https://yourstore.com/products/b","is_dynamic":true},{"name":"Product C","target_url":"https://yourstore.com/products/c"}]}'`,
}

export const BULK_STATUS_EXAMPLES = {
  js: `const jobId = 'g7h8i9j0-k1l2-3456-mnop-qrstuvwxyz12'
async function pollUntilDone(jobId) {
  while (true) {
    const response = await fetch(\`https://api.qrise.io/bulk/\${jobId}\`, {
      headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
    })
    const job = await response.json()
    if (job.status === 'done') return job.zip_url
    if (job.status === 'failed') throw new Error(job.error)
    await new Promise(r => setTimeout(r, 3000))
  }
}`,

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

export const FORM_CREATE_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/forms', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Customer Feedback',
    fields: [
      { label: 'Full Name', type: 'text', required: true },
      { label: 'Email', type: 'email', required: true },
      { label: 'Feedback', type: 'textarea', required: false }
    ],
    success_message: 'Thanks for your feedback!'
  })
})
const form = await response.json()
console.log('Form ID:', form.id)`,

  python: `import requests
response = requests.post('https://api.qrise.io/forms',
  headers={'Authorization': 'Bearer YOUR_API_KEY'},
  json={
    'name': 'Customer Feedback',
    'fields': [
      {'label': 'Full Name', 'type': 'text', 'required': True},
      {'label': 'Email', 'type': 'email', 'required': True},
      {'label': 'Feedback', 'type': 'textarea', 'required': False}
    ]
  })
form = response.json()
print(f"Form ID: {form['id']}")`,

  curl: `curl -X POST https://api.qrise.io/forms \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Customer Feedback","fields":[{"label":"Full Name","type":"text","required":true},{"label":"Email","type":"email","required":true}]}'`,
}

export const FORM_LIST_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/forms', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})
const forms = await response.json()
console.log('Forms:', forms.items.map(f => f.name))`,

  python: `import requests
response = requests.get('https://api.qrise.io/forms',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})
forms = response.json()
for f in forms['items']:
  print(f['name'])`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/forms`,
}

export const FORM_SUBMISSIONS_EXAMPLES = {
  js: `const formId = 'form_uuid_here'
const response = await fetch(\`https://api.qrise.io/forms/\${formId}/submissions\`, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})
const submissions = await response.json()
console.log('Total submissions:', submissions.total)`,

  python: `import requests
form_id = 'form_uuid_here'
response = requests.get(f'https://api.qrise.io/forms/{form_id}/submissions',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})
submissions = response.json()
print(f"Total: {submissions['total']}")`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/forms/form_uuid/submissions`,
}

export const CREATE_QR_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/qr', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Campaign 2025',
    type: 'url',
    target_url: 'https://example.com/promo',
    is_dynamic: true
  })
})
const data = await response.json()
console.log('Created QR:', data.id)`,

  python: `import requests
response = requests.post('https://api.qrise.io/qr',
  headers={'Authorization': 'Bearer YOUR_API_KEY'},
  json={
    'name': 'Campaign 2025',
    'type': 'url',
    'target_url': 'https://example.com/promo',
    'is_dynamic': True
  })
print(f"Created QR: {response.json()['id']}")`,

  curl: `curl -X POST https://api.qrise.io/qr \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Campaign 2025","type":"url","target_url":"https://example.com/promo"}'`,
}

export const LIST_QR_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/qr?limit=10', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})
const data = await response.json()
console.log('QR Codes:', data.items)`,

  python: `import requests
response = requests.get('https://api.qrise.io/qr?limit=10',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})
for qr in response.json()['items']:
    print(f"{qr['name']}: {qr['short_url']}")`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/qr?limit=10`,
}

export const GET_QR_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}\`, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})
const qr = await response.json()`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.get(f'https://api.qrise.io/qr/{qr_id}',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})
print(response.json())`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890`,
}

export const UPDATE_QR_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
await fetch(\`https://api.qrise.io/qr/\${qrId}\`, {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ target_url: 'https://new-destination.com' })
})`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
requests.patch(f'https://api.qrise.io/qr/{qr_id}',
  headers={'Authorization': 'Bearer YOUR_API_KEY'},
  json={'target_url': 'https://new-destination.com'})`,

  curl: `curl -X PATCH https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"target_url":"https://new-destination.com"}'`,
}

export const DELETE_QR_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
await fetch(\`https://api.qrise.io/qr/\${qrId}\`, {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
requests.delete(f'https://api.qrise.io/qr/{qr_id}',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})`,

  curl: `curl -X DELETE -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890`,
}

export const EXPORT_QR_EXAMPLES = {
  js: `// Directly download to file
const response = await fetch('https://api.qrise.io/qr/export', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})
const blob = await response.blob()`,
  python: `import requests
response = requests.get('https://api.qrise.io/qr/export',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})
with open('qrs.csv', 'wb') as f:
    f.write(response.content)`,
  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/qr/export > qrs.csv`,
}

export const QR_HISTORY_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}/history\`, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})
const history = await response.json()`,
  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.get(f'https://api.qrise.io/qr/{qr_id}/history',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890/history`,
}

export const ANALYTICS_EXAMPLES = {
  js: `const qrId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}/analytics?range=30d\`, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})
const stats = await response.json()
console.log('Total scans:', stats.total_scans)`,

  python: `import requests
qr_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.get(f'https://api.qrise.io/qr/{qr_id}/analytics',
  params={'range': '30d'},
  headers={'Authorization': 'Bearer YOUR_API_KEY'})
print(f"Total scans: {response.json()['total_scans']}")`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" "https://api.qrise.io/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890/analytics?range=30d"`,
}

export const WEBHOOK_CREATE_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/webhooks', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    endpoint_url: 'https://your-server.com/webhooks',
    events: ['qr.scanned', 'qr.created'],
    description: 'Main server hook'
  })
})`,
  python: `import requests
response = requests.post('https://api.qrise.io/webhooks',
  headers={'Authorization': 'Bearer YOUR_API_KEY'},
  json={
    'endpoint_url': 'https://your-server.com/webhooks',
    'events': ['qr.scanned', 'qr.created']
  })`,
  curl: `curl -X POST https://api.qrise.io/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"endpoint_url":"https://your-server.com/webhooks","events":["qr.scanned"]}'`,
}

export const WEBHOOK_VERIFICATION_EXAMPLES = {
  js: `const crypto = require('crypto');
const signature = headers['x-qrise-signature'];
const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
const digest = hmac.update(JSON.stringify(body)).digest('hex');
const isValid = signature === digest;`,
  python: `import hmac, hashlib, json
signature = headers.get('X-QRise-Signature')
digest = hmac.new(WEBHOOK_SECRET.encode(), json.dumps(body).encode(), hashlib.sha256).hexdigest()
is_valid = hmac.compare_digest(signature, digest)`,
  curl: `# Verification is performed on your server logic`,
}

export const QUICKSTART_EXAMPLES = {
  js: `// 1. Create a dynamic QR
const qr = await client.POST('/qr', { body: { name: 'My QR', type: 'url', target_url: '...' } })
// 2. Download the image
const image = await fetch(\`https://api.qrise.io/qr/\${qr.id}/image?size=1024\`)`,
  python: `import requests
# 1. Create
qr = requests.post('...', json={...}).json()
# 2. Download
img = requests.get(f"https://api.qrise.io/qr/{qr['id']}/image")`,
  curl: `curl -X POST ... # See Create QR examples`,
}

export const ME_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/me', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})
const data = await response.json()
console.log('User:', data.user.email)`,
  python: `import requests
response = requests.get('https://api.qrise.io/me',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})
print(response.json()['user']['email'])`,
  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/me`,
}

export const USAGE_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/usage', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})`,
  python: `import requests
response = requests.get('https://api.qrise.io/usage',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/usage`,
}

export const USAGE_HISTORY_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/usage/history', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})`,
  python: `import requests
response = requests.get('https://api.qrise.io/usage/history',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/usage/history`,
}

export const USAGE_EXPORT_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/usage/export?month=2025-06', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})`,
  python: `import requests
response = requests.get('https://api.qrise.io/usage/export?month=2025-06',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" "https://api.qrise.io/usage/export?month=2025-06"`,
}

export const USAGE_ALERTS_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/usage/alerts', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})`,
  python: `import requests
response = requests.get('https://api.qrise.io/usage/alerts',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/usage/alerts`,
}

export const GET_QR_IMAGE_EXAMPLES = {
  js: `const qrId = '...'
const url = \`https://api.qrise.io/qr/\${qrId}/image?format=png&size=512\`
// You can use this URL directly in an <img> tag`,
  python: `import requests
url = 'https://api.qrise.io/qr/ID/image?format=png'
response = requests.get(url, headers={'Authorization': 'Bearer KEY'})`,
  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" "https://api.qrise.io/qr/ID/image?format=png" > qr.png`,
}

export const GET_QR_EMBED_EXAMPLES = {
  js: `const qrId = '...'
const response = await fetch(\`https://api.qrise.io/qr/\${qrId}/embed\`, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})`,
  python: `import requests
response = requests.get('https://api.qrise.io/qr/ID/embed',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/qr/ID/embed`,
}

export const RESPONSE_FORMAT_EXAMPLES = {
  js: `// Success Response
{
  "id": "...",
  "created_at": "..."
}

// Error Response
{
  "error": {
    "code": "not_found",
    "message": "Resource not found"
  }
}`,
  python: `# Success
{'id': '...', 'created_at': '...'}

# Error
{'error': {'code': 'not_found', 'message': '...'}}`,
  curl: `# All JSON responses follow this standard structure`,
}

export const WEBHOOK_TEST_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/webhooks/ID/test', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})`,
  python: `import requests
response = requests.post('https://api.qrise.io/webhooks/ID/test',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
  curl: `curl -X POST -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/webhooks/ID/test`,
}

export const WEBHOOK_ROTATE_SECRET_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/webhooks/ID/rotate-secret', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})`,
  python: `import requests
response = requests.post('https://api.qrise.io/webhooks/ID/rotate-secret',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
  curl: `curl -X POST -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/webhooks/ID/rotate-secret`,
}

export const WEBHOOK_DELIVERIES_LIST_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/webhooks/ID/deliveries', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})`,
  python: `import requests
response = requests.get('https://api.qrise.io/webhooks/ID/deliveries',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/webhooks/ID/deliveries`,
}

export const WEBHOOK_DELIVERY_REPLAY_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/webhooks/ID/deliveries/DELIVERY_ID/replay', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
})`,
  python: `import requests
response = requests.post('https://api.qrise.io/webhooks/ID/deliveries/DELIVERY_ID/replay',
  headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
  curl: `curl -X POST -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/webhooks/ID/deliveries/DELIVERY_ID/replay`,
}
