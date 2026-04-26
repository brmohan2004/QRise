import { Redis } from '@upstash/redis'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

async function clearCache() {
  console.log('Clearing analytics cache...')
  
  const keys = await redis.keys('admin_analytics:*')
  if (keys.length === 0) {
    console.log('No analytics cache keys found.')
    return
  }

  console.log(`Found ${keys.length} cache keys. Deleting...`)
  for (const key of keys) {
    await redis.del(key)
    console.log(`Deleted ${key}`)
  }
  
  console.log('Analytics cache cleared successfully.')
}

clearCache()
