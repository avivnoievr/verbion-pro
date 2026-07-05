import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { OPENROUTER_BASE_URL, openRouterHeaders } from './openrouter-client.js'

const REFERENCE_IMAGE_PATH = fileURLToPath(
  new URL('../assets/reference/bottle-reference.png', import.meta.url),
)
const MODEL = 'google/gemini-2.5-flash-image'

function imageDataUrl(path) {
  const buf = readFileSync(path)
  return `data:image/png;base64,${buf.toString('base64')}`
}

/**
 * Generates one image from `prompt`, conditioned on the image at
 * `referenceImagePath` (defaults to the master bottle reference photo).
 * Chained scenes pass the previous scene's extracted last frame instead, so
 * the bottle is reproduced from an actual rendered frame rather than
 * reinterpreted from the static product photo each time.
 */
export async function generateFrame(prompt, outPath, { referenceImagePath = REFERENCE_IMAGE_PATH } = {}) {
  const content = referenceImagePath
    ? [{ type: 'image_url', image_url: { url: imageDataUrl(referenceImagePath) } }, { type: 'text', text: prompt }]
    : [{ type: 'text', text: prompt }]

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: openRouterHeaders(),
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content }],
      modalities: ['image', 'text'],
      image_config: { aspect_ratio: '16:9' },
      usage: { include: true },
    }),
  })

  if (!res.ok) {
    throw new Error(`Gemini frame generation failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  const image = data.choices?.[0]?.message?.images?.[0]?.image_url?.url
  if (!image) {
    throw new Error(`Gemini response had no image: ${JSON.stringify(data)}`)
  }

  const base64 = image.replace(/^data:image\/\w+;base64,/, '')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, Buffer.from(base64, 'base64'))

  return { path: outPath, cost: data.usage?.cost ?? null }
}

/**
 * Generates a start-frame and end-frame image for `scene` via Gemini 2.5
 * Flash Image (through OpenRouter), conditioned on the VERBION bottle
 * reference image so the bottle's design stays consistent.
 */
export async function generateSceneFrames(scene, { outDir }) {
  if (!scene.startPrompt || !scene.endPrompt) {
    throw new Error(`Scene "${scene.id}" has no startPrompt/endPrompt configured yet`)
  }

  const startFrame = await generateFrame(scene.startPrompt, `${outDir}/${scene.id}-start.png`)
  const endFrame = await generateFrame(scene.endPrompt, `${outDir}/${scene.id}-end.png`)

  return {
    startFramePath: startFrame.path,
    endFramePath: endFrame.path,
    cost: (startFrame.cost ?? 0) + (endFrame.cost ?? 0),
  }
}
