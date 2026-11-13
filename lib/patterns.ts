// Procedural stand-ins for the factory pattern artwork. Each function draws
// the full front-lid art in millimetres (0,0 → w,h) on a transparent ground,
// so the shell colour shows through. Replace with approved factory art files.

const INK = {
  forest: '#1F3A2E',
  clay: '#B4653F',
  ochre: '#C9A24A',
  navy: '#2B3A55',
  cream: '#F4EFE6',
  sage: '#7E9276',
}

type Art = (w: number, h: number) => string

const r = (n: number) => Math.round(n * 10) / 10

const ART: Record<string, Art> = {
  'line-pinstripe': (w, h) => {
    let s = ''
    for (let x = 12; x < w; x += 16) s += `<rect x="${x}" y="0" width="1.6" height="${h}" fill="${INK.forest}" opacity="0.55"/>`
    return s
  },
  'line-grid': (w, h) => {
    let s = ''
    for (let x = 0; x <= w; x += 40) s += `<rect x="${x - 1}" y="0" width="2" height="${h}" fill="${INK.navy}" opacity="0.45"/>`
    for (let y = 0; y <= h; y += 40) s += `<rect x="0" y="${y - 1}" width="${w}" height="2" fill="${INK.navy}" opacity="0.45"/>`
    return s
  },
  'line-horizon': (w, h) => {
    const bands = [INK.clay, INK.ochre, INK.forest]
    let s = ''
    let y = h * 0.52
    bands.forEach((c, i) => {
      const bh = 26 - i * 6
      s += `<rect x="0" y="${r(y)}" width="${w}" height="${bh}" fill="${c}" opacity="0.8"/>`
      y += bh + 14
    })
    return s
  },
  'journey-peaks': (w, h) => {
    const layer = (base: number, amp: number, step: number, color: string, op: number, seed: number) => {
      let d = `M0 ${h} L0 ${r(base)}`
      let x = 0
      let i = seed
      while (x < w) {
        const peak = base - amp * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7)))
        d += ` L${r(x + step / 2)} ${r(peak)} L${r(x + step)} ${r(base - amp * 0.15 * Math.abs(Math.cos(i)))}`
        x += step
        i++
      }
      d += ` L${w} ${h} Z`
      return `<path d="${d}" fill="${color}" opacity="${op}"/>`
    }
    return (
      layer(h * 0.62, h * 0.22, w / 3, INK.sage, 0.55, 1) +
      layer(h * 0.74, h * 0.18, w / 4, INK.forest, 0.75, 3) +
      layer(h * 0.88, h * 0.12, w / 5, INK.navy, 0.85, 5) +
      `<circle cx="${r(w * 0.72)}" cy="${r(h * 0.36)}" r="${r(w * 0.07)}" fill="${INK.ochre}" opacity="0.85"/>`
    )
  },
  'journey-tides': (w, h) => {
    let s = ''
    let row = 0
    for (let y = h * 0.45; y < h + 20; y += 28) {
      let d = `M0 ${r(y)}`
      for (let x = 0; x < w; x += 40) d += ` q10 -14 20 0 t20 0`
      s += `<path d="${d}" fill="none" stroke="${row % 2 ? INK.navy : INK.sage}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`
      row++
    }
    return s
  },
  'journey-route': (w, h) => {
    const pts = [
      [w * 0.18, h * 0.86],
      [w * 0.42, h * 0.7],
      [w * 0.3, h * 0.52],
      [w * 0.7, h * 0.44],
      [w * 0.58, h * 0.22],
      [w * 0.84, h * 0.12],
    ]
    let d = `M${r(pts[0][0])} ${r(pts[0][1])}`
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1]
      const [x, y] = pts[i]
      d += ` Q${r((px + x) / 2 + 30)} ${r((py + y) / 2 + 20)} ${r(x)} ${r(y)}`
    }
    let s = `<path d="${d}" fill="none" stroke="${INK.clay}" stroke-width="3" stroke-dasharray="8 7" stroke-linecap="round"/>`
    pts.forEach(([x, y], i) => {
      s += `<circle cx="${r(x)}" cy="${r(y)}" r="${i === pts.length - 1 ? 9 : 6}" fill="${i === pts.length - 1 ? INK.clay : INK.forest}"/>`
    })
    return s
  },
  'pattern-check': (w, h) => {
    let s = ''
    const c = 36
    for (let x = 0; x < w; x += c * 2) s += `<rect x="${x}" y="0" width="${c}" height="${h}" fill="${INK.forest}" opacity="0.22"/>`
    for (let y = 0; y < h; y += c * 2) s += `<rect x="0" y="${y}" width="${w}" height="${c}" fill="${INK.forest}" opacity="0.22"/>`
    return s
  },
  'pattern-dots': (w, h) => {
    let s = ''
    let row = 0
    for (let y = 18; y < h; y += 34) {
      for (let x = row % 2 ? 34 : 17; x < w; x += 34) s += `<circle cx="${x}" cy="${y}" r="6" fill="${INK.clay}" opacity="0.75"/>`
      row++
    }
    return s
  },
  'pattern-chevron': (w, h) => {
    let s = ''
    for (let y = 10; y < h + 30; y += 30) {
      let d = `M0 ${y}`
      for (let x = 0; x < w; x += 40) d += ` l20 -16 l20 16`
      s += `<path d="${d}" fill="none" stroke="${INK.navy}" stroke-width="5" stroke-linejoin="round" opacity="0.55"/>`
    }
    return s
  },
  'lifestyle-palms': (w, h) => {
    const leaf = (cx: number, cy: number, rot: number, scale: number, color: string) => {
      let s = `<g transform="translate(${r(cx)} ${r(cy)}) rotate(${rot}) scale(${scale})">`
      s += `<path d="M0 0 Q4 -40 0 -80" stroke="${color}" stroke-width="3" fill="none"/>`
      for (let i = 1; i <= 6; i++) {
        const y = -i * 12
        s += `<path d="M0 ${y} q-24 ${-4} -30 ${10}" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/>`
        s += `<path d="M0 ${y} q24 ${-4} 30 ${10}" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      }
      return s + '</g>'
    }
    let s = ''
    const spots = [
      [0.15, 0.25, -20, 1],
      [0.75, 0.18, 25, 0.9],
      [0.45, 0.55, -5, 1.1],
      [0.85, 0.72, 35, 1],
      [0.18, 0.88, -30, 0.95],
      [0.62, 0.98, 10, 0.8],
    ]
    spots.forEach(([x, y, rot, sc], i) => (s += leaf(w * x, h * y, rot, sc, i % 2 ? INK.sage : INK.forest)))
    return s
  },
  'lifestyle-sunset': (w, h) => {
    let s = ''
    const rows = 4
    for (let i = 0; i < rows; i++) {
      const y = h * (0.2 + i * 0.22)
      const cx = i % 2 ? w * 0.68 : w * 0.32
      s += `<circle cx="${r(cx)}" cy="${r(y)}" r="38" fill="${i % 2 ? INK.ochre : INK.clay}" opacity="0.85"/>`
      s += `<rect x="0" y="${r(y + 6)}" width="${w}" height="40" fill="${INK.navy}" opacity="0.18"/>`
      for (let k = 0; k < 3; k++) s += `<rect x="${r(cx - 30 + k * 6)}" y="${r(y + 14 + k * 9)}" width="${60 - k * 12}" height="3" fill="${INK.cream}" opacity="0.7"/>`
    }
    return s
  },
  'lifestyle-postmark': (w, h) => {
    let s = ''
    const stamps = [
      [0.25, 0.18, -12],
      [0.7, 0.3, 8],
      [0.35, 0.5, 4],
      [0.75, 0.68, -6],
      [0.28, 0.84, 14],
    ]
    stamps.forEach(([x, y, rot], i) => {
      const c = [INK.clay, INK.navy, INK.forest][i % 3]
      s += `<g transform="translate(${r(w * x)} ${r(h * y)}) rotate(${rot})" fill="none" stroke="${c}" opacity="0.7">`
      s += `<circle r="40" stroke-width="3"/><circle r="31" stroke-width="1.5"/>`
      for (let k = -1; k <= 1; k++) s += `<path d="M44 ${k * 10} q20 -8 40 0 t40 0" stroke-width="2.5"/>`
      s += `<rect x="-14" y="-8" width="28" height="16" stroke-width="2"/></g>`
    })
    return s
  },
}

export function patternArt(patternId: string, w: number, h: number): string {
  const art = ART[patternId]
  return art ? art(w, h) : ''
}
