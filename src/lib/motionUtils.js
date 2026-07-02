// Shared motion helpers for scroll-driven text animations

export function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

export function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

/**
 * Compute opacity and translateX for a scroll-driven text entrance.
 *
 * Entrance: slides in from -48px with smoothstep easing.
 * Hold:     fully visible at (op=1, tx=0).
 * Exit:     plain opacity fade, no transform (clean, non-distracting).
 *
 * @param {number} p        - raw progress value (0-1)
 * @param {number} inStart  - progress where fade-in begins
 * @param {number} inEnd    - progress where element is fully visible
 * @param {number} outStart - progress where fade-out begins
 * @param {number} outEnd   - progress where element is gone
 * @returns {{ op: number, tx: number }}
 */
export function textMotion(p, inStart, inEnd, outStart, outEnd) {
  if (p <= inStart) return { op: 0, tx: -48 }

  if (p <= inEnd) {
    const t = smoothstep((p - inStart) / (inEnd - inStart))
    return { op: t, tx: (1 - t) * -48 }
  }

  if (p <= outStart) return { op: 1, tx: 0 }

  if (p <= outEnd) {
    return { op: 1 - (p - outStart) / (outEnd - outStart), tx: 0 }
  }

  return { op: 0, tx: 0 }
}
