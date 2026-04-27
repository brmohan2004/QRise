import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEFAULT_FLAGS = [
  {
    key: 'pricing_page_enabled',
    name: 'Pricing Page',
    description: 'Show pricing page. When off: shows "Pricing will roll out soon" card.',
    is_enabled: true,
  },
  {
    key: 'api_docs_enabled',
    name: 'API Documentation',
    description: 'Show API docs. When off: shows "We are working on this" card.',
    is_enabled: true,
  },
  {
    key: 'bulk_qr_generator',
    name: 'Bulk QR Generator',
    description: 'Upload CSV to generate QRs in batch',
    is_enabled: true,
    enabled_for_plans: ['business', 'enterprise'],
  },
  {
    key: 'api_access',
    name: 'API Access',
    description: 'REST API + webhooks (all features accessible via API)',
    is_enabled: true,
    enabled_for_plans: ['pro', 'business', 'enterprise'],
  },
  {
    key: 'design_studio',
    name: 'Design Studio',
    description: 'Custom QR styling: colors, dots, logo, frame, eye',
    is_enabled: true,
    enabled_for_plans: ['pro', 'business', 'enterprise'],
  },
  {
    key: 'smart_routing',
    name: 'Smart Routing QR',
    description: 'Route scans by device/location/time',
    is_enabled: true,
    enabled_for_plans: ['pro', 'business', 'enterprise'],
  },
  {
    key: 'password_qr',
    name: 'Password Protected QR',
    description: 'Password-protect QR destinations',
    is_enabled: true,
    enabled_for_plans: ['free', 'pro', 'business', 'enterprise'],
  },
  {
    key: 'multi_action_qr',
    name: 'Multi-Action QR',
    description: 'Multiple destinations per QR with action menu',
    is_enabled: true,
    enabled_for_plans: ['pro', 'business', 'enterprise'],
  },
  {
    key: 'analytics_export',
    name: 'Analytics Export',
    description: 'Download scan data as CSV',
    is_enabled: true,
    enabled_for_plans: ['business', 'enterprise'],
  },
  {
    key: 'static_qr',
    name: 'Static QR Codes',
    description: 'Allow generation of static QR codes (non-trackable)',
    is_enabled: true,
  },
  {
    key: 'dynamic_qr',
    name: 'Dynamic QR Codes',
    description: 'Allow generation of dynamic QR codes (trackable)',
    is_enabled: true,
  },
  {
    key: 'analytics_enabled',
    name: 'Analytics Dashboard',
    description: 'Show scan analytics and statistics',
    is_enabled: true,
  },
]

async function seedFeatureFlags() {
  console.log('Seeding feature flags...')

  for (const flag of DEFAULT_FLAGS) {
    const { error } = await supabase
      .from('feature_flags')
      .upsert(flag, { onConflict: 'key' })

    if (error) {
      console.error(`Error seeding flag ${flag.key}:`, error.message)
    } else {
      console.log(`Successfully seeded/updated flag: ${flag.key}`)
    }
  }

  console.log('Seeding complete!')
}

seedFeatureFlags()
