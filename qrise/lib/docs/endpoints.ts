import { EndpointSpec } from './types'

export const CREATE_QR: EndpointSpec = {
  id: 'create-qr',
  method: 'POST',
  path: '/qr',
  title: 'Create a QR code',
  description: 'Creates a new QR code. For Dynamic QRs the short redirect code is generated automatically. For password-protected QRs supply the raw password — it will be hashed server-side.',
  requiredScope: 'qr:write',
  bodyParams: [
    { name: 'name', type: 'string', required: true, description: 'Display name for this QR code. Max 200 chars.', example: '"Product launch poster"' },
    { name: 'type', type: 'enum', required: true, description: 'QR code type.', enumValues: ['url','smart_routing','password','multi_action','bulk'], example: '"url"' },
    { name: 'target_url', type: 'string', required: false, description: 'The destination URL. Required for url, smart_routing, and password types. Must begin with https:// or http://.', example: '"https://yourstore.com/sale"' },
    { name: 'is_dynamic', type: 'boolean', required: false, description: 'When true, the QR encodes a short redirect that can be updated without reprinting. Default: true.', defaultValue: 'true' },
    { name: 'password', type: 'string', required: false, description: 'Required when type is password. Raw string — hashed server-side. Never stored in plaintext.' },
    { name: 'design', type: 'object', required: false, description: 'Design configuration. See Design object below.' },
    { name: 'design.dot_color', type: 'string', required: false, description: 'Hex color for QR dots. Default: #000000.' },
    { name: 'design.background_color', type: 'string', required: false, description: 'Hex color for QR background. Default: #ffffff.' },
    { name: 'design.error_correction', type: 'enum', required: false, description: 'Error correction level. Higher levels allow larger logos but reduce data density.', enumValues: ['L','M','Q','H'], defaultValue: 'M' },
  ],
  responseSchema: [
    { name: 'id', type: 'uuid', description: 'Unique QR code identifier.' },
    { name: 'name', type: 'string', description: 'Display name.' },
    { name: 'type', type: 'string', description: 'QR code type.' },
    { name: 'short_code', type: 'string', description: '8-character URL-safe redirect code. Null for static QRs.' },
    { name: 'redirect_url', type: 'string', description: 'Full scannable URL encoded in the QR (e.g. https://r.qrise.io/abc12345). Null for static QRs.' },
    { name: 'target_url', type: 'string', description: 'Current destination URL.' },
    { name: 'is_dynamic', type: 'boolean', description: 'Whether this QR uses a redirect.' },
    { name: 'is_active', type: 'boolean', description: 'Whether this QR is currently scannable.' },
    { name: 'scan_count', type: 'number', description: 'Total scan count since creation.' },
    { name: 'design', type: 'object', description: 'Design configuration object.' },
    { name: 'created_at', type: 'string', description: 'ISO 8601 creation timestamp.' },
    { name: 'updated_at', type: 'string', description: 'ISO 8601 last update timestamp.' },
  ],
  exampleRequest: {
    name: 'Summer sale campaign',
    type: 'url',
    target_url: 'https://yourstore.com/summer-sale',
    is_dynamic: true,
    design: { dot_color: '#1D9E75', background_color: '#ffffff', error_correction: 'M' }
  },
  exampleResponse: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Summer sale campaign',
    type: 'url',
    short_code: 'xK9mPqR2',
    redirect_url: 'https://r.qrise.io/xK9mPqR2',
    target_url: 'https://yourstore.com/summer-sale',
    is_dynamic: true,
    is_active: true,
    scan_count: 0,
    design: { dot_color: '#1D9E75', background_color: '#ffffff', error_correction: 'M' },
    created_at: '2025-06-01T10:30:00Z',
    updated_at: '2025-06-01T10:30:00Z',
  },
  errorCodes: ['400', '401', '403', '422', '429'],
  notes: [
    'Plan limits apply: Free accounts can create up to 5 QR codes. Pro allows unlimited.',
    'Password QRs require the password field and are always dynamic.',
  ],
}

