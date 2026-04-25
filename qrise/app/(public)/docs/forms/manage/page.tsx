import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { ParamTable } from "@/components/docs/param-table"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { ExampleRequest } from "@/components/docs/example-request"
import type { HTTPMethod } from "@/lib/docs/types"

const FORMS_LIST = {
  id: 'list-forms',
  method: 'GET' as HTTPMethod,
  path: '/forms',
  title: 'List forms',
  requiredScope: 'form:read',
  description: 'Returns a paginated list of your forms, newest first.',
  queryParams: [
    { name: 'page', type: 'number', required: false, description: 'Page number (1-based).', defaultValue: '1' },
    { name: 'limit', type: 'number', required: false, description: 'Results per page. Max 100.', defaultValue: '20' },
  ],
  exampleResponse: {
    items: [
      { id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890', name: 'Customer feedback', fields: 4, is_active: true, created_at: '2025-06-01T10:30:00Z' },
    ],
    total: 1,
    page: 1,
    total_pages: 1,
    has_next: false,
  },
  errorCodes: ['401', '403'],
}

const FORMS_GET = {
  id: 'get-form',
  method: 'GET' as HTTPMethod,
  path: '/forms/{id}',
  requiredScope: 'form:read',
  title: 'Get a form',
  description: 'Returns a single form by its UUID.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of the form.' }],
  exampleResponse: {
    id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
    name: 'Customer feedback',
    fields: [
      { type: 'text', label: 'Full name', key: 'full_name', required: true },
      { type: 'email', label: 'Email', key: 'email', required: true },
      { type: 'dropdown', label: 'How did you find us?', key: 'referral_source', options: ['Google', 'Social media', 'Friend'] },
      { type: 'textarea', label: 'Feedback', key: 'feedback' },
    ],
    submit_text: 'Send feedback',
    success_message: 'Thanks for your feedback!',
    is_active: true,
    created_at: '2025-06-01T10:30:00Z',
  },
  errorCodes: ['401', '403', '404'],
}

const FORMS_UPDATE = {
  id: 'update-form',
  method: 'PUT' as HTTPMethod,
  path: '/forms/{id}',
  requiredScope: 'form:write',
  title: 'Update a form',
  description: 'Updates an existing form. Only the fields provided are updated.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of the form.' }],
  bodyParams: [
    { name: 'name', type: 'string', required: false, description: 'Display name for this form.' },
    { name: 'is_active', type: 'boolean', required: false, description: 'Whether the form accepts submissions.' },
    { name: 'fields', type: 'array', required: false, description: 'Updated field definitions.' },
  ],
  exampleRequest: { name: 'Customer feedback v2', is_active: true },
  exampleResponse: { id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890', name: 'Customer feedback v2', updated_at: '2025-06-01T14:00:00Z' },
  errorCodes: ['400', '401', '403', '404', '422'],
}

const FORMS_DELETE = {
  id: 'delete-form',
  method: 'DELETE' as HTTPMethod,
  path: '/forms/{id}',
  requiredScope: 'form:write',
  title: 'Delete a form',
  description: 'Permanently deletes a form. This action cannot be undone.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of the form.' }],
  exampleResponse: { deleted: true, id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890' },
  errorCodes: ['401', '403', '404'],
}

const FORMS_GET_EXAMPLES = {
  js: `const formId = 'f1a2b3c4-d5e6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/forms/\${formId}\`, { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })
const form = await response.json()`,

  python: `import requests
form_id = 'f1a2b3c4-d5e6-7890-abcd-ef1234567890'
response = requests.get(f'https://api.qrise.io/forms/{form_id}', headers={'Authorization': 'Bearer YOUR_API_KEY'})
form = response.json()`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/forms/f1a2b3c4-d5e6-7890-abcd-ef1234567890`,
}

const FORMS_UPDATE_EXAMPLES = {
  js: `const formId = 'f1a2b3c4-d5e6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/forms/\${formId}\`, {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Customer feedback v2', is_active: true }) })
const form = await response.json()`,

  python: `import requests
form_id = 'f1a2b3c4-d5e6-7890-abcd-ef1234567890'
response = requests.put(f'https://api.qrise.io/forms/{form_id}',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'name': 'Customer feedback v2', 'is_active': True})
form = response.json()`,

  curl: `curl -X PUT https://api.qrise.io/forms/f1a2b3c4-d5e6-7890-abcd-ef1234567890 -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"name": "Customer feedback v2", "is_active": true}'`,
}

const FORMS_DELETE_EXAMPLES = {
  js: `const formId = 'f1a2b3c4-d5e6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/forms/\${formId}\`, { method: 'DELETE', headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })`,

  python: `import requests
form_id = 'f1a2b3c4-d5e6-7890-abcd-ef1234567890'
requests.delete(f'https://api.qrise.io/forms/{form_id}', headers={'Authorization': 'Bearer YOUR_API_KEY'})`,

  curl: `curl -X DELETE https://api.qrise.io/forms/f1a2b3c4-d5e6-7890-abcd-ef1234567890 -H "Authorization: Bearer YOUR_API_KEY"`,
}

