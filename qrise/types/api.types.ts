export interface APIResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface APIError {
  code: string;
  message: string;
}

export interface APIKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: Date;
  lastUsedAt?: Date;
  isActive: boolean;
}

export interface Webhook {
  id: string;
  endpointUrl: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
}