/**
 * Extracts frames from the concatenated hero video at a fixed fps, writing
 * compressed .webp images for the browser-side scroll scrubber.
 *
 * TODO: run `ffmpeg -i <videoPath> -vf fps=<fps> <outDir>/frame_%04d.webp`.
 * Not wired up yet — only run after an explicit greenlight.
 */
export async function extractFrames(videoPath, { outDir, fps }) {
  throw new Error(
    `extractFrames not implemented yet (${videoPath} @ ${fps}fps -> ${outDir})`,
  )
}
