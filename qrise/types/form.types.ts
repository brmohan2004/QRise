export type FieldType = 
  | 'text' 
  | 'email' 
  | 'phone' 
  | 'textarea' 
  | 'dropdown' 
  | 'checkbox' 
  | 'date' 
  | 'file' 
  | 'signature';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  helperText?: string;
  options?: string[]; // For dropdown/checkbox
  config?: {
    minChars?: number;
    maxChars?: number;
    acceptedFileTypes?: string[];
    maxFileSize?: number;
    minDate?: string;
    maxDate?: string;
    domainAllowlist?: string[];
  };
}

export interface FormSchema {
  id: string;
  name: string;
  slug: string;
  fields: FormField[];
  successMessage?: string;
  isActive: boolean;
  qrCodeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  metadata: {
    ip?: string;
    userAgent?: string;
    scannedAt?: Date;
    country?: string;
  };
  createdAt: Date;
}