export const LIST_QR: EndpointSpec = {
  id: 'list-qr',
  method: 'GET',
  path: '/qr',
  title: 'List QR codes',
  requiredScope: 'qr:read',
  description: 'Returns a paginated list of your QR codes, newest first.',
  queryParams: [
    { name: 'page', type: 'number', required: false, description: 'Page number (1-based).', defaultValue: '1' },
    { name: 'limit', type: 'number', required: false, description: 'Results per page. Max 100.', defaultValue: '20' },
    { name: 'type', type: 'enum', required: false, description: 'Filter by QR type.', enumValues: ['url','smart_routing','password','multi_action','bulk'] },
    { name: 'status', type: 'enum', required: false, description: 'Filter by status.', enumValues: ['active','inactive','all'], defaultValue: 'active' },
    { name: 'search', type: 'string', required: false, description: 'Search QR name or target URL (case-insensitive, partial match).' },
    { name: 'sort', type: 'enum', required: false, description: 'Sort order.', enumValues: ['newest','oldest','most_scanned','name'], defaultValue: 'newest' },
  ],
  responseSchema: [
    { name: 'items', type: 'array', description: 'Array of QR code objects (same schema as Create response).' },
    { name: 'total', type: 'number', description: 'Total number of QR codes matching the filter.' },
    { name: 'page', type: 'number', description: 'Current page number.' },
    { name: 'total_pages', type: 'number', description: 'Total number of pages.' },
    { name: 'has_next', type: 'boolean', description: 'Whether a next page exists.' },
  ],
  exampleRequest: { type: 'url', status: 'active', limit: 2 },
  exampleResponse: {
    items: [
      { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Summer sale campaign', type: 'url', short_code: 'xK9mPqR2', scan_count: 1247, is_active: true, created_at: '2025-06-01T10:30:00Z' },
      { id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', name: 'Office WiFi', type: 'password', short_code: 'nR4qLx7w', scan_count: 88, is_active: true, created_at: '2025-05-28T09:15:00Z' },
    ],
    total: 14,
    page: 1,
    total_pages: 7,
    has_next: true,
  },
  errorCodes: ['401', '403', '422'],
}

export const GET_QR: EndpointSpec = {
  id: 'get-qr',
  method: 'GET',
  path: '/qr/{id}',
  requiredScope: 'qr:read',
  title: 'Get a QR code',
  description: 'Returns a single QR code by its UUID.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of the QR code.' }],
  responseSchema: [
    { name: 'id', type: 'uuid', description: 'Unique QR code identifier.' },
    { name: 'name', type: 'string', description: 'Display name.' },
    { name: 'type', type: 'string', description: 'QR code type.' },
    { name: 'short_code', type: 'string', description: '8-character URL-safe redirect code.' },
    { name: 'redirect_url', type: 'string', description: 'Full scannable URL encoded in the QR.' },
    { name: 'target_url', type: 'string', description: 'Current destination URL.' },
    { name: 'is_dynamic', type: 'boolean', description: 'Whether this QR uses a redirect.' },
    { name: 'is_active', type: 'boolean', description: 'Whether this QR is currently scannable.' },
    { name: 'scan_count', type: 'number', description: 'Total scan count since creation.' },
    { name: 'created_at', type: 'string', description: 'ISO 8601 creation timestamp.' },
    { name: 'updated_at', type: 'string', description: 'ISO 8601 last update timestamp.' },
  ],
  exampleResponse: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Summer sale campaign',
    type: 'url',
    short_code: 'xK9mPqR2',
    redirect_url: 'https://r.qrise.io/xK9mPqR2',
    target_url: 'https://yourstore.com/summer-sale',
    is_dynamic: true,
    is_active: true,
    scan_count: 1247,
    created_at: '2025-06-01T10:30:00Z',
    updated_at: '2025-09-01T08:00:00Z',
  },
  errorCodes: ['401', '403', '404'],
}

