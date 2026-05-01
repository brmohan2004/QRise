import type { EndpointSpec } from './types'

export const ME: EndpointSpec = {
  id: 'me',
  method: 'GET',
  path: '/me',
  title: 'Get current user',
  requiredScope: null,
  description: 'Returns information about the authenticated API key and its associated user, including plan details and current rate limits.',
  responseSchema: [
    { name: 'user', type: 'object', children: [
      { name: 'id', type: 'uuid', description: 'User ID.' },
      { name: 'email', type: 'string', description: 'User email address.' },
      { name: 'full_name', type: 'string', description: 'User full name.' },
      { name: 'plan', type: 'string', description: 'Subscription plan slug (free, pro, business, enterprise).' },
      { name: 'plan_expires_at', type: 'string', nullable: true, description: 'ISO 8601 timestamp when current plan expires (null for ongoing subscriptions).' },
    ]},
    { name: 'api_key', type: 'object', children: [
      { name: 'name', type: 'string', description: 'API key label.' },
      { name: 'scopes', type: 'array', description: 'Array of granted scopes (e.g., ["qr:read","qr:write"]).' },
      { name: 'environment', type: 'enum', description: 'Environment: live or test.' },
      { name: 'created_at', type: 'string', description: 'ISO 8601 creation timestamp.' },
      { name: 'last_used_at', type: 'string', nullable: true, description: 'ISO 8601 timestamp of last use.' },
    ]},
    { name: 'limits', type: 'object', children: [
      { name: 'plan', type: 'string', description: 'Plan name from plan_rate_limits.' },
      { name: 'rpm', type: 'number', description: 'Requests per minute (includes burst).' },
      { name: 'rpd', type: 'number', description: 'Requests per day.' },
      { name: 'max_burst', type: 'number', description: 'Burst allowance above RPM.' },
      { name: 'api_calls_per_month', type: 'number', description: 'Monthly API call limit.' },
      { name: 'image_renders_per_month', type: 'number', description: 'Monthly image render limit.' },
      { name: 'embed_renders_per_month', type: 'number', description: 'Monthly embed render limit.' },
      { name: 'resolver_calls_per_month', type: 'number', description: 'Monthly resolver call limit.' },
    ]},
  ],
  exampleResponse: {
    user: {
      id: 'user_abc123',
      email: 'dev@example.com',
      full_name: 'John Doe',
      plan: 'pro',
      plan_expires_at: '2026-12-31T23:59:59Z'
    },
    api_key: {
      name: 'Server API Key',
      scopes: ['qr:read', 'qr:write', 'analytics:read'],
      environment: 'live',
      created_at: '2025-01-15T10:30:00Z',
      last_used_at: '2025-06-01T14:22:00Z'
    },
    limits: {
      plan: 'pro',
      rpm: 100,
      rpd: 5000,
      max_burst: 20,
      api_calls_per_month: 10000,
      image_renders_per_month: 1000,
      embed_renders_per_month: 5000,
      resolver_calls_per_month: 500
    }
  },
  errorCodes: ['401', '403'],
}

export const USAGE: EndpointSpec = {
  id: 'usage',
  method: 'GET',
  path: '/usage',
  title: 'Get usage',
  requiredScope: 'usage:read',
  description: 'Returns current month usage breakdown and plan limits. Use the month query parameter to view historical months.',
  queryParams: [
    { name: 'month', type: 'string', required: false, description: 'YYYY-MM format, defaults to current month.', example: '2025-06' },
  ],
  responseSchema: [
    { name: 'period', type: 'object', children: [
      { name: 'start', type: 'string', description: 'First day of month (ISO 8601).' },
      { name: 'end', type: 'string', description: 'Last day of month (ISO 8601).' },
      { name: 'resets_at', type: 'string', description: 'When the current period ends (ISO 8601).' },
    ]},
    { name: 'limits', type: 'object', children: [
      { name: 'api_calls_per_month', type: 'number' },
      { name: 'image_renders_per_month', type: 'number' },
      { name: 'embed_renders_per_month', type: 'number' },
      { name: 'resolver_calls_per_month', type: 'number' },
    ]},
    { name: 'consumed', type: 'object', children: [
      { name: 'api_calls', type: 'object', children: [
        { name: 'used', type: 'number' },
        { name: 'limit', type: 'number' },
        { name: 'remaining', type: 'number' },
        { name: 'pct', type: 'number', description: 'Percentage used (0-100).' },
      ]},
      { name: 'image_renders', type: 'object', children: [
        { name: 'used', type: 'number' }, { name: 'limit', type: 'number' },
        { name: 'remaining', type: 'number' }, { name: 'pct', type: 'number' },
      ]},
      { name: 'embed_renders', type: 'object', children: [
        { name: 'used', type: 'number' }, { name: 'limit', type: 'number' },
        { name: 'remaining', type: 'number' }, { name: 'pct', type: 'number' },
      ]},
      { name: 'resolver_calls', type: 'object', children: [
        { name: 'used', type: 'number' }, { name: 'limit', type: 'number' },
        { name: 'remaining', type: 'number' }, { name: 'pct', type: 'number' },
      ]},
    ]},
    { name: 'by_day', type: 'array', description: 'Last 30 days of usage data.', children: [
      { name: 'date', type: 'string', description: 'YYYY-MM-DD.' },
      { name: 'api_calls', type: 'number' },
      { name: 'image_renders', type: 'number' },
    ]},
    { name: 'by_endpoint', type: 'array', children: [
      { name: 'endpoint', type: 'string' },
      { name: 'calls', type: 'number' },
      { name: 'avg_latency_ms', type: 'number' },
      { name: 'error_rate', type: 'number', description: 'Percentage (0-100).' },
    ]},
    { name: 'overage', type: 'object', children: [
      { name: 'calls', type: 'number', description: 'Overage calls beyond plan limit.' },
      { name: 'estimated_usd', type: 'number', description: 'Estimated overage cost.' },
    ]},
  ],
  exampleResponse: {
    period: { start: '2025-06-01', end: '2025-06-30', resets_at: '2025-07-01T00:00:00Z' },
    limits: { api_calls_per_month: 10000, image_renders_per_month: 1000, embed_renders_per_month: 5000, resolver_calls_per_month: 500 },
    consumed: {
      api_calls: { used: 4532, limit: 10000, remaining: 5468, pct: 45.32 },
      image_renders: { used: 421, limit: 1000, remaining: 579, pct: 42.1 },
      embed_renders: { used: 2341, limit: 5000, remaining: 2659, pct: 46.82 },
      resolver_calls: { used: 123, limit: 500, remaining: 377, pct: 24.6 },
    },
    by_day: [
      { date: '2025-06-01', api_calls: 150, image_renders: 12 },
      { date: '2025-06-02', api_calls: 167, image_renders: 15 },
    ],
    by_endpoint: [
      { endpoint: '/qr', calls: 2100, avg_latency_ms: 45, error_rate: 0.2 },
      { endpoint: '/qr/:id/analytics', calls: 890, avg_latency_ms: 120, error_rate: 0.5 },
    ],
    overage: { calls: 0, estimated_usd: 0.00 }
  },
  errorCodes: ['401', '403'],
}

