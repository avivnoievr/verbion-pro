const sharp = require('C:/cloudeweb/node_modules/sharp')
async function run() {
  const input  = 'C:/cloudeweb/verbion-v2/public/images/wave.png'
  const output = 'C:/cloudeweb/verbion-v2/public/images/wave-transparent.png'
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const buf = Buffer.from(data)
  for (let i = 0; i < buf.length; i += 4) {
    const brightness = (buf[i] + buf[i+1] + buf[i+2]) / 3
    if (brightness > 160) { buf[i+3] = 0 }
    else {
      const alpha = Math.min(255, Math.round((160 - brightness) * 2.0))
      buf[i] = 25; buf[i+1] = 12; buf[i+2] = 4; buf[i+3] = alpha
    }
  }
  await sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(output)
  console.log('Done:', output)
}
run().catch(e => { console.error(e); process.exit(1) })
