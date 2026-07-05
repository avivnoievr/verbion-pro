export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export function openRouterHeaders() {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY is not set — see .env.example')
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}