export const USAGE_HISTORY: EndpointSpec = {
  id: 'usage-history',
  method: 'GET',
  path: '/usage/history',
  title: 'Get usage history',
  requiredScope: 'usage:read',
  description: 'Returns the last 12 monthly usage snapshots for trend analysis.',
  responseSchema: [
    { name: 'snapshots', type: 'array', children: [
      { name: 'month', type: 'date' },
      { name: 'api_calls', type: 'number' },
      { name: 'image_renders', type: 'number' },
      { name: 'embed_renders', type: 'number' },
      { name: 'resolver_calls', type: 'number' },
      { name: 'overage_calls', type: 'number' },
      { name: 'overage_usd', type: 'number' },
    ]}
  ],
  exampleResponse: {
    snapshots: [
      { month: '2025-06', api_calls: 4532, image_renders: 421, embed_renders: 2341, resolver_calls: 123, overage_calls: 0, overage_usd: 0 },
      { month: '2025-05', api_calls: 3890, image_renders: 389, embed_renders: 2100, resolver_calls: 98, overage_calls: 0, overage_usd: 0 },
    ]
  },
  errorCodes: ['401', '403'],
}

export const USAGE_EXPORT: EndpointSpec = {
  id: 'usage-export',
  method: 'GET',
  path: '/usage/export',
  title: 'Export usage CSV',
  requiredScope: 'usage:read',
  description: 'Streams a CSV file of all API usage events for the specified month. Useful for internal billing reconciliation.',
  queryParams: [
    { name: 'month', type: 'string', required: true, description: 'YYYY-MM format (e.g., 2025-06).' },
  ],
  responseSchema: [
    { name: '_note', type: 'string', description: 'Streams CSV directly. Content-Type: text/csv. Content-Disposition: attachment.' },
  ],
  exampleResponse: { _note: 'CSV stream with headers: date,endpoint,method,status_code,latency_ms,billable_unit,quantity' },
  errorCodes: ['400', '401', '403'],
}

export const USAGE_ALERTS: EndpointSpec = {
  id: 'usage-alerts',
  method: 'GET',
  path: '/usage/alerts',
  title: 'List alert channels',
  requiredScope: 'usage:read',
  description: 'Returns all configured usage alert channels (Slack, Discord, email).',
  responseSchema: [
    { name: 'items', type: 'array', children: [
      { name: 'id', type: 'uuid' },
      { name: 'channel_type', type: 'enum', description: 'Alert channel type (slack, discord, email).' },
      { name: 'webhook_url', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'threshold_pct', type: 'number', description: 'Alert when usage reaches this percentage (50-100).' },
      { name: 'is_active', type: 'boolean' },
      { name: 'created_at', type: 'string' },
    ]}
  ],
  errorCodes: ['401', '403'],
}

export const USAGE_ALERTS_CREATE: EndpointSpec = {
  id: 'usage-alerts-create',
  method: 'POST',
  path: '/usage/alerts',
  title: 'Create alert channel',
  requiredScope: 'usage:read',
  description: 'Adds a new usage alert channel. For Slack/Discord, provide an incoming webhook URL. For email, provide an email address.',
  bodyParams: [
    { name: 'channel_type', type: 'enum', required: true, enumValues: ['slack', 'discord', 'email'] },
    { name: 'webhook_url', type: 'string', required: false, description: 'Required for slack/discord. Must be HTTPS.' },
    { name: 'email', type: 'string', required: false, description: 'Required for email channel.' },
    { name: 'threshold_pct', type: 'number', required: false, description: '50-100, default 80.' },
  ],
  responseSchema: [
    { name: 'id', type: 'uuid' },
    { name: 'channel_type', type: 'string' },
    { name: 'threshold_pct', type: 'number' },
    { name: 'is_active', type: 'boolean' },
  ],
  errorCodes: ['400', '401', '403', '422'],
}

export const QR_IMAGE: EndpointSpec = {
  id: 'qr-image',
  method: 'GET',
  path: '/qr/{id}/image',
  title: 'Get QR image',
  requiredScope: 'qr:read',
  description: 'Generates a QR code image server-side with the current design. Supports PNG, SVG, and WebP formats. Apply overrides via query params without updating the stored design.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'QR code UUID.' }],
  queryParams: [
    { name: 'format', type: 'enum', required: false, enumValues: ['png', 'svg', 'webp'], defaultValue: 'png' },
    { name: 'size', type: 'number', required: false, description: 'Pixel size (width=height). Min 128, max 2048.', defaultValue: '512' },
    { name: 'dpi', type: 'enum', required: false, enumValues: ['72', '150', '300'], defaultValue: '72', description: 'DPI for PNG export only.' },
    { name: 'margin', type: 'number', required: false, description: 'Quiet zone in modules (0-10).', defaultValue: '4' },
    { name: 'dark', type: 'string', required: false, description: 'Hex color override for QR dots (e.g., #000000).' },
    { name: 'light', type: 'string', required: false, description: 'Hex color override for background (e.g., #ffffff).' },
    { name: 'error_correction', type: 'enum', required: false, enumValues: ['L', 'M', 'Q', 'H'], defaultValue: 'M' },
  ],
  responseSchema: [
    { name: '_note', type: 'string', description: 'Binary image stream. Content-Type: image/png|image/svg+xml|image/webp.' },
  ],
  notes: [
    'Billable unit: image_render (counts toward monthly limit).',
    'Hard rate limit: 60 image renders/minute per key regardless of plan.',
    'Image generation happens on-demand; cache responses where possible.',
  ],
  errorCodes: ['400', '401', '403', '404', '429'],
}

