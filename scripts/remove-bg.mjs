import sharp from 'sharp'
import { readFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const ROOT  = path.resolve(__dir, '..')

const SRC = path.join(ROOT, 'assets', 'project image')
const OUT = path.join(ROOT, 'public', 'images')

const TARGET_W = 900
const TARGET_H = 1200

const IMAGES = [
  { src: '87fc561f-e6d7-4096-b96f-ef7d09376266.png',                          out: 'bottle-blue.png'  },
  { src: 'hf_20260701_175252_47a037c6-bfcc-4607-a396-67e351227f97.png',       out: 'bottle-red.png'   },
  { src: 'hf_20260701_175920_0fd2676b-7c32-4b34-8fbd-3f2132a3d9e2.png',       out: 'bottle-green.png' },
]

function eraseWhite(buf, w, h, ch) {
  const px = Buffer.from(buf)
  for (let i = 0; i < px.length; i += ch) {
    const r = px[i], g = px[i + 1], b = px[i + 2]
    const brightness = (r + g + b) / 3
    const saturation = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b))
    // Neutral near-white (low saturation, high brightness) → erase
    if (brightness >= 210 && saturation < 20) {
      // Soft fade: 0 alpha at pure white, full alpha at brightness 200
      const t = Math.max(0, (brightness - 200) / 55)   // 0→1 as brightness goes 200→255
      px[i + 3] = Math.round((1 - t) * px[i + 3])
    }
  }
  return px
}

async function process({ src, out }) {
  const inPath  = path.join(SRC, src)
  const outPath = path.join(OUT, out)

  const { data, info } = await sharp(inPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const cleaned = eraseWhite(data, info.width, info.height, info.channels)

  await sharp(cleaned, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 5 })
    .resize(TARGET_W, TARGET_H, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 8 })
    .toFile(outPath)

  console.log(`✓  ${out}`)
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

for (const img of IMAGES) {
  await process(img)
}
console.log('All done.')