export const UPDATE_QR: EndpointSpec = {
  id: 'update-qr',
  method: 'PUT',
  path: '/qr/{id}',
  requiredScope: 'qr:write',
  title: 'Update a QR code',
  description: 'Updates a QR code. For Dynamic QRs, changing target_url takes effect immediately — the redirect is live within 60 seconds (KV cache TTL). A redirect history entry is created automatically.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of the QR code.' }],
  bodyParams: [
    { name: 'name', type: 'string', required: false, description: 'New display name.' },
    { name: 'target_url', type: 'string', required: false, description: 'New destination URL. Dynamic QRs only.' },
    { name: 'is_active', type: 'boolean', required: false, description: 'Pause (false) or resume (true) the QR.' },
    { name: 'design', type: 'object', required: false, description: 'Update design settings.' },
  ],
  exampleRequest: { target_url: 'https://yourstore.com/autumn-sale', is_active: true },
  exampleResponse: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', target_url: 'https://yourstore.com/autumn-sale', updated_at: '2025-09-01T08:00:00Z' },
  errorCodes: ['400', '401', '403', '404', '422'],
  notes: ['Static QRs cannot have their target_url changed — the URL is encoded into the QR pixels. Create a new Dynamic QR instead.'],
  responseSchema: [
    { name: 'id', type: 'uuid', description: 'Updated QR code identifier.' },
    { name: 'target_url', type: 'string', description: 'New destination URL.' },
    { name: 'updated_at', type: 'string', description: 'ISO 8601 timestamp.' },
  ],
}

export const DELETE_QR: EndpointSpec = {
  id: 'delete-qr',
  method: 'DELETE',
  path: '/qr/{id}',
  requiredScope: 'qr:write',
  title: 'Delete a QR code',
  description: 'Permanently deactivates a QR code. Scans will return a 404 page. Scan analytics are preserved. This action cannot be undone.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of the QR code.' }],
  exampleResponse: { deleted: true, id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
  responseSchema: [
    { name: 'deleted', type: 'boolean', description: 'Whether the QR was deleted.' },
    { name: 'id', type: 'uuid', description: 'Deleted QR code identifier.' },
  ],
  errorCodes: ['401', '403', '404'],
}

export const EXPORT_QR: EndpointSpec = {
  id: 'export-qr',
  method: 'GET',
  path: '/qr/{id}/export',
  requiredScope: 'qr:read',
  title: 'Export QR image',
  description: 'Downloads the QR code as a PNG, SVG, or PDF. Images are generated fresh on each request using the current design settings.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of the QR code.' }],
  queryParams: [
    { name: 'format', type: 'enum', required: false, description: 'Output format.', enumValues: ['png','svg','pdf'], defaultValue: 'png' },
    { name: 'dpi', type: 'enum', required: false, description: 'DPI for PNG output. Has no effect for SVG or PDF.', enumValues: ['72','150','300'], defaultValue: '72' },
    { name: 'size', type: 'number', required: false, description: 'Output size in pixels (width=height). Min 100, max 2000.', defaultValue: '400' },
  ],
  exampleResponse: { _note: 'Binary file download. Content-Type: image/png. Content-Disposition: attachment; filename="qr-{name}.png"' },
  responseSchema: [
    { name: '_note', type: 'string', description: 'Binary file download. Content-Type: image/{format}.' },
  ],
  errorCodes: ['400', '401', '403', '404'],
}

export const QR_HISTORY: EndpointSpec = {
  id: 'qr-history',
  method: 'GET',
  path: '/qr/{id}/history',
  requiredScope: 'qr:read',
  title: 'Get redirect history',
  description: 'Returns the last 20 URL changes for a Dynamic QR, newest first. Useful for auditing or restoring a previous target URL.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of the QR code.' }],
  responseSchema: [
    { name: 'items', type: 'array', description: 'History entries.', children: [
      { name: 'id', type: 'uuid', description: 'History entry ID.' },
      { name: 'old_url', type: 'string', description: 'Previous destination URL.' },
      { name: 'new_url', type: 'string', description: 'New destination URL.' },
      { name: 'changed_at', type: 'string', description: 'ISO 8601 timestamp of the change.' },
    ]},
  ],
  exampleResponse: {
    items: [
      { id: 'c3d4e5f6-a7b8-9012-cdef-123456789012', old_url: 'https://yourstore.com/summer-sale', new_url: 'https://yourstore.com/autumn-sale', changed_at: '2025-09-01T08:00:00Z' },
    ]
  },
  errorCodes: ['401', '403', '404'],
}

