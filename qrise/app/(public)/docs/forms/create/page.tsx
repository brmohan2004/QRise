import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ExampleRequest } from "@/components/docs/example-request"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { EndpointSpec } from "@/lib/docs/types"

const FORM_CREATE: EndpointSpec = {
  id: 'create-form',
  method: 'POST',
  path: '/forms',
  title: 'Create a form',
  requiredScope: 'form:write',
  description: 'Creates a new form with customizable fields. Forms can be embedded in QR codes or used standalone.',
  bodyParams: [
    { name: 'name', type: 'string', required: true, description: 'Display name for this form. Max 200 chars.', example: '"Customer feedback"' },
    { name: 'fields', type: 'array', required: true, description: 'Array of field definitions.', children: [
      { name: '[].type', type: 'enum', required: true, description: 'Field type.', enumValues: ['text','email','phone','textarea','dropdown','checkbox','radio','date'], example: '"text"' },
      { name: '[].label', type: 'string', required: true, description: 'Field label.', example: '"Full name"' },
      { name: '[].key', type: 'string', required: true, description: 'Unique key for this field.', example: '"full_name"' },
      { name: '[].required', type: 'boolean', required: false, description: 'Whether this field is required. Default: false.', defaultValue: 'false' },
      { name: '[].placeholder', type: 'string', required: false, description: 'Placeholder text.', example: '"Enter your name"' },
      { name: '[].options', type: 'array', required: false, description: 'Options for dropdown/radio/checkbox types.', example: '["Option A", "Option B"]' },
    ]},
    { name: 'submit_text', type: 'string', required: false, description: 'Submit button text. Default: "Submit".', defaultValue: '"Submit"', example: '"Send feedback"' },
    { name: 'success_message', type: 'string', required: false, description: 'Message shown after successful submission.', defaultValue: '"Thank you for your response!"', example: '"Thanks for your feedback!"' },
  ],
  exampleRequest: {
    name: 'Customer feedback',
    fields: [
      { type: 'text', label: 'Full name', key: 'full_name', required: true, placeholder: 'Enter your name' },
      { type: 'email', label: 'Email', key: 'email', required: true, placeholder: 'you@example.com' },
      { type: 'dropdown', label: 'How did you find us?', key: 'referral_source', required: false, options: ['Google', 'Social media', 'Friend', 'Other'] },
      { type: 'textarea', label: 'Your feedback', key: 'feedback', required: true, placeholder: 'Tell us what you think...' },
    ],
    submit_text: 'Send feedback',
    success_message: 'Thanks for your feedback!',
  },
  exampleResponse: { id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890', name: 'Customer feedback', fields: 4, is_active: true, created_at: '2025-06-01T10:30:00Z' },
  errorCodes: ['400', '401', '403', '422'],
  notes: ['The form:write scope is required.', 'Fields are validated on creation. Invalid field types or missing required properties will be rejected.'],
}

const FORM_CREATE_EXAMPLES = {
  js: `const response = await fetch('https://api.qrise.io/forms', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Customer feedback',
    fields: [
      { type: 'text', label: 'Full name', key: 'full_name', required: true },
      { type: 'email', label: 'Email', key: 'email', required: true },
      { type: 'textarea', label: 'Feedback', key: 'feedback', required: true }
    ]
  }) })
const form = await response.json()`,

  python: `import requests
response = requests.post('https://api.qrise.io/forms',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'name': 'Customer feedback',
        'fields': [
            {'type': 'text', 'label': 'Full name', 'key': 'full_name', 'required': True},
            {'type': 'email', 'label': 'Email', 'key': 'email', 'required': True},
            {'type': 'textarea', 'label': 'Feedback', 'key': 'feedback', 'required': True}
        ]
    })
form = response.json()`,

  curl: `curl -X POST https://api.qrise.io/forms -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"name": "Customer feedback", "fields": [{"type": "text", "label": "Full name", "key": "full_name", "required": true}, {"type": "email", "label": "Email", "key": "email", "required": true}]}'`,
}

export default function FormsCreatePage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Forms", href: "/docs/forms" }, { label: "Create form" }]} />

      <EndpointHeader
        method={FORM_CREATE.method}
        path={FORM_CREATE.path}
        title={FORM_CREATE.title}
        description={FORM_CREATE.description}
        requiredScope={FORM_CREATE.requiredScope}
      />

      <AuthBadge scope={FORM_CREATE.requiredScope!} />

      {FORM_CREATE.notes && FORM_CREATE.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Body parameters" params={FORM_CREATE.bodyParams} />

      <CodeTabs examples={FORM_CREATE_EXAMPLES} />

      <ExampleRequest data={FORM_CREATE.exampleRequest} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ExampleResponse data={FORM_CREATE.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {FORM_CREATE.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={FORM_CREATE} />
    </>
  )
}