export const QR_EMBED: EndpointSpec = {
  id: 'qr-embed',
  method: 'GET',
  path: '/qr/{id}/embed',
  title: 'Get embed snippet',
  requiredScope: 'qr:read',
  description: 'Returns HTML/CSS/iframe data for embedding a QR code card on external websites. Self-contained HTML requires no external CSS.',
  pathParams: [{ name: 'id', type: 'uuid', required: true }],
  queryParams: [
    { name: 'style', type: 'enum', required: false, enumValues: ['card', 'minimal', 'badge', 'floating'], defaultValue: 'card' },
    { name: 'theme', type: 'enum', required: false, enumValues: ['light', 'dark', 'auto'], defaultValue: 'auto' },
    { name: 'size', type: 'enum', required: false, enumValues: ['sm', 'md', 'lg'], defaultValue: 'md' },
    { name: 'show_name', type: 'boolean', required: false, defaultValue: 'true' },
    { name: 'show_scan_count', type: 'boolean', required: false, defaultValue: 'false' },
  ],
  responseSchema: [
    { name: 'html', type: 'string', description: 'Self-contained <div> snippet with inline styles.' },
    { name: 'iframe_url', type: 'string', description: 'URL to embed via <iframe> (no JS fallback).' },
    { name: 'css_url', type: 'string', description: 'External CSS URL: /embed/embed.css' },
    { name: 'react_snippet', type: 'string', description: 'JSX for React: <QRiseEmbed id="..." />' },
  ],
  exampleResponse: {
    html: '<div class="qrise-embed qrise-embed--card qrise-embed--md">...</div>',
    iframe_url: 'https://app.qrise.app/embed/qr/abc123?theme=auto',
    css_url: 'https://app.qrise.app/embed/embed.css',
    react_snippet: '<QRiseEmbed id="abc123" style="card" theme="auto" size="md" />'
  },
  billableUnit: 'embed_render',
  errorCodes: ['401', '403', '404'],
}

