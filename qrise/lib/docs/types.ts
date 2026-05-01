export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ParamSchema {
  name: string
  type: string            // 'string' | 'number' | 'boolean' | 'array' | 'object' | 'uuid' | 'enum'
  required: boolean
  description?: string
  enumValues?: string[]
  defaultValue?: string
  example?: string
  children?: ParamSchema[]  // for nested array/object params
}

export interface EndpointSpec {
  id: string              // 'create-qr', 'list-qr', etc.
  method: HTTPMethod
  path: string            // '/qr', '/qr/{id}', etc.
  title: string
  description: string
  requiredScope: string | null   // null = no auth, 'qr:read' | 'qr:write' | etc.
  pathParams?: ParamSchema[]
  queryParams?: ParamSchema[]
  bodyParams?: ParamSchema[]
  responseSchema?: ResponseField[]
  exampleRequest?: Record<string, unknown>
  exampleResponse?: Record<string, unknown>
  errorCodes: string[]    // e.g. ['400', '401', '403', '404']
  notes?: string[]        // extra callout notes
  billableUnit?: string
}

export interface ResponseField {
  name: string
  type: string
  description?: string
  nullable?: boolean
  children?: ResponseField[]  // for nested objects
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export interface NavItem {
  label: string
  href: string
  method?: HTTPMethod
  badge?: string
}