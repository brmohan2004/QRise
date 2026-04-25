import { Breadcrumb } from "@/components/docs/breadcrumb"
import { CodeTabs } from "@/components/docs/code-tabs"

const HANDLE_RATE_LIMIT_EXAMPLES = {
  js: `// Handle rate limiting with exponential backoff
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url, options)
    if (res.status !== 429) return res
    
    const delay = Math.pow(2, i) * 1000 // 1s, 2s, 4s
    await new Promise(r => setTimeout(r, delay))
  }
  throw new Error('Rate limited')`,

  python: `# Handle rate limiting with exponential backoff
import time

def fetch_with_retry(url, max_retries=3):
    for i in range(max_retries):
        res = requests.get(url)
        if res.status_code != 429:
            return res
        
        delay = 2 ** i  # 1, 2, 4 seconds
        time.sleep(delay)
    raise Exception('Rate limited')`,

  curl: `# Rate limited responses include Retry-After header
# curl -i shows all headers
# Look for: Retry-After: 60`,
}

export default function RateLimitsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Rate limits" }]} />

      <h1 id="rate-limits" className="text-3xl font-bold text-gray-900 mb-4">
        Rate Limits
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        API requests are rate limited to ensure fair usage.
      </p>

      <h2 id="limits" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Plan limits
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium">Plan</th>
              <th className="text-left py-2 font-medium">Requests/min</th>
              <th className="text-left py-2 font-medium">Bulk jobs/day</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            <tr className="border-b border-gray-100">
              <td className="py-2">Free</td>
              <td className="py-2">30</td>
              <td className="py-2">0</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">Pro</td>
              <td className="py-2">100</td>
              <td className="py-2">10</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">Business</td>
              <td className="py-2">500</td>
              <td className="py-2">100</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">Enterprise</td>
              <td className="py-2">Unlimited</td>
              <td className="py-2">Unlimited</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="headers" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Rate limit headers
      </h2>
      <p className="text-gray-600 mb-4">
        Every response includes headers to track your usage:
      </p>
      <ul className="list-disc pl-6 text-gray-600 space-y-1">
        <li><code>X-RateLimit-Limit</code>: Maximum requests per window</li>
        <li><code>X-RateLimit-Remaining</code>: Requests left</li>
        <li><code>X-RateLimit-Reset</code>: Unix timestamp when window resets</li>
      </ul>

      <h2 id="handling" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Handling rate limits
      </h2>
      <CodeTabs examples={HANDLE_RATE_LIMIT_EXAMPLES} />
    </>
  )
}
