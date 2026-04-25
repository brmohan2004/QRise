import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const plans = [
  {
    name: 'Free',
    slug: 'free',
    price_monthly: 0,
    price_yearly: 0,
    max_qr_codes: 5,
    max_scans_per_month: 100,
    features: {
       design_studio: false,
       analytics: 'basic',
       bulk_generation: false,
       smart_routing: false,
       password_protection: false,
       domain_customization: false,
       white_label: false,
       api_access: false,
       support: 'community'
    },
    is_active: true
  },
  {
    name: 'Pro',
    slug: 'pro',
    price_monthly: 19,
    price_yearly: 190,
    max_qr_codes: 50,
    max_scans_per_month: 5000,
    features: {
       design_studio: true,
       analytics: 'advanced',
       bulk_generation: false,
       smart_routing: true,
       password_protection: true,
       domain_customization: true,
       white_label: false,
       api_access: false,
       support: 'email'
    },
    is_active: true
  },
  {
    name: 'Business',
    slug: 'business',
    price_monthly: 49,
    price_yearly: 490,
    max_qr_codes: 500,
    max_scans_per_month: 50000,
    features: {
       design_studio: true,
       analytics: 'full',
       bulk_generation: true,
       smart_routing: true,
       password_protection: true,
       domain_customization: true,
       white_label: true,
       api_access: true,
       support: 'priority'
    },
    is_active: true
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    price_monthly: 199,
    price_yearly: 1990,
    max_qr_codes: 9999,
    max_scans_per_month: 1000000,
    features: {
       design_studio: true,
       analytics: 'custom',
       bulk_generation: true,
       smart_routing: true,
       password_protection: true,
       domain_customization: true,
       white_label: true,
       api_access: true,
       support: 'dedicated'
    },
    is_active: true
  }
]

async function seedPlans() {
  console.log('Seeding default plans (Free, Pro, Business, Enterprise)...')

  for (const plan of plans) {
    const { error } = await supabase
      .from('plans')
      .upsert(plan, { onConflict: 'slug' })

    if (error) {
      console.error(`Error seeding ${plan.slug}:`, error.message)
    } else {
      console.log(`[SEED] ${plan.name} plan seeded.`)
    }
  }

  console.log('Plans seeding complete.')
}

seedPlans()
