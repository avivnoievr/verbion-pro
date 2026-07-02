import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { OPENROUTER_BASE_URL, openRouterHeaders } from './openrouter-client.js'

const MODEL = 'kwaivgi/kling-v3.0-pro'
const POLL_INTERVAL_MS = 10_000
const POLL_TIMEOUT_MS = 10 * 60 * 1000

function fileToDataUrl(path) {
  const buf = readFileSync(path)
  return `data:image/png;base64,${buf.toString('base64')}`
}

async function pollUntilDone(jobId, initialStatus) {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  let status = initialStatus
  while (status.status !== 'completed') {
    if (['failed', 'cancelled', 'expired'].includes(status.status)) {
      throw new Error(`Kling job ${status.status}: ${JSON.stringify(status.error ?? status)}`)
    }
    if (Date.now() > deadline) {
      throw new Error(`Kling job timed out after ${POLL_TIMEOUT_MS / 1000}s (job: ${jobId})`)
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
    const res = await fetch(`${OPENROUTER_BASE_URL}/videos/${jobId}`, { headers: openRouterHeaders() })
    if (!res.ok) throw new Error(`Kling poll failed: ${res.status} ${await res.text()}`)
    status = await res.json()
    console.log(`  ...Kling job ${jobId}: ${status.status}`)
  }
  return status
}

/**
 * Feeds a scene's start/end frame pair into Kling v3.0 Pro (through
 * OpenRouter), using first-frame/last-frame control to generate the
 * in-between motion as a short clip. Polls until the job completes, then
 * downloads the resulting video to `outPath`.
 */
export async function generateSceneClip(scene, { startFramePath, endFramePath, duration, outPath }) {
  if (!scene.motionPrompt) {
    throw new Error(`Scene "${scene.id}" has no motionPrompt configured yet`)
  }

  const submitRes = await fetch(`${OPENROUTER_BASE_URL}/videos`, {
    method: 'POST',
    headers: openRouterHeaders(),
    body: JSON.stringify({
      model: MODEL,
      prompt: scene.motionPrompt,
      aspect_ratio: '16:9',
      resolution: '720p',
      duration,
      generate_audio: false,
      frame_images: [
        { type: 'image_url', frame_type: 'first_frame', image_url: { url: fileToDataUrl(startFramePath) } },
        { type: 'image_url', frame_type: 'last_frame', image_url: { url: fileToDataUrl(endFramePath) } },
      ],
    }),
  })

  if (!submitRes.ok) {
    throw new Error(`Kling submission failed: ${submitRes.status} ${await submitRes.text()}`)
  }

  const job = await submitRes.json()
  console.log(`Kling job submitted: ${job.id} (status: ${job.status})`)

  const finalStatus = await pollUntilDone(job.id, job)

  const videoUrl = finalStatus.unsigned_urls?.[0]
  if (!videoUrl) {
    throw new Error(`Kling job completed but returned no video URL: ${JSON.stringify(finalStatus)}`)
  }

  // Despite the name, unsigned_urls points back at OpenRouter's own
  // /videos/{id}/content endpoint and still requires the bearer token.
  const videoRes = await fetch(videoUrl, { headers: openRouterHeaders() })
  if (!videoRes.ok) throw new Error(`Failed to download Kling video: ${videoRes.status}`)
  const videoBuf = Buffer.from(await videoRes.arrayBuffer())

  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, videoBuf)

  return { path: outPath, cost: finalStatus.usage?.cost ?? null }
}