export const SMART_ROUTING_GET: EndpointSpec = {
  id: 'get-routing-rules',
  method: 'GET' as const,
  path: '/qr/{id}/routing-rules',
  title: 'Get routing rules',
  requiredScope: 'qr:read',
  description: 'Returns all routing rules for a Smart Routing QR, sorted by priority ascending (lowest number = evaluated first).',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of a smart_routing type QR.' }],
  responseSchema: [
    { name: 'rules', type: 'array', description: 'Ordered list of routing rules.', children: [
      { name: 'id', type: 'uuid', description: 'Rule ID.' },
      { name: 'priority', type: 'number', description: 'Evaluation order. 0 = first evaluated.' },
      { name: 'label', type: 'string', description: 'Optional human-readable label for this rule.' },
      { name: 'conditions', type: 'array', description: 'Array of conditions that must ALL match for this rule to trigger.', children: [
        { name: 'field', type: 'string', description: 'Attribute to check: device, os, country, language, or time_range.' },
        { name: 'op', type: 'string', description: 'Operator: eq (equals), in (one of array), between (numeric range for time_range).' },
        { name: 'value', type: 'string|array|array[2]', description: 'Value to compare. String for eq, array of strings for in, [startHour, endHour] for between.' },
      ]},
      { name: 'target_url', type: 'string', description: 'Redirect destination when this rule matches.' },
    ]},
    { name: 'default_url', type: 'string', description: 'Fallback URL when no rule matches.' },
  ],
  exampleResponse: {
    rules: [
      { id: 'd4e5f6a7-b8c9-0123-defa-234567890123', priority: 0, label: 'iOS users', conditions: [{ field: 'os', op: 'eq', value: 'iOS' }], target_url: 'https://apps.apple.com/yourapp' },
      { id: 'e5f6a7b8-c9d0-1234-efab-345678901234', priority: 1, label: 'Android users', conditions: [{ field: 'os', op: 'eq', value: 'Android' }], target_url: 'https://play.google.com/yourapp' },
      { id: 'f6a7b8c9-d0e1-2345-fabc-456789012345', priority: 2, label: 'Business hours EU', conditions: [{ field: 'country', op: 'in', value: ['DE','FR','GB'] }, { field: 'time_range', op: 'between', value: [9, 18] }], target_url: 'https://yoursite.com/eu-business' },
    ],
    default_url: 'https://yourstore.com',
  },
  errorCodes: ['401', '403', '404'],
}

export const SMART_ROUTING_UPDATE: EndpointSpec = {
  id: 'update-routing-rules',
  method: 'PUT' as const,
  path: '/qr/{id}/routing-rules',
  title: 'Replace routing rules',
  requiredScope: 'qr:write',
  description: 'Replaces ALL routing rules for a Smart Routing QR in one atomic operation. Send the complete desired rule set — omitted rules are deleted. Rules are evaluated in the order of the priority field (0 = first). Maximum 10 rules per QR.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of the smart_routing type QR.' }],
  bodyParams: [
    { name: 'rules', type: 'array', required: true, description: 'Complete set of rules to apply. Existing rules not in this array are deleted.' },
    { name: 'rules[].priority', type: 'number', required: true, description: 'Integer evaluation order. Must be unique within the rule set.' },
    { name: 'rules[].label', type: 'string', required: false, description: 'Human-readable rule label.' },
    { name: 'rules[].conditions', type: 'array', required: true, description: 'One or more conditions. All must match.' },
    { name: 'rules[].target_url', type: 'string', required: true, description: 'Destination when rule matches.' },
    { name: 'default_url', type: 'string', required: true, description: 'Fallback URL when no rules match.' },
  ],
  exampleRequest: {
    rules: [
      { priority: 0, label: 'Mobile', conditions: [{ field: 'device', op: 'eq', value: 'mobile' }], target_url: 'https://m.yoursite.com' },
      { priority: 1, label: 'German speakers', conditions: [{ field: 'language', op: 'in', value: ['de','de-AT','de-CH'] }], target_url: 'https://yoursite.de' },
    ],
    default_url: 'https://yoursite.com',
  },
  exampleResponse: { rules_count: 2, default_url: 'https://yoursite.com', updated_at: '2025-06-01T14:00:00Z' },
  errorCodes: ['400', '401', '403', '404', '422'],
  notes: ['Circular redirect detection: rules whose target_url matches the QRise redirect domain are rejected with 422.', 'Maximum 10 rules per QR. Exceeding this returns 422.'],
}

