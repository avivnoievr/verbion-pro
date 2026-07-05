/**
 * Converts wave.png (black-on-white) → wave-transparent.png (alpha channel).
 * White background → transparent. Dark wave stroke → warm dark with full alpha.
 */
const sharp = require('C:/cloudeweb/verbion-v1/node_modules/sharp')

async function run() {
  const input  = 'C:/cloudeweb/verbion-v2/public/images/wave.png'
  const output = 'C:/cloudeweb/verbion-v2/public/images/wave-transparent.png'

  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const buf = Buffer.from(data)

  for (let i = 0; i < buf.length; i += 4) {
    const r = buf[i], g = buf[i + 1], b = buf[i + 2]
    const brightness = (r + g + b) / 3

    if (brightness > 160) {
      buf[i + 3] = 0   // fully transparent (white background)
    } else {
      // Wave stroke: warm near-black, alpha proportional to darkness
      const alpha = Math.min(255, Math.round((160 - brightness) * 2.0))
      buf[i]     = 25
      buf[i + 1] = 12
      buf[i + 2] = 4
      buf[i + 3] = alpha
    }
  }

  await sharp(buf, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toFile(output)

  console.log('wave-transparent.png created →', output)
}

run().catch(err => { console.error(err); process.exit(1) })