export const TYPES_LIST: EndpointSpec = {
  id: 'types-list',
  method: 'GET',
  path: '/types',
  title: 'List custom types',
  requiredScope: 'types:read',
  description: 'Returns custom QR types accessible to you. Built-in types (url, smart_routing, etc.) are always included.',
  queryParams: [
    { name: 'scope', type: 'enum', required: false, enumValues: ['mine', 'public', 'marketplace'], defaultValue: 'mine',
      description: 'mine: your types; public: all public types; marketplace: public+verified admin types.' },
    { name: 'page', type: 'number', required: false, defaultValue: '1' },
    { name: 'limit', type: 'number', required: false, defaultValue: '20' },
  ],
  responseSchema: [
    { name: 'items', type: 'array', children: [
      { name: 'id', type: 'uuid' },
      { name: 'slug', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string', nullable: true },
      { name: 'icon_url', type: 'string', nullable: true },
      { name: 'fields_schema', type: 'object', description: 'JSON Schema Draft-07 defining required fields.' },
      { name: 'is_public', type: 'boolean' },
      { name: 'is_verified', type: 'boolean', description: 'Admin verified for marketplace.' },
      { name: 'scan_count', type: 'number', description: 'Total scans using this type.' },
      { name: 'created_at', type: 'string' },
    ]},
    { name: 'total', type: 'number' },
  ],
  errorCodes: ['401', '403'],
}

export const TYPE_CREATE: EndpointSpec = {
  id: 'type-create',
  method: 'POST',
  path: '/types',
  title: 'Create custom type',
  requiredScope: 'types:write',
  description: 'Registers a new custom QR type. The plan must have max_custom_types > 0. fields_schema must be a valid JSON Schema Draft-07.',
  bodyParams: [
    { name: 'slug', type: 'string', required: true, description: 'Unique, lowercase, hyphens only, max 80 chars.' },
    { name: 'name', type: 'string', required: true, description: 'Display name, max 200 chars.' },
    { name: 'description', type: 'string', required: false },
    { name: 'icon_url', type: 'string', required: false },
    { name: 'fields_schema', type: 'object', required: true, description: 'Valid JSON Schema object.' },
    { name: 'is_public', type: 'boolean', required: false, defaultValue: 'false' },
  ],
  responseSchema: [
    { name: 'id', type: 'uuid' },
    { name: 'slug', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'version', type: 'number', description: 'Schema version, starts at 1.' },
  ],
  errorCodes: ['400', '401', '403', '409', '422'],
  notes: ['max_custom_types is enforced via plan_rate_limits.', 'Slug must be globally unique.'],
}

export const TYPE_GET: EndpointSpec = {
  id: 'type-get',
  method: 'GET',
  path: '/types/{slug}',
  title: 'Get custom type',
  requiredScope: 'types:read',
  description: 'Returns the type definition. For types with resolvers, the secret is masked (prefix only).',
  pathParams: [{ name: 'slug', type: 'string', required: true }],
  responseSchema: [
    { name: 'id', type: 'uuid' },
    { name: 'slug', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'fields_schema', type: 'object' },
    { name: 'is_public', type: 'boolean' },
    { name: 'is_verified', type: 'boolean' },
    { name: 'resolver', type: 'object', nullable: true, children: [
      { name: 'resolver_url', type: 'string' },
      { name: 'resolver_secret_prefix', type: 'string', description: 'First 8 chars only.' },
      { name: 'timeout_ms', type: 'number' },
      { name: 'is_active', type: 'boolean' },
    ]},
  ],
  errorCodes: ['401', '403', '404'],
}

export const TYPE_UPDATE: EndpointSpec = {
  id: 'type-update',
  method: 'PATCH',
  path: '/types/{slug}',
  title: 'Update custom type',
  requiredScope: 'types:write',
  description: 'Updatable fields: name, description, fields_schema, is_public. Changing fields_schema auto-increments version.',
  pathParams: [{ name: 'slug', type: 'string', required: true }],
  bodyParams: [
    { name: 'name', type: 'string', required: false },
    { name: 'description', type: 'string', required: false },
    { name: 'fields_schema', type: 'object', required: false },
    { name: 'is_public', type: 'boolean', required: false },
  ],
  responseSchema: [
    { name: 'id', type: 'uuid' },
    { name: 'version', type: 'number', description: 'Incremented if schema changed.' },
    { name: 'updated_at', type: 'string' },
  ],
  errorCodes: ['400', '401', '403', '404', '409'],
}

export const TYPE_DELETE: EndpointSpec = {
  id: 'type-delete',
  method: 'DELETE',
  path: '/types/{slug}',
  title: 'Delete custom type',
  requiredScope: 'types:write',
  description: 'Soft-deletes the type. Fails with 409 if active QR codes are using it.',
  pathParams: [{ name: 'slug', type: 'string', required: true }],
  responseSchema: [{ name: 'deleted', type: 'boolean' }],
  errorCodes: ['400', '401', '403', '404', '409'],
}

export const RESOLVER_CONFIG: EndpointSpec = {
  id: 'resolver-config',
  method: 'GET',
  path: '/types/{slug}/resolver',
  title: 'Get resolver config',
  requiredScope: 'types:write',
  description: 'Returns resolver configuration with secret masked to prefix only.',
  pathParams: [{ name: 'slug', type: 'string', required: true }],
  responseSchema: [
    { name: 'resolver_url', type: 'string' },
    { name: 'timeout_ms', type: 'number' },
    { name: 'fallback_url', type: 'string', nullable: true },
    { name: 'fallback_html', type: 'string', nullable: true },
    { name: 'retry_on_fail', type: 'boolean' },
    { name: 'is_active', type: 'boolean' },
    { name: 'resolver_secret_prefix', type: 'string', description: 'First 8 characters only.' },
    { name: 'created_at', type: 'string' },
  ],
  errorCodes: ['401', '403', '404'],
}

export const RESOLVER_UPDATE: EndpointSpec = {
  id: 'resolver-update',
  method: 'PUT',
  path: '/types/{slug}/resolver',
  title: 'Update or create resolver config',
  requiredScope: 'types:write',
  description: 'If no resolver exists, creates one and returns full secret (shown once). If exists, updates config but does NOT reveal secret. timeout_ms is capped by plan limits.',
  pathParams: [{ name: 'slug', type: 'string', required: true }],
  bodyParams: [
    { name: 'resolver_url', type: 'string', required: true, description: 'HTTPS URL only.' },
    { name: 'timeout_ms', type: 'number', required: false, description: '100 to max_resolver_timeout_ms from plan. Default 3000.' },
    { name: 'fallback_url', type: 'string', required: false },
    { name: 'fallback_html', type: 'string', required: false },
    { name: 'retry_on_fail', type: 'boolean', required: false, defaultValue: 'true' },
  ],
  responseSchema: [
    { name: 'resolver_url', type: 'string' },
    { name: 'timeout_ms', type: 'number' },
    { name: 'fallback_url', type: 'string', nullable: true },
    { name: 'fallback_html', type: 'string', nullable: true },
    { name: 'retry_on_fail', type: 'boolean' },
    { name: 'resolver_secret', type: 'string', description: 'Full secret — only returned on creation or rotate. Save immediately!' },
  ],
  errorCodes: ['400', '401', '403', '404', '422'],
  notes: ['If this is an update, resolver_secret is NOT returned unless explicitly rotated via rotate-secret endpoint.'],
}

export const RESOLVER_DELETE: EndpointSpec = {
  id: 'resolver-delete',
  method: 'DELETE',
  path: '/types/{slug}/resolver',
  title: 'Disable resolver',
  requiredScope: 'types:write',
  description: 'Deactivates the resolver. QRs of this type will fall back to fallback_url or show error page. Does not delete the resolver record.',
  pathParams: [{ name: 'slug', type: 'string', required: true }],
  responseSchema: [{ name: 'deactivated', type: 'boolean' }],
  errorCodes: ['401', '403', '404'],
}

export const RESOLVER_TEST: EndpointSpec = {
  id: 'resolver-test',
  method: 'POST',
  path: '/types/{slug}/resolver/test',
  title: 'Test resolver',
  requiredScope: 'types:write',
  description: 'Sends a synthetic POST to your resolver endpoint to verify connectivity and response format. Does not create a resolver_calls log entry.',
  pathParams: [{ name: 'slug', type: 'string', required: true }],
  bodyParams: [
    { name: 'scan_context', type: 'object', required: false, description: 'Optional custom scan context for testing.' },
  ],
  responseSchema: [
    { name: 'status', type: 'number', description: 'HTTP status code returned by your resolver.' },
    { name: 'latency_ms', type: 'number' },
    { name: 'response_type', type: 'enum', description: 'Parsed response type (redirect, html, json).' },
    { name: 'response_body', type: 'object', description: 'The returned JSON object (for type=json).' },
    { name: 'fallback_used', type: 'boolean', description: 'If true, your resolver timed out and we used fallback.' },
    { name: 'signed_correctly', type: 'boolean', description: 'Whether the signature we sent was valid (we verified on return).' },
  ],
  errorCodes: ['400', '401', '403', '404', '502', '504'],
  notes: ['This endpoint does not decrement your resolver_calls_per_month quota.'],
}

export const RESOLVER_ROTATE_SECRET: EndpointSpec = {
  id: 'resolver-rotate-secret',
  method: 'POST',
  path: '/types/{slug}/resolver/rotate-secret',
  title: 'Rotate resolver secret',
  requiredScope: 'types:write',
  description: 'Generates a new resolver_secret. The old secret becomes invalid immediately. Update your resolver server before calling this to avoid outage.',
  pathParams: [{ name: 'slug', type: 'string', required: true }],
  responseSchema: [
    { name: 'resolver_secret', type: 'string', description: 'NEW full secret — shown once only.' },
    { name: 'rotated_at', type: 'string', description: 'ISO 8601 timestamp.' },
  ],
  errorCodes: ['401', '403', '404'],
}

export const TEMPLATES_LIST: EndpointSpec = {
  id: 'templates-list',
  method: 'GET',
  path: '/types/{slug}/templates',
  title: 'List templates',
  requiredScope: 'types:read',
  description: 'Returns all Mustache templates registered for this custom type. Templates are used when resolver returns type=json with a template slug.',
  pathParams: [{ name: 'slug', type: 'string', required: true }],
  responseSchema: [
    { name: 'items', type: 'array', children: [
      { name: 'id', type: 'uuid' },
      { name: 'slug', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'template_html', type: 'string' },
      { name: 'is_default', type: 'boolean' },
      { name: 'created_at', type: 'string' },
    ]}
  ],
  errorCodes: ['401', '403', '404'],
}

export const TEMPLATE_CREATE: EndpointSpec = {
  id: 'template-create',
  method: 'POST',
  path: '/types/{slug}/templates',
  title: 'Create template',
  requiredScope: 'types:write',
  description: 'Registers a Mustache template for this type. Available variables: all fields from fields_schema + scan_context.device_type, scan_context.country, scan_context.os.',
  pathParams: [{ name: 'slug', type: 'string', required: true }],
  bodyParams: [
    { name: 'slug', type: 'string', required: true, description: 'Template slug, max 80 chars.' },
    { name: 'name', type: 'string', required: true, description: 'Human-readable name.' },
    { name: 'template_html', type: 'string', required: true, description: 'Mustache template (max 50 KB).' },
    { name: 'is_default', type: 'boolean', required: false, defaultValue: 'false' },
  ],
  responseSchema: [
    { name: 'id', type: 'uuid' },
    { name: 'slug', type: 'string' },
    { name: 'name', type: 'string' },
  ],
  errorCodes: ['400', '401', '403', '404', '409'],
  notes: ['Maximum 10 templates per type.'],
}

export const MARKETPLACE_SUBMIT: EndpointSpec = {
  id: 'marketplace-submit',
  method: 'POST',
  path: '/types/{slug}/marketplace',
  title: 'Submit to marketplace',
  requiredScope: 'types:write',
  description: 'Submits a public custom type for admin review. Type must be is_public=true with description and icon_url. Users limited to 3 pending submissions.',
  pathParams: [{ name: 'slug', type: 'string', required: true }],
  bodyParams: [
    { name: 'notes', type: 'string', required: true, description: 'Explanation of use case and why this type should be public.' },
  ],
  responseSchema: [
    { name: 'submission_id', type: 'uuid' },
    { name: 'status', type: 'string', description: 'Always "pending" on submission (pending, approved, rejected).' },
    { name: 'estimated_review_days', type: 'number', description: 'Estimated review time in business days.' },
  ],
  errorCodes: ['400', '401', '403', '404', '409', '422'],
  notes: ['Type must have an active resolver configured and tested.'],
}

export const WEBHOOKS_LIST: EndpointSpec = {
  id: 'webhooks-list',
  method: 'GET',
  path: '/webhooks',
  title: 'List webhooks',
  requiredScope: 'webhooks:manage',
  description: 'Returns all webhook subscriptions for the authenticated user. Secrets are masked to prefix only.',
  responseSchema: [
    { name: 'items', type: 'array', children: [
      { name: 'id', type: 'uuid' },
      { name: 'endpoint_url', type: 'string', description: 'First 50 chars only in list view.' },
      { name: 'events', type: 'array', description: 'Subscribed event types.' },
      { name: 'description', type: 'string', nullable: true },
      { name: 'is_active', type: 'boolean' },
      { name: 'last_delivery_at', type: 'string', nullable: true },
      { name: 'deliveries_24h', type: 'object', children: [
        { name: 'delivered', type: 'number' },
        { name: 'failed', type: 'number' },
      ]},
      { name: 'created_at', type: 'string' },
    ]}
  ],
  errorCodes: ['401', '403'],
}

export const WEBHOOK_CREATE: EndpointSpec = {
  id: 'webhook-create',
  method: 'POST',
  path: '/webhooks',
  title: 'Create webhook',
  requiredScope: 'webhooks:manage',
  description: 'Creates a new webhook subscription. QRise sends signed POST requests to your endpoint. The secret is used for HMAC-SHA256 verification and is shown only once.',
  bodyParams: [
    { name: 'endpoint_url', type: 'string', required: true, description: 'HTTPS URL. Must be publicly reachable from QRise servers.' },
    { name: 'events', type: 'array', required: true, description: 'Array of event types to subscribe to.', enumValues: ['qr.created','qr.updated','qr.deleted','qr.scanned','qr.scan_milestone','type.registered','type.updated','type.suspended','resolver.failed','usage.threshold_reached','usage.quota_exceeded','api_key.created','api_key.revoked','bulk.job_completed','form.submission','marketplace.submission_reviewed'] },
    { name: 'description', type: 'string', required: false },
    { name: 'filter_config', type: 'object', required: false, description: 'Per-event filters to reduce noise (see Event Filters docs).' },
  ],
  responseSchema: [
    { name: 'id', type: 'uuid' },
    { name: 'endpoint_url', type: 'string' },
    { name: 'events', type: 'array' },
    { name: 'description', type: 'string' },
    { name: 'filter_config', type: 'object', nullable: true },
    { name: 'secret', type: 'string', description: 'Signing secret — shown ONCE. Save immediately!' },
    { name: 'created_at', type: 'string' },
  ],
  errorCodes: ['400', '401', '403', '409', '422'],
  notes: ['Plan limit enforced: max_webhooks from plan_rate_limits.', 'Your endpoint must return 2xx within 10 seconds or the delivery is marked failed.'],
}

export const WEBHOOK_GET: EndpointSpec = {
  id: 'webhook-get',
  method: 'GET',
  path: '/webhooks/{id}',
  title: 'Get webhook',
  requiredScope: 'webhooks:manage',
  description: 'Returns webhook details without the secret (masked prefix only).',
  pathParams: [{ name: 'id', type: 'uuid', required: true }],
  responseSchema: [
    { name: 'id', type: 'uuid' },
    { name: 'endpoint_url', type: 'string' },
    { name: 'events', type: 'array' },
    { name: 'description', type: 'string' },
    { name: 'filter_config', type: 'object', nullable: true },
    { name: 'is_active', type: 'boolean' },
    { name: 'secret_prefix', type: 'string', description: 'First 8 characters of secret.' },
    { name: 'created_at', type: 'string' },
    { name: 'updated_at', type: 'string' },
  ],
  errorCodes: ['401', '403', '404'],
}

export const WEBHOOK_UPDATE: EndpointSpec = {
  id: 'webhook-update',
  method: 'PATCH',
  path: '/webhooks/{id}',
  title: 'Update webhook',
  requiredScope: 'webhooks:manage',
  description: 'Updates endpoint_url, events, description, or filter_config. Secret cannot be retrieved; use rotate-secret to change.',
  pathParams: [{ name: 'id', type: 'uuid', required: true }],
  bodyParams: [
    { name: 'endpoint_url', type: 'string', required: false },
    { name: 'events', type: 'array', required: false },
    { name: 'description', type: 'string', required: false },
    { name: 'filter_config', type: 'object', required: false },
  ],
  responseSchema: [
    { name: 'id', type: 'uuid' },
    { name: 'endpoint_url', type: 'string' },
    { name: 'events', type: 'array' },
    { name: 'updated_at', type: 'string' },
  ],
  errorCodes: ['400', '401', '403', '404'],
}

export const WEBHOOK_DELETE: EndpointSpec = {
  id: 'webhook-delete',
  method: 'DELETE',
  path: '/webhooks/{id}',
  title: 'Delete webhook',
  requiredScope: 'webhooks:manage',
  description: 'Permanently deletes the webhook and all associated delivery records.',
  pathParams: [{ name: 'id', type: 'uuid', required: true }],
  responseSchema: [{ name: 'deleted', type: 'boolean' }],
  errorCodes: ['401', '403', '404'],
}

export const WEBHOOK_TEST: EndpointSpec = {
  id: 'webhook-test',
  method: 'POST',
  path: '/webhooks/{id}/test',
  title: 'Test webhook',
  requiredScope: 'webhooks:manage',
  description: 'Sends a synthetic test event immediately to the webhook endpoint. Bypasses the retry queue.',
  pathParams: [{ name: 'id', type: 'uuid', required: true }],
  bodyParams: [
    { name: 'event', type: 'enum', required: false, enumValues: ['qr.created','qr.updated','qr.deleted','qr.scanned','qr.scan_milestone','type.registered','type.updated','type.suspended','resolver.failed','usage.threshold_reached','usage.quota_exceeded','api_key.created','api_key.revoked','bulk.job_completed','form.submission','marketplace.submission_reviewed'], defaultValue: 'qr.created' },
  ],
  responseSchema: [
    { name: 'delivered', type: 'boolean', description: 'True if endpoint returned 2xx.' },
    { name: 'status_code', type: 'number', description: 'HTTP status returned by your endpoint.' },
    { name: 'latency_ms', type: 'number', description: 'Time from POST to response.' },
    { name: 'response_body', type: 'string', description: 'Truncated response (max 1 KB).' },
    { name: 'signature_sent', type: 'string', description: 'The X-QRise-Signature header value sent.' },
  ],
  errorCodes: ['400', '401', '403', '404', '502'],
}

export const WEBHOOK_ROTATE_SECRET: EndpointSpec = {
  id: 'webhook-rotate-secret',
  method: 'POST',
  path: '/webhooks/{id}/rotate-secret',
  title: 'Rotate webhook secret',
  requiredScope: 'webhooks:manage',
  description: 'Generates a new signing secret for this webhook. The old secret immediately becomes invalid. Update your server before calling to avoid missed events.',
  pathParams: [{ name: 'id', type: 'uuid', required: true }],
  responseSchema: [
    { name: 'secret', type: 'string', description: 'NEW full secret — shown once only.' },
    { name: 'rotated_at', type: 'string' },
  ],
  errorCodes: ['401', '403', '404'],
}

export const WEBHOOK_DELIVERIES_LIST: EndpointSpec = {
  id: 'webhook-deliveries-list',
  method: 'GET',
  path: '/webhooks/{id}/deliveries',
  title: 'List deliveries',
  requiredScope: 'webhooks:manage',
  description: 'Returns delivery attempts for this webhook. Used for debugging failed deliveries.',
  pathParams: [{ name: 'id', type: 'uuid', required: true }],
  queryParams: [
    { name: 'status', type: 'enum', required: false, enumValues: ['pending','delivered','failed','retrying','abandoned'] },
    { name: 'event', type: 'string', required: false },
    { name: 'page', type: 'number', required: false, defaultValue: '1' },
    { name: 'limit', type: 'number', required: false, defaultValue: '20' },
  ],
  responseSchema: [
    { name: 'items', type: 'array', children: [
      { name: 'id', type: 'uuid' },
      { name: 'event_type', type: 'string' },
      { name: 'status', type: 'string' },
      { name: 'attempts', type: 'number' },
      { name: 'delivered_at', type: 'string', nullable: true },
      { name: 'duration_ms', type: 'number', nullable: true },
      { name: 'response_status', type: 'number', nullable: true },
      { name: 'next_retry_at', type: 'string', nullable: true },
    ]},
    { name: 'total', type: 'number' },
  ],
  errorCodes: ['401', '403', '404'],
}

export const WEBHOOK_DELIVERY_REPLAY: EndpointSpec = {
  id: 'webhook-delivery-replay',
  method: 'POST',
  path: '/webhooks/{id}/deliveries/{deliveryId}/replay',
  title: 'Replay delivery',
  requiredScope: 'webhooks:manage',
  description: 'Re-sends a past delivery as a new delivery record. The original record remains unchanged.',
  pathParams: [
    { name: 'id', type: 'uuid', required: true, description: 'Webhook ID.' },
    { name: 'deliveryId', type: 'uuid', required: true, description: 'Original delivery ID to replay.' },
  ],
  responseSchema: [
    { name: 'new_delivery_id', type: 'uuid' },
    { name: 'status', type: 'string', description: 'New delivery status is always pending.' },
  ],
  errorCodes: ['401', '403', '404'],
}

export const MARKETPLACE_TYPES: EndpointSpec = {
  id: 'marketplace-types',
  method: 'GET',
  path: '/marketplace/types',
  title: 'List marketplace types',
  requiredScope: null,
  description: 'Public endpoint listing all verified custom types available in the marketplace. No authentication required.',
  queryParams: [
    { name: 'search', type: 'string', required: false, description: 'Search by name or slug.' },
    { name: 'category', type: 'string', required: false, description: 'Category filter (healthcare, hospitality, retail, events, logistics, other).' },
    { name: 'sort', type: 'enum', required: false, enumValues: ['most_used', 'newest', 'most_scans'], defaultValue: 'most_used' },
    { name: 'page', type: 'number', required: false, defaultValue: '1' },
    { name: 'limit', type: 'number', required: false, defaultValue: '20' },
  ],
  responseSchema: [
    { name: 'items', type: 'array', children: [
      { name: 'id', type: 'uuid' },
      { name: 'slug', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'creator', type: 'string', description: 'Username (not email).' },
      { name: 'scan_count', type: 'number', description: 'Total scans across all QRs using this type.' },
      { name: 'qr_count_using_type', type: 'number', description: 'Number of QRs using this type.' },
      { name: 'is_verified', type: 'boolean' },
    ]},
    { name: 'total', type: 'number' },
  ],
  errorCodes: [],
}

export const LIST_QR: EndpointSpec = {
  id: 'list-qr',
  method: 'GET',
  path: '/qr',
  title: 'List QR codes',
  requiredScope: 'qr:read',
  description: 'Returns a paginated list of QR codes. Use query parameters to filter by type or status.',
  queryParams: [
    { name: 'type', type: 'string', required: false, description: 'Filter by QR type (e.g., url, smart_routing).' },
    { name: 'status', type: 'enum', required: false, enumValues: ['active', 'paused', 'expired'], description: 'Filter by current status.' },
    { name: 'page', type: 'number', required: false, defaultValue: '1', description: 'Page number for pagination.' },
    { name: 'limit', type: 'number', required: false, defaultValue: '20', description: 'Number of items per page.' },
  ],
  responseSchema: [
    { name: 'items', type: 'array', description: 'Array of QR code objects.', children: [
      { name: 'id', type: 'uuid', description: 'Unique identifier.' },
      { name: 'name', type: 'string', description: 'Human-readable name.' },
      { name: 'type', type: 'string', description: 'QR type slug.' },
      { name: 'target_url', type: 'string', nullable: true, description: 'Destination URL for dynamic QRs.' },
      { name: 'short_url', type: 'string', description: 'The redirect URL.' },
      { name: 'scan_count', type: 'number', description: 'Total number of scans.' },
      { name: 'created_at', type: 'string', description: 'ISO 8601 creation timestamp.' },
    ]},
    { name: 'total', type: 'number', description: 'Total count matching filters.' },
  ],
  exampleResponse: {
    items: [
      { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Company Website', type: 'url', target_url: 'https://example.com', short_url: 'https://qri.se/xyz123', scan_count: 452, created_at: '2025-06-01T10:00:00Z' }
    ],
    total: 125
  },
  errorCodes: ['401', '403'],
}

export const CREATE_QR: EndpointSpec = {
  id: 'create-qr',
  method: 'POST',
  path: '/qr',
  title: 'Create QR code',
  requiredScope: 'qr:write',
  description: 'Creates a new QR code. For dynamic QRs, the target_url can be updated later.',
  bodyParams: [
    { name: 'name', type: 'string', required: true, description: 'Internal name for management.' },
    { name: 'type', type: 'string', required: true, description: 'QR type slug (e.g., url, vcard, wifi, smart_routing).' },
    { name: 'target_url', type: 'string', required: false, description: 'Destination URL (required for url/smart_routing types).' },
    { name: 'is_dynamic', type: 'boolean', required: false, defaultValue: 'true', description: 'If true, scans are tracked and destination can be changed.' },
    { name: 'custom_fields', type: 'object', required: false, description: 'Data required for custom types.' },
  ],
  responseSchema: [
    { name: 'id', type: 'uuid', description: 'Newly created QR ID.' },
    { name: 'short_url', type: 'string', description: 'The redirect URL.' },
    { name: 'created_at', type: 'string', description: 'Creation timestamp.' },
  ],
  exampleResponse: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    short_url: 'https://qri.se/xyz123',
    created_at: '2025-06-15T14:30:00Z'
  },
  errorCodes: ['400', '401', '403', '422'],
}

export const GET_QR: EndpointSpec = {
  id: 'get-qr',
  method: 'GET',
  path: '/qr/{id}',
  title: 'Get QR code',
  requiredScope: 'qr:read',
  description: 'Returns the full details of a single QR code.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'QR code UUID.' }],
  responseSchema: [
    { name: 'id', type: 'uuid', description: 'QR code UUID.' },
    { name: 'name', type: 'string', description: 'Human-readable name.' },
    { name: 'type', type: 'string', description: 'QR type slug.' },
    { name: 'target_url', type: 'string', nullable: true, description: 'Destination URL.' },
    { name: 'short_url', type: 'string', description: 'The redirect URL.' },
    { name: 'is_dynamic', type: 'boolean', description: 'Whether the QR is dynamic.' },
    { name: 'scan_count', type: 'number', description: 'Total number of scans.' },
    { name: 'created_at', type: 'string', description: 'Creation timestamp.' },
    { name: 'last_scanned_at', type: 'string', nullable: true, description: 'Last scan timestamp.' },
  ],
  exampleResponse: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Summer Campaign',
    type: 'url',
    target_url: 'https://example.com/summer',
    short_url: 'https://qri.se/xyz123',
    is_dynamic: true,
    scan_count: 1250,
    created_at: '2025-06-01T10:00:00Z',
    last_scanned_at: '2025-06-20T18:45:00Z'
  },
  errorCodes: ['401', '403', '404'],
}