export const ANALYTICS: EndpointSpec = {
  id: 'get-analytics',
  method: 'GET' as const,
  path: '/qr/{id}/analytics',
  title: 'Get QR analytics',
  requiredScope: 'analytics:read',
  description: 'Returns scan analytics for a QR code. Bot scans are automatically excluded from all counts. Requires a plan with analytics enabled.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of the QR code.' }],
  queryParams: [
    { name: 'range', type: 'enum', required: false, description: 'Date range for analytics.', enumValues: ['7d','30d','90d'], defaultValue: '30d' },
    { name: 'group_by', type: 'enum', required: false, description: 'Breakdown dimension.', enumValues: ['day','country','device','os','hour'], defaultValue: 'day' },
  ],
  responseSchema: [
    { name: 'summary', type: 'object', description: 'Aggregate totals for the range.', children: [
      { name: 'total_scans', type: 'number', description: 'All non-bot scans.' },
      { name: 'unique_scans', type: 'number', description: 'Unique devices (24h dedup window).' },
      { name: 'bot_scans_excluded', type: 'number', description: 'Number of bot scans filtered out.' },
      { name: 'peak_day', type: 'string', description: 'Date with the most scans (ISO 8601 date).' },
      { name: 'peak_hour', type: 'number', description: 'Hour of day (0-23) with the most scans.' },
    ]},
    { name: 'breakdown', type: 'array', description: 'Grouped data based on group_by param.', children: [
      { name: 'key', type: 'string', description: 'Group key (date, country code, device type, etc.).' },
      { name: 'total', type: 'number', description: 'Total scans for this key.' },
      { name: 'unique', type: 'number', description: 'Unique scans for this key.' },
    ]},
  ],
  exampleResponse: {
    summary: { total_scans: 2841, unique_scans: 1204, bot_scans_excluded: 47, peak_day: '2025-05-15', peak_hour: 14 },
    breakdown: [
      { key: '2025-05-15', total: 312, unique: 187 },
      { key: '2025-05-16', total: 289, unique: 144 },
    ],
  },
  errorCodes: ['401', '403', '404', '422'],
  notes: ['Location data is country-level only for users who have not given consent (GDPR regions). City-level data may be null.'],
}

export const BULK_CREATE: EndpointSpec = {
  id: 'create-bulk-job',
  method: 'POST' as const,
  path: '/bulk',
  title: 'Create bulk job',
  requiredScope: 'bulk:write',
  description: 'Accepts an array of rows to generate QR codes in batch. Returns immediately with a job ID. Process is asynchronous — poll the job status endpoint until status is done.',
  bodyParams: [
    { name: 'rows', type: 'array', required: true, description: 'Array of QR code definitions. Max 1,000 rows on Pro, 10,000 on Business/Enterprise.' },
    { name: 'rows[].name', type: 'string', required: true, description: 'Display name for this QR.' },
    { name: 'rows[].target_url', type: 'string', required: true, description: 'Destination URL (must be http:// or https://).' },
    { name: 'rows[].is_dynamic', type: 'boolean', required: false, description: 'Enable dynamic redirect for this row. Default: false.', defaultValue: 'false' },
  ],
  exampleRequest: {
    rows: [
      { name: 'Product A', target_url: 'https://yourstore.com/products/a', is_dynamic: true },
      { name: 'Product B', target_url: 'https://yourstore.com/products/b', is_dynamic: true },
      { name: 'Product C', target_url: 'https://yourstore.com/products/c' },
    ],
  },
  exampleResponse: { job_id: 'g7h8i9j0-k1l2-3456-mnop-qrstuvwxyz12', status: 'queued', total_rows: 3, estimated_seconds: 15 },
  errorCodes: ['400', '401', '403', '422', '429'],
  notes: ['The bulk:write scope is required. This feature requires a Business or Enterprise plan.', 'Invalid rows (bad URL format, missing name) are rejected upfront — the whole job fails if any row is invalid.'],
}

