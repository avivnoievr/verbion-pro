/**
 * Concatenates the four per-scene clips into one sequential video, in scene
 * order, via an ffmpeg concat-demuxer call.
 *
 * TODO: write a concat-demuxer list file and run
 * `ffmpeg -f concat -safe 0 -i <list> -c copy <outputPath>`. Not wired up
 * yet — only run after an explicit greenlight.
 */
export async function concatClips(clipPaths, outputPath) {
  throw new Error(
    `concatClips not implemented yet (${clipPaths.length} clips -> ${outputPath})`,
  )
}