export const UPDATE_QR: EndpointSpec = {
  id: 'update-qr',
  method: 'PATCH',
  path: '/qr/{id}',
  title: 'Update QR code',
  requiredScope: 'qr:write',
  description: 'Updates an existing QR code. Only dynamic QRs can have their target_url updated.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'QR code UUID.' }],
  bodyParams: [
    { name: 'name', type: 'string', required: false, description: 'New name.' },
    { name: 'target_url', type: 'string', required: false, description: 'New destination URL.' },
    { name: 'status', type: 'enum', required: false, enumValues: ['active', 'paused'], description: 'New status.' },
  ],
  responseSchema: [
    { name: 'id', type: 'uuid', description: 'QR code UUID.' },
    { name: 'updated_at', type: 'string', description: 'Update timestamp.' },
  ],
  exampleResponse: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    updated_at: '2025-06-21T09:15:00Z'
  },
  errorCodes: ['400', '401', '403', '404', '422'],
}

export const DELETE_QR: EndpointSpec = {
  id: 'delete-qr',
  method: 'DELETE',
  path: '/qr/{id}',
  title: 'Delete QR code',
  requiredScope: 'qr:write',
  description: 'Permanently deletes a QR code. The short URL will stop working immediately.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'QR code UUID.' }],
  responseSchema: [{ name: 'deleted', type: 'boolean', description: 'Success flag.' }],
  exampleResponse: { deleted: true },
  errorCodes: ['401', '403', '404'],
}

