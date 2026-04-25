import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const flags = [
  { key: 'maintenance_mode', name: 'Maintenance Mode', description: 'Disable all public site access for maintenance' },
  { key: 'user_registration', name: 'User Registration', description: 'Allow new users to sign up' },
  { key: 'qr_design_v2', name: 'QR Design Studio V2', description: 'Enable the new advanced design studio' },
  { key: 'smart_routing', name: 'Smart Routing', description: 'Enable geolocation and device based routing' },
  { key: 'bulk_generation', name: 'Bulk QR Generation', description: 'Enable bulk CSV upload and processing' },
  { key: 'analytics_realtime', name: 'Real-time Analytics', description: 'Show live scan events on dashboard' },
  { key: 'coupon_system', name: 'Coupon Codes', description: 'Allow users to apply discount codes' },
  { key: 'competitions', name: 'Competitions & Hackathons', description: 'Enable the competitions module' },
  { key: 'api_access', name: 'Public API Access', description: 'Allow users to generate API keys' },
  { key: 'ai_qr_generation', name: 'AI Enhanced QR', description: 'Enable AI-powered artistic QR generation' },
  { key: 'dark_mode_default', name: 'Default Dark Mode', description: 'Force dark mode for all new users' },
  { key: 'beta_features', name: 'Beta Program', description: 'Enable experimental features for beta testers' },
]

async function seedFlags() {
  console.log('Seeding 12 default feature flags...')

  for (const flag of flags) {
    const { error } = await supabase
      .from('feature_flags')
      .upsert({ ...flag, is_enabled: false }, { onConflict: 'key' })

    if (error) {
      console.error(`Error seeding ${flag.key}:`, error.message)
    } else {
      console.log(`[SEED] ${flag.key} seeded.`)
    }
  }

  console.log('Feature flags seeding complete.')
}

seedFlags()
