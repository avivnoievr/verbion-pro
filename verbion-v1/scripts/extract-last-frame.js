import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * Extracts the last frame of `videoPath` as a PNG at `outPath`, used to
 * chain scene clips together: the next scene's video starts from the exact
 * pixels the previous one ended on, instead of a frame reinterpreted from
 * scratch by the image model.
 */
export function extractLastFrame(videoPath, outPath) {
  mkdirSync(dirname(outPath), { recursive: true })
  execFileSync('ffmpeg', [
    '-y',
    '-sseof', '-1',
    '-i', videoPath,
    '-update', '1',
    '-q:v', '2',
    outPath,
  ], { stdio: 'pipe' })
  return outPath
}