export const EXPORT_QR: EndpointSpec = {
  id: 'export-qr',
  method: 'GET',
  path: '/qr/export',
  title: 'Export QR codes',
  requiredScope: 'qr:read',
  description: 'Streams a CSV file of all your QR codes and their current metadata.',
  responseSchema: [{ name: '_note', type: 'string', description: 'Streams CSV directly.' }],
  exampleResponse: { _note: 'CSV stream' },
  errorCodes: ['401', '403'],
}

export const QR_HISTORY: EndpointSpec = {
  id: 'qr-history',
  method: 'GET',
  path: '/qr/{id}/history',
  title: 'Get update history',
  requiredScope: 'qr:read',
  description: 'Returns a log of all changes made to this QR code (e.g., target_url updates).',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'QR code UUID.' }],
  responseSchema: [
    { name: 'items', type: 'array', description: 'History items.', children: [
      { name: 'changed_at', type: 'string', description: 'Timestamp.' },
      { name: 'field', type: 'string', description: 'Field name.' },
      { name: 'old_value', type: 'string', nullable: true, description: 'Previous value.' },
      { name: 'new_value', type: 'string', description: 'New value.' },
    ]}
  ],
  errorCodes: ['401', '403', '404'],
}

export const SMART_ROUTING_GET: EndpointSpec = {
  id: 'smart-routing-get',
  method: 'GET',
  path: '/qr/{id}/routing-rules',
  title: 'Get routing rules',
  requiredScope: 'qr:read',
  description: 'Returns the smart routing rules configured for a QR code of type "smart_routing".',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'QR code UUID.' }],
  responseSchema: [
    { name: 'rules', type: 'array', description: 'Rules array.', children: [
      { name: 'priority', type: 'number', description: 'Evaluation priority.' },
      { name: 'label', type: 'string', description: 'Rule name.' },
      { name: 'conditions', type: 'array', description: 'Evaluation conditions.' },
      { name: 'target_url', type: 'string', description: 'Destination for this rule.' },
    ]},
    { name: 'default_url', type: 'string', description: 'Fallback URL.' },
  ],
  errorCodes: ['401', '403', '404'],
}