export const BULK_STATUS: EndpointSpec = {
  id: 'bulk-job-status',
  method: 'GET' as const,
  path: '/bulk/{jobId}',
  title: 'Get bulk job status',
  requiredScope: 'bulk:write',
  description: 'Poll this endpoint to check job progress. Recommended polling interval: every 3 seconds. When status is done, a ZIP download URL is returned (valid for 24 hours).',
  pathParams: [{ name: 'jobId', type: 'uuid', required: true, description: 'Job ID returned by the Create bulk job endpoint.' }],
  responseSchema: [
    { name: 'job_id', type: 'uuid', description: 'Job identifier.' },
    { name: 'status', type: 'string', description: 'Current status: queued, processing, done, or failed.' },
    { name: 'total_rows', type: 'number', description: 'Total rows in the job.' },
    { name: 'processed_rows', type: 'number', description: 'Rows processed so far.' },
    { name: 'progress_percent', type: 'number', description: 'Completion percentage (0–100).' },
    { name: 'zip_url', type: 'string', nullable: true, description: 'Pre-signed S3 URL to download the ZIP. Populated only when status is done. Expires after 24 hours.' },
    { name: 'error', type: 'string', nullable: true, description: 'Error message if status is failed.' },
  ],
  exampleResponse: { job_id: 'g7h8i9j0-k1l2-3456-mnop-qrstuvwxyz12', status: 'done', total_rows: 3, processed_rows: 3, progress_percent: 100, zip_url: 'https://storage.supabase.co/v1/object/sign/bulk/g7h8i9j0.zip?token=...', error: null },
  errorCodes: ['401', '403', '404'],
}

export const WEBHOOK_CREATE: EndpointSpec = {
  id: 'create-webhook',
  method: 'POST' as const,
  path: '/webhooks',
  title: 'Create a webhook',
  requiredScope: 'qr:write',
  description: 'Registers a new webhook endpoint. QRise will send signed POST requests to your URL when subscribed events occur. The secret is used to generate an HMAC-SHA256 signature in the X-QRise-Signature header — verify it on your server to confirm authenticity.',
  bodyParams: [
    { name: 'endpoint_url', type: 'string', required: true, description: 'Your HTTPS endpoint URL. Must be publicly reachable.' },
    { name: 'events', type: 'array', required: true, description: 'Event types to subscribe to.', enumValues: ['qr.created','qr.updated','qr.deleted','scan.received','form.submitted'] },
    { name: 'secret', type: 'string', required: false, description: 'A secret string used to sign payloads. If omitted, QRise auto-generates one. Save this — it cannot be retrieved later.' },
  ],
  exampleRequest: { endpoint_url: 'https://yourapp.com/api/qrise-webhook', events: ['scan.received','qr.updated'], secret: 'your-webhook-secret-here' },
  exampleResponse: { id: 'h8i9j0k1-l2m3-4567-nopq-rstuvwxyz123', endpoint_url: 'https://yourapp.com/api/qrise-webhook', events: ['scan.received','qr.updated'], is_active: true, created_at: '2025-06-01T10:30:00Z' },
  errorCodes: ['400', '401', '403', '422'],
  notes: ['QRise retries failed deliveries up to 5 times with exponential backoff (1m, 5m, 30m, 2h, 12h).', 'Your endpoint must respond with HTTP 2xx within 10 seconds or the delivery is marked failed.'],
}

export const ALL_ENDPOINTS: EndpointSpec[] = [
  CREATE_QR,
  LIST_QR,
  GET_QR,
  UPDATE_QR,
  DELETE_QR,
  EXPORT_QR,
  QR_HISTORY,
  SMART_ROUTING_GET,
  SMART_ROUTING_UPDATE,
  ANALYTICS,
  BULK_CREATE,
  BULK_STATUS,
  WEBHOOK_CREATE,
]