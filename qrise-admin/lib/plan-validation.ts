export type PlanFeatureKey = 
  | 'has_analytics'
  | 'has_api_access'
  | 'has_bulk_generator'
  | 'has_design_studio'
  | 'has_smart_routing'
  | 'has_password_qr'
  | 'has_multi_action_qr'
  | 'has_analytics_export'
  | 'has_form_builder'

export interface Plan {
  id: string
  name: string
  description: string | null
  price_monthly: number
  price_annual: number
  is_publicly_visible: boolean
  sort_order: number
  
  // Feature Flags
  has_analytics: boolean
  has_api_access: boolean
  has_bulk_generator: boolean
  has_design_studio: boolean
  has_smart_routing: boolean
  has_password_qr: boolean
  has_multi_action_qr: boolean
  has_analytics_export: boolean
  has_form_builder: boolean

  // Design Studio Sub-Features
  design_studio_color_limit: number | null
  design_studio_dot_pattern_limit: number | null
  design_studio_logo_limit: number | null
  design_studio_frame_limit: number | null
  design_studio_eye_shape_limit: number | null
  design_studio_eye_color_limit: number | null
  design_studio_frame_color_limit: number | null
  design_studio_style_limit: number | null

  // Smart Routing Constraints
  smart_routing_rule_limit: number | null
  smart_routing_geotargeting: boolean
  smart_routing_devicetargeting: boolean
  smart_routing_timetargeting: boolean

  // Limits
  qr_limit: number
  dynamic_qr_limit: number | null
  static_qr_limit: number | null
  smart_qr_limit: number | null
  monthly_scan_limit: number
  smart_qr_scan_limit: number | null
  
  // Feature Specific
  api_key_limit: number
  api_call_limit: number | null
  webhook_limit: number
  custom_domain_api: boolean
  
  password_qr_limit: number | null
  multi_action_qr_limit: number | null
  action_limit: number | null
  bulk_qr_limit: number | null
  bulk_qr_row_limit: number | null
  
  form_builder_limit: number | null
  form_field_limit: number | null
  form_file_upload_limit: number | null
  form_submission_limit: number | null
  
  csv_export_limit: number | null
  analytics_export_days: number
}

export type LimitKey = 
  | 'qr_limit' 
  | 'dynamic_qr_limit' 
  | 'static_qr_limit' 
  | 'monthly_scan_limit'
  | 'api_key_limit'
  | 'bulk_qr_limit'
  | 'form_builder_limit'

export function validateFeatureAccess(
  userPlan: Plan,
  feature: PlanFeatureKey
): { allowed: boolean; reason?: string; upgradeUrl?: string } {
  if (!userPlan[feature]) {
    return { 
      allowed: false, 
      reason: `Your current plan (${userPlan.name}) doesn't include access to this feature.`,
      upgradeUrl: process.env.NEXT_PUBLIC_MAIN_APP_URL ? `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/pricing` : 'https://qrise.app/pricing'
    }
  }

  return { allowed: true }
}

export function validateLimit(
  userPlan: Plan,
  limitKey: LimitKey,
  currentUsage: number
): { allowed: boolean; reason?: string; upgradeUrl?: string } {
  const limit = userPlan[limitKey]
  
  if (limit === null) return { allowed: true } // null often means "use default" or "not applicable"
  if (limit === -1) return { allowed: true } // -1 is unlimited

  if (currentUsage >= limit) {
    return {
      allowed: false,
      reason: `You've reached your ${limitKey.replace('_', ' ')} of ${limit}.`,
      upgradeUrl: process.env.NEXT_PUBLIC_MAIN_APP_URL ? `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/pricing` : 'https://qrise.app/pricing'
    }
  }

  return { allowed: true }
}