export const SMART_ROUTING_UPDATE: EndpointSpec = {
  id: 'smart-routing-update',
  method: 'PUT',
  path: '/qr/{id}/routing-rules',
  title: 'Update routing rules',
  requiredScope: 'qr:write',
  description: 'Overwrites the smart routing rules for a QR code. Priority 0 is evaluated first.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'QR code UUID.' }],
  bodyParams: [
    { name: 'rules', type: 'array', required: true, description: 'The new rules array.' },
    { name: 'default_url', type: 'string', required: true, description: 'The new default URL.' },
  ],
  responseSchema: [
    { name: 'rules_count', type: 'number', description: 'Number of rules saved.' },
    { name: 'updated_at', type: 'string', description: 'Update timestamp.' },
  ],
  errorCodes: ['400', '401', '403', '404', '422'],
}

export const ANALYTICS: EndpointSpec = {
  id: 'analytics',
  method: 'GET',
  path: '/qr/{id}/analytics',
  title: 'Get analytics',
  requiredScope: 'analytics:read',
  description: 'Returns scan analytics for a specific QR code, including device, location, and time series data.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'QR code UUID.' }],
  queryParams: [
    { name: 'range', type: 'enum', required: false, enumValues: ['24h', '7d', '30d', '90d', 'custom'], defaultValue: '24h', description: 'Time range.' },
    { name: 'start', type: 'string', required: false, description: 'ISO 8601 for custom range.' },
    { name: 'end', type: 'string', required: false, description: 'ISO 8601 for custom range.' },
  ],
  responseSchema: [
    { name: 'total_scans', type: 'number', description: 'Total scans in period.' },
    { name: 'unique_scans', type: 'number', description: 'Unique visitors in period.' },
    { name: 'by_device', type: 'array', description: 'Device breakdown.' },
    { name: 'by_country', type: 'array', description: 'Country breakdown.' },
    { name: 'time_series', type: 'array', description: 'Historical scan data.' },
  ],
  errorCodes: ['401', '403', '404'],
}