const SUBMISSIONS_GET = {
  id: 'get-form-submissions',
  method: 'GET' as HTTPMethod,
  path: '/forms/{id}/submissions',
  requiredScope: 'form:read',
  title: 'Get form submissions',
  description: 'Returns submissions for a form. Results are sorted by submission time, newest first.',
  pathParams: [{ name: 'id', type: 'uuid', required: true, description: 'UUID of the form.' }],
  queryParams: [
    { name: 'page', type: 'number', required: false, description: 'Page number (1-based).', defaultValue: '1' },
    { name: 'limit', type: 'number', required: false, description: 'Results per page. Max 100.', defaultValue: '20' },
  ],
  exampleResponse: {
    items: [
      { id: 's1a2b3c4-d5e6-7890-abcd-ef1234567890', submitted_at: '2025-06-01T12:00:00Z', data: { full_name: 'John Doe', email: 'john@example.com', feedback: 'Great service!' } },
    ],
    total: 1,
    page: 1,
    total_pages: 1,
  },
  errorCodes: ['401', '403', '404'],
}

const SUBMISSIONS_GET_EXAMPLES = {
  js: `const formId = 'f1a2b3c4-d5e6-7890-abcd-ef1234567890'
const response = await fetch(\`https://api.qrise.io/forms/\${formId}/submissions\`, { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })
const data = await response.json()`,

  python: `import requests
form_id = 'f1a2b3c4-d5e6-7890-abcd-ef1234567890'
response = requests.get(f'https://api.qrise.io/forms/{form_id}/submissions', headers={'Authorization': 'Bearer YOUR_API_KEY'})
data = response.json()`,

  curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.qrise.io/forms/f1a2b3c4-d5e6-7890-abcd-ef1234567890/submissions`,
}

export default function FormsManagePage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Forms", href: "/docs/forms" }, { label: "Manage forms" }]} />

      <h1 id="manage-forms" className="text-3xl font-bold text-gray-900 mb-4">
        Manage Forms
      </h1>

      <h2 id="list-forms" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        List forms — GET /forms
      </h2>

      <EndpointHeader
        method={FORMS_LIST.method}
        path={FORMS_LIST.path}
        title={FORMS_LIST.title}
        description={FORMS_LIST.description}
        requiredScope={FORMS_LIST.requiredScope}
      />

      <AuthBadge scope={FORMS_LIST.requiredScope!} />

      <ParamTable title="Query parameters" params={FORMS_LIST.queryParams} />
      <ExampleResponse data={FORMS_LIST.exampleResponse} />

      <h2 id="get-form" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Get a form — GET /forms/:id
      </h2>

      <EndpointHeader
        method={FORMS_GET.method}
        path={FORMS_GET.path}
        title={FORMS_GET.title}
        description={FORMS_GET.description}
        requiredScope={FORMS_GET.requiredScope}
      />

      <AuthBadge scope={FORMS_GET.requiredScope!} />

      <ParamTable title="Path parameters" params={FORMS_GET.pathParams!} />

      <CodeTabs examples={FORMS_GET_EXAMPLES} />
      <ExampleResponse data={FORMS_GET.exampleResponse} />

      <h2 id="update-form" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Update a form — PUT /forms/:id
      </h2>

      <EndpointHeader
        method={FORMS_UPDATE.method}
        path={FORMS_UPDATE.path}
        title={FORMS_UPDATE.title}
        description={FORMS_UPDATE.description}
        requiredScope={FORMS_UPDATE.requiredScope}
      />

      <AuthBadge scope={FORMS_UPDATE.requiredScope!} />

      <ParamTable title="Path parameters" params={FORMS_UPDATE.pathParams!} />
      <ParamTable title="Body parameters" params={FORMS_UPDATE.bodyParams!} />

      <CodeTabs examples={FORMS_UPDATE_EXAMPLES} />
      <ExampleRequest data={FORMS_UPDATE.exampleRequest} />
      <ExampleResponse data={FORMS_UPDATE.exampleResponse} />

      <h2 id="delete-form" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Delete a form — DELETE /forms/:id
      </h2>

      <EndpointHeader
        method={FORMS_DELETE.method}
        path={FORMS_DELETE.path}
        title={FORMS_DELETE.title}
        description={FORMS_DELETE.description}
        requiredScope={FORMS_DELETE.requiredScope}
      />

      <AuthBadge scope={FORMS_DELETE.requiredScope!} />

      <ParamTable title="Path parameters" params={FORMS_DELETE.pathParams!} />

      <CodeTabs examples={FORMS_DELETE_EXAMPLES} />
      <ExampleResponse data={FORMS_DELETE.exampleResponse} />

      <h2 id="get-submissions" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Get form submissions — GET /forms/:id/submissions
      </h2>

      <EndpointHeader
        method={SUBMISSIONS_GET.method}
        path={SUBMISSIONS_GET.path}
        title={SUBMISSIONS_GET.title}
        description={SUBMISSIONS_GET.description}
        requiredScope={SUBMISSIONS_GET.requiredScope}
      />

      <AuthBadge scope={SUBMISSIONS_GET.requiredScope!} />

      <ParamTable title="Path parameters" params={SUBMISSIONS_GET.pathParams!} />
      <ParamTable title="Query parameters" params={SUBMISSIONS_GET.queryParams} />

      <CodeTabs examples={SUBMISSIONS_GET_EXAMPLES} />
      <ExampleResponse data={SUBMISSIONS_GET.exampleResponse} />
    </>
  )
}