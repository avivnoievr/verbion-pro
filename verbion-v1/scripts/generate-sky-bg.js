import { generateFrame } from './gemini-generate.js'

const prompt =
  'A photorealistic deep blue sky background for a premium tech product website hero section. Soft, voluminous white clouds along the lower edges, fading into a darker navy-blue gradient toward the top and corners, with a soft glow of light coming from the upper-left. Clean, atmospheric, no objects, no text, no people, no logos. 16:9, ultra-detailed, suitable as a full-bleed background image.'

const result = await generateFrame(prompt, 'public/images/sky-bg.png', { referenceImagePath: null })
console.log(`Saved: ${result.path}`)
console.log(`Cost: ${result.cost === null ? 'unknown' : `$${result.cost.toFixed(4)}`}`)