export const BULK_CREATE: EndpointSpec = {
  id: 'bulk-create',
  method: 'POST',
  path: '/bulk',
  title: 'Create bulk job',
  requiredScope: 'qr:write',
  description: 'Starts a background job to create multiple QR codes at once. Returns a job ID to poll for status.',
  bodyParams: [
    { name: 'rows', type: 'array', required: true, description: 'Array of QR creation objects.' },
  ],
  responseSchema: [
    { name: 'job_id', type: 'uuid', description: 'Background job UUID.' },
    { name: 'status', type: 'string', description: 'Current job status.' },
  ],
  errorCodes: ['400', '401', '403', '429'],
}

export const BULK_STATUS: EndpointSpec = {
  id: 'bulk-status',
  method: 'GET',
  path: '/bulk/{id}',
  title: 'Get bulk job status',
  requiredScope: 'qr:read',
  description: 'Returns the current status of a bulk job. If done, provides a ZIP download URL for the generated images.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'Job UUID.' }],
  responseSchema: [
    { name: 'job_id', type: 'uuid', description: 'Job UUID.' },
    { name: 'status', type: 'string', description: 'Status (pending, processing, done, failed).' },
    { name: 'progress_pct', type: 'number', description: 'Percentage complete.' },
    { name: 'zip_url', type: 'string', nullable: true, description: 'Download URL (if done).' },
    { name: 'error', type: 'string', nullable: true, description: 'Error message (if failed).' },
  ],
  errorCodes: ['401', '403', '404'],
}

export const ALL_ENDPOINTS = [
  ME, USAGE, USAGE_HISTORY, USAGE_EXPORT, USAGE_ALERTS,
  LIST_QR, CREATE_QR, GET_QR, UPDATE_QR, DELETE_QR, EXPORT_QR, QR_HISTORY,
  SMART_ROUTING_GET, SMART_ROUTING_UPDATE, ANALYTICS,
  BULK_CREATE, BULK_STATUS,
  TYPES_LIST, TYPE_CREATE, TYPE_GET, TYPE_UPDATE, TYPE_DELETE,
  RESOLVER_CONFIG, RESOLVER_UPDATE, RESOLVER_DELETE, RESOLVER_TEST, RESOLVER_ROTATE_SECRET,
  TEMPLATES_LIST, TEMPLATE_CREATE, MARKETPLACE_SUBMIT,
  WEBHOOKS_LIST, WEBHOOK_CREATE, WEBHOOK_GET, WEBHOOK_UPDATE, WEBHOOK_DELETE, WEBHOOK_TEST, WEBHOOK_ROTATE_SECRET, WEBHOOK_DELIVERIES_LIST, WEBHOOK_DELIVERY_REPLAY,
  MARKETPLACE_TYPES
]
