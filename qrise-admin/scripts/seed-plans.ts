/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const plans = [
  {
    name: 'Free',
    description: 'Basic QR generation for personal use.',
    price_monthly: 0,
    price_annual: 0,
    is_publicly_visible: true,
    sort_order: 0,
    has_analytics: false,
    has_api_access: false,
    has_bulk_generator: false,
    has_design_studio: false,
    has_smart_routing: false,
    has_password_qr: false,
    has_multi_action_qr: false,
    has_analytics_export: false,
    has_form_builder: false,
    qr_limit: 5,
    monthly_scan_limit: 100,
    api_key_limit: 0,
    webhook_limit: 0
  },
  {
    name: 'Pro',
    description: 'Advanced features for creators and small businesses.',
    price_monthly: 19,
    price_annual: 190,
    is_publicly_visible: true,
    sort_order: 1,
    has_analytics: true,
    has_api_access: false,
    has_bulk_generator: false,
    has_design_studio: true,
    has_smart_routing: true,
    has_password_qr: true,
    has_multi_action_qr: false,
    has_analytics_export: false,
    has_form_builder: false,
    qr_limit: 50,
    monthly_scan_limit: 5000,
    api_key_limit: 0,
    webhook_limit: 0
  },
  {
    name: 'Business',
    description: 'Full suite for teams and marketing agencies.',
    price_monthly: 49,
    price_annual: 490,
    is_publicly_visible: true,
    sort_order: 2,
    has_analytics: true,
    has_api_access: true,
    has_bulk_generator: true,
    has_design_studio: true,
    has_smart_routing: true,
    has_password_qr: true,
    has_multi_action_qr: true,
    has_analytics_export: true,
    has_form_builder: false,
    qr_limit: 500,
    monthly_scan_limit: 50000,
    api_key_limit: 5,
    webhook_limit: 3
  },
  {
    name: 'Enterprise',
    description: 'Custom limits and dedicated support for large organizations.',
    price_monthly: 199,
    price_annual: 1990,
    is_publicly_visible: true,
    sort_order: 3,
    has_analytics: true,
    has_api_access: true,
    has_bulk_generator: true,
    has_design_studio: true,
    has_smart_routing: true,
    has_password_qr: true,
    has_multi_action_qr: true,
    has_analytics_export: true,
    has_form_builder: true,
    qr_limit: -1,
    monthly_scan_limit: -1,
    api_key_limit: 100,
    webhook_limit: 50
  }
]

async function seedPlans() {
  console.log('Seeding default plans (Free, Pro, Business, Enterprise)...')

  for (const plan of plans) {
    const { error } = await supabase
      .from('plans')
      .upsert(plan, { onConflict: 'name' })

    if (error) {
      console.error(`Error seeding ${plan.name}:`, error.message)
    } else {
      console.log(`[SEED] ${plan.name} plan seeded.`)
    }
  }

  console.log('Plans seeding complete.')
}

seedPlans()
