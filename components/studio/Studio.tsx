'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Font } from 'opentype.js'
import {
  COLORS,
  FONTS,
  MODELS,
  NAME_COLORS,
  PATTERNS,
  PERSONALIZATION_FEE_CENTS,
  PRODUCTION_DAYS,
  SERIES,
  formatMoney,
  getColor,
  getModel,
  getNameColor,
  getPattern,
  sku,
} from '@/lib/catalog'
import { cart } from '@/lib/cart'
import { track } from '@/lib/analytics'
import type { DesignInput, DesignSnapshot } from '@/lib/design'
import { loadClientFont } from '@/lib/fonts-client'
import {
  boxAt,
  checkPlacement,
  constrainMove,
  describeIssue,
  measureName,
  missingGlyphs,
  nearestValid,
  normalizeName,
  originFor,
  recommendedPosition,
  type LayoutIssue,
} from '@/lib/layout'
import { caseBaseMarkup, caseGeometry, renderSwatchSvg } from '@/lib/render'

type FontState = Record<string, Font | 'error' | undefined>

export interface StudioProps {
  inventory: Record<string, number>
  initial: { model?: string; color?: string; pattern?: string; design?: string; line?: string }
}

export default function Studio({ inventory, initial }: StudioProps) {
  const router = useRouter()
  const inStock = useCallback((m: string, c: string) => (inventory[sku(m, c)] ?? 0) > 0, [inventory])

  const startModel = getModel(initial.model) ?? MODELS[0]
  const startColor =
    (getColor(initial.color) && inStock(startModel.id, initial.color!) ? getColor(initial.color) : undefined) ??
    COLORS.find((c) => inStock(startModel.id, c.id)) ??
    COLORS[0]
  const startPattern = getPattern(initial.pattern)?.active ? getPattern(initial.pattern)! : PATTERNS[0]

  const [modelId, setModelId] = useState(startModel.id)
  const [colorId, setColorId] = useState(startColor.id)
  const [patternId, setPatternId] = useState(startPattern.id)
  const [text, setText] = useState('')
  const [fontId, setFontId] = useState('serif')
  const [sizeMm, setSizeMm] = useState(startModel.template.fontSizeMm.default)
  const [nameColorId, setNameColorId] = useState('forest')
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [relocated, setRelocated] = useState<string | null>(null)
  const [hit, setHit] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [fonts, setFonts] = useState<FontState>({})
  const [checked, setChecked] = useState(false)
  const [qty, setQty] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ designId: string; lineId: string } | null>(null)
  const [editLoadError, setEditLoadError] = useState<string | null>(null)

  const model = getModel(modelId)!
  const color = getColor(colorId)!
  const t = model.template
  const geo = caseGeometry(model)

  // ---- fonts: same versioned files the server measures with
  const loadFonts = useCallback(() => {
    FONTS.forEach((f) => {
      loadClientFont(f.id)
        .then((font) => setFonts((s) => ({ ...s, [f.id]: font })))
        .catch(() => setFonts((s) => ({ ...s, [f.id]: 'error' })))
    })
  }, [])
  useEffect(() => {
    loadFonts()
    track('studio_start', { model: startModel.id, pattern_id: startPattern.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- edit an existing cart line
  useEffect(() => {
    if (!initial.design || !initial.line) return
    fetch(`/api/designs/${encodeURIComponent(initial.design)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: DesignSnapshot) => {
        setModelId(d.modelId)
        setColorId(d.colorId)
        setPatternId(d.patternId)
        if (d.name) {
          setText(d.name.text)
          setFontId(d.name.fontId)
          setSizeMm(d.name.sizeMm)
          setNameColorId(d.name.colorId)
          setPos({ x: d.name.x, y: d.name.y })
        }
        setEditing({ designId: d.id, lineId: initial.line! })
        const line = cart.get().find((l) => l.lineId === initial.line)
        if (line) setQty(line.qty)
      })
      .catch(() => setEditLoadError('We could not load this design. You can start a new one below.'))
  }, [initial.design, initial.line])

  // ---- measurement
  const font = fonts[fontId]
  const cleanText = normalizeName(text).trim()
  const hasName = cleanText.length > 0
  const tooLong = Array.from(cleanText).length > t.maxChars
  const missing = useMemo(() => (font && font !== 'error' && hasName ? missingGlyphs(font, cleanText) : []), [font, cleanText, hasName])
  const measured = useMemo(() => {
    if (!font || font === 'error' || !hasName || missing.length) return null
    return measureName(font, cleanText, sizeMm)
  }, [font, cleanText, hasName, missing.length, sizeMm])

  // keep the name in a valid spot as it is typed / restyled
  useEffect(() => {
    if (!measured) return
    setPos((p) => {
      if (!p) return recommendedPosition(t, measured) ?? { x: t.recommended.x, y: t.recommended.y }
      if (!checkPlacement(t, boxAt(measured, p.x, p.y))) return p
      return nearestValid(t, measured, p) ?? p
    })
  }, [measured, t])

  const placementIssue: LayoutIssue | null = measured && pos ? checkPlacement(t, boxAt(measured, pos.x, pos.y)) : null

  const issues: string[] = []
  if (hasName) {
    if (font === 'error') issues.push(`The ${FONTS.find((f) => f.id === fontId)!.name} font failed to load.`)
    if (tooLong) issues.push(describeIssue({ code: 'too_long', max: t.maxChars }))
    if (missing.length) issues.push(describeIssue({ code: 'missing_glyphs', chars: missing }))
    if (placementIssue) issues.push(describeIssue(placementIssue))
  }
  const soldOut = !inStock(modelId, colorId)
  if (soldOut) issues.push(`${model.name} in ${color.name} is sold out. Choose another colour or size.`)

  const fontsReady = !hasName || (font && font !== 'error')
  const canConfirm =
    !submitting && issues.length === 0 && !relocated && fontsReady && (!hasName || (checked && !!measured && !!pos))

  // ---- size change: re-validate on the new template
  function changeModel(id: string) {
    const next = getModel(id)!
    const nt = next.template
    setModelId(id)
    setServerError(null)
    if (!inStock(id, colorId)) {
      const alt = COLORS.find((c) => inStock(id, c.id))
      if (alt) setColorId(alt.id)
    }
    if (measured && pos) {
      const mapped = { x: (pos.x / t.panel.w) * nt.panel.w, y: (pos.y / t.panel.h) * nt.panel.h }
      if (!checkPlacement(nt, boxAt(measured, mapped.x, mapped.y))) {
        setPos(mapped)
      } else {
        const rec = recommendedPosition(nt, measured)
        setPos(rec ?? mapped)
        if (rec) setRelocated(`Your name was moved to the recommended position on the ${next.name}. Check the preview, then confirm.`)
      }
    }
  }

  // ---- drag (pointer = touch, mouse, pen)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null)
  const toLid = (clientX: number, clientY: number) => {
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    return { x: p.x - geo.lid.x, y: p.y - geo.lid.y }
  }
  const onPointerDown = (e: React.PointerEvent) => {
    if (!pos) return
    e.preventDefault()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    const p = toLid(e.clientX, e.clientY)
    dragOffset.current = { dx: p.x - pos.x, dy: p.y - pos.y }
    setDragging(true)
    setRelocated(null)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragOffset.current || !measured || !pos) return
    const p = toLid(e.clientX, e.clientY)
    const r = constrainMove(t, measured, pos, { x: p.x - dragOffset.current.dx, y: p.y - dragOffset.current.dy })
    setPos({ x: r.x, y: r.y })
    setHit(r.hit)
  }
  const endDrag = () => {
    dragOffset.current = null
    setDragging(false)
    setTimeout(() => setHit(null), 1500)
  }
  const nudge = (dx: number, dy: number) => {
    if (!measured || !pos) return
    const r = constrainMove(t, measured, pos, { x: pos.x + dx, y: pos.y + dy })
    setPos({ x: r.x, y: r.y })
    setHit(r.hit)
    setRelocated(null)
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 5 : 1
    const map: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const d = map[e.key]
    if (d) {
      e.preventDefault()
      nudge(d[0], d[1])
    }
  }

  // ---- submit
  async function confirm() {
    if (!canConfirm) return
    setSubmitting(true)
    setServerError(null)
    const input: DesignInput = {
      modelId,
      colorId,
      patternId,
      name: hasName && measured && pos ? { text: cleanText, fontId, sizeMm, colorId: nameColorId, x: pos.x, y: pos.y } : null,
      supersedes: editing?.designId,
    }
    try {
      const res = await fetch('/api/designs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save the design.')
      const snap = data as DesignSnapshot
      if (editing) cart.replace(editing.lineId, snap, qty)
      else cart.add(snap, qty)
      track('add_to_cart', { model: modelId, pattern_id: patternId, has_name: !!snap.name, qty, edit: !!editing })
      router.push('/cart')
    } catch (e) {
      setServerError((e as Error).message)
      setSubmitting(false)
    }
  }

  const base = useMemo(() => caseBaseMarkup(model, color, patternId, 'studio'), [model, color, patternId])
  const nameColor = getNameColor(nameColorId)!
  const origin = measured && pos ? originFor(measured, pos.x, pos.y) : null
  const showGuides = hasName && (dragging || !!hit || !!placementIssue)
  const pattern = getPattern(patternId)!
  const unitCents = model.priceCents + (hasName ? PERSONALIZATION_FEE_CENTS : 0)

  return (
    <div className="container-custom py-6 lg:py-10">
      <h1 className="text-3xl sm:text-4xl">{editing ? 'Edit your design' : 'Personalize your case'}</h1>
      {editLoadError && <p className="mt-3 text-sm text-alert">{editLoadError}</p>}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_440px]">
        {/* Preview: above the options on mobile, sticky so the lid stays visible while dragging */}
        <div className="sticky top-16 z-10 -mx-4 bg-paper px-4 pb-2 lg:static lg:mx-0 lg:px-0">
          <div className="lg:sticky lg:top-24">
            <div className="relative rounded-3xl bg-sand p-3 sm:p-6">
              <svg
                ref={svgRef}
                viewBox={`${geo.viewBox.x} ${geo.viewBox.y} ${geo.viewBox.w} ${geo.viewBox.h}`}
                className="mx-auto block h-[38vh] w-full select-none lg:h-[70vh]"
                role="group"
                aria-label={`Preview: ${model.name}, ${color.name}, ${pattern.name} pattern${hasName ? ', with name' : ''}`}
              >
                <g dangerouslySetInnerHTML={{ __html: base }} />
                <g transform={`translate(${geo.lid.x} ${geo.lid.y})`}>
                  {(showGuides || (hasName && !pos)) && (
                    <g pointerEvents="none">
                      <rect x={t.safe.x} y={t.safe.y} width={t.safe.w} height={t.safe.h} fill="none" stroke={hit ? '#9E3A25' : '#1F3A2E'} strokeWidth={1.5} strokeDasharray="6 5" opacity={0.8} />
                      {t.keepOuts.map((k) => (
                        <rect key={k.id} x={k.rect.x} y={k.rect.y} width={k.rect.w} height={k.rect.h} fill="#9E3A25" opacity={0.25} />
                      ))}
                    </g>
                  )}
                  {measured && origin && pos && (
                    <g
                      tabIndex={0}
                      role="img"
                      aria-label={`Name "${cleanText}". Drag to move, or use arrow keys (Shift for bigger steps).`}
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      onKeyDown={onKeyDown}
                      style={{ touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab', outline: 'none' }}
                      className="group"
                    >
                      <rect x={pos.x - measured.w / 2 - 4} y={pos.y - measured.h / 2 - 4} width={measured.w + 8} height={measured.h + 8} fill="transparent" stroke={placementIssue ? '#9E3A25' : '#1F3A2E'} strokeWidth={1.2} strokeDasharray="4 3" opacity={dragging || placementIssue ? 0.9 : 0.35} className="group-focus:opacity-90" />
                      <path d={measured.d} transform={`translate(${origin.x} ${origin.y})`} fill={nameColor.hex} />
                    </g>
                  )}
                </g>
              </svg>
              <p aria-live="polite" className={`mt-2 min-h-[1.25rem] text-center text-sm ${hit ? 'text-alert' : 'text-forest-soft'}`}>
                {hit ? (hit === 'edge' ? 'That’s the edge of the printable area.' : `Can’t print over the ${hit}.`) : hasName && measured ? 'Drag the name to move it.' : ' '}
              </p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-8">
          <section aria-labelledby="h-case">
            <h2 id="h-case" className="font-sans text-sm font-semibold uppercase tracking-[0.18em]">Case</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {MODELS.map((m) => (
                <button key={m.id} type="button" onClick={() => changeModel(m.id)} aria-pressed={m.id === modelId} className={`chip ${m.id === modelId ? 'chip-active' : ''}`}>
                  {m.name}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {COLORS.map((c) => {
                const ok = inStock(modelId, c.id)
                return (
                  <button key={c.id} type="button" disabled={!ok} onClick={() => setColorId(c.id)} aria-pressed={c.id === colorId} className={`chip flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40 ${c.id === colorId ? 'chip-active' : ''}`}>
                    <span className="h-4 w-4 rounded-full border border-forest/30" style={{ background: c.hex }} aria-hidden />
                    {c.name}
                    {!ok && ' · sold out'}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-sm text-forest-soft">Front-opening · {model.dimensionsCm.h} × {model.dimensionsCm.w} × {model.dimensionsCm.d} cm</p>
          </section>

          <section aria-labelledby="h-pattern">
            <h2 id="h-pattern" className="font-sans text-sm font-semibold uppercase tracking-[0.18em]">
              Pattern · <span className="normal-case tracking-normal">{SERIES.find((s) => s.id === pattern.series)!.name} / {pattern.name}</span>
            </h2>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {PATTERNS.filter((p) => p.active).map((p) => (
                <button key={p.id} type="button" onClick={() => setPatternId(p.id)} aria-pressed={p.id === patternId} title={p.name} className={`overflow-hidden rounded-lg border-2 ${p.id === patternId ? 'border-forest' : 'border-transparent'}`}>
                  <span className="svg-fill block aspect-square" dangerouslySetInnerHTML={{ __html: renderSwatchSvg(p.id, color, p.name) }} />
                  <span className="sr-only">{p.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="h-name">
            <h2 id="h-name" className="font-sans text-sm font-semibold uppercase tracking-[0.18em]">Name (optional)</h2>
            <div className="mt-3 flex gap-2">
              <label htmlFor="name-input" className="sr-only">Name to print</label>
              <input
                id="name-input"
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  setChecked(false)
                  setServerError(null)
                  if (!e.target.value.trim()) setPos(null)
                }}
                maxLength={t.maxChars + 4}
                placeholder="e.g. EMILY"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="name-help name-issues"
                className="w-full rounded-full border border-forest/30 bg-white px-5 py-3 text-lg focus:border-forest"
              />
              {text && (
                <button type="button" className="chip" onClick={() => { setText(''); setPos(null); setChecked(false) }}>
                  Clear
                </button>
              )}
            </div>
            <p id="name-help" className="mt-2 text-sm text-forest-soft">
              Up to {t.maxChars} characters. Leave empty to buy the pattern as it is — nothing extra is printed.
            </p>
          </section>

          {hasName && (
            <section aria-labelledby="h-style" className="space-y-5">
              <h2 id="h-style" className="font-sans text-sm font-semibold uppercase tracking-[0.18em]">Style</h2>
              <div>
                <p className="text-sm font-medium">Font</p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {FONTS.map((f) => {
                    const ff = fonts[f.id]
                    const sample = ff && ff !== 'error' ? measureName(ff, 'Aa', 26) : null
                    return (
                      <button key={f.id} type="button" onClick={() => setFontId(f.id)} aria-pressed={f.id === fontId} className={`flex flex-col items-center rounded-xl border p-2 ${f.id === fontId ? 'border-forest bg-sage-soft' : 'border-forest/20'}`}>
                        <svg viewBox={sample ? `${sample.x1 - 2} ${sample.y1 - 2} ${sample.w + 4} ${sample.h + 4}` : '0 0 10 10'} className="h-7 w-12" aria-hidden>
                          {sample && <path d={sample.d} fill="currentColor" />}
                        </svg>
                        <span className="mt-1 text-xs">{ff === 'error' ? `${f.name} (failed)` : f.name}</span>
                      </button>
                    )
                  })}
                </div>
                {font === 'error' && (
                  <button type="button" className="mt-2 text-sm underline" onClick={loadFonts}>Retry loading fonts</button>
                )}
              </div>
              <div>
                <label htmlFor="size" className="text-sm font-medium">Letter size · {sizeMm} mm</label>
                <div className="mt-2 flex items-center gap-3">
                  <button type="button" className="chip" aria-label="Smaller" onClick={() => setSizeMm((s) => Math.max(t.fontSizeMm.min, s - 2))}>−</button>
                  <input id="size" type="range" min={t.fontSizeMm.min} max={t.fontSizeMm.max} step={1} value={sizeMm} onChange={(e) => setSizeMm(Number(e.target.value))} className="w-full accent-forest" />
                  <button type="button" className="chip" aria-label="Larger" onClick={() => setSizeMm((s) => Math.min(t.fontSizeMm.max, s + 2))}>+</button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Colour · {nameColor.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {NAME_COLORS.map((c) => (
                    <button key={c.id} type="button" onClick={() => setNameColorId(c.id)} aria-pressed={c.id === nameColorId} className={`chip flex items-center gap-2 ${c.id === nameColorId ? 'chip-active' : ''}`}>
                      <span className="h-4 w-4 rounded-full border border-forest/30" style={{ background: c.hex }} aria-hidden />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Position</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="chip"
                    disabled={!measured}
                    onClick={() => {
                      if (!measured) return
                      const r = recommendedPosition(t, measured)
                      if (r) setPos(r)
                      setRelocated(null)
                    }}
                  >
                    Recommended position
                  </button>
                  <span className="text-sm text-forest-soft">or drag on the preview · fine-tune:</span>
                  <div className="flex gap-1" role="group" aria-label="Move name by 1 mm">
                    {([['←', -1, 0, 'left'], ['↑', 0, -1, 'up'], ['↓', 0, 1, 'down'], ['→', 1, 0, 'right']] as const).map(([s, dx, dy, label]) => (
                      <button key={label} type="button" className="chip px-3" aria-label={`Move ${label} 1 mm`} disabled={!measured} onClick={() => nudge(dx, dy)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {relocated && (
            <div role="alert" className="rounded-xl bg-sage-soft p-4 text-sm">
              <p>{relocated}</p>
              <button type="button" className="btn-primary mt-3 px-5 py-2" onClick={() => setRelocated(null)}>
                Looks good
              </button>
            </div>
          )}

          <section aria-labelledby="h-summary" className="rounded-2xl bg-sand/60 p-5">
            <h2 id="h-summary" className="font-sans text-sm font-semibold uppercase tracking-[0.18em]">Check and add</h2>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><dt>Case</dt><dd>{model.name} · {color.name}</dd></div>
              <div className="flex justify-between"><dt>Pattern</dt><dd>{pattern.name}</dd></div>
              <div className="flex justify-between gap-4">
                <dt>Name</dt>
                <dd className="text-right">
                  {hasName ? (
                    <>
                      <span className="rounded bg-white px-2 py-0.5 font-mono text-base tracking-[0.15em]">{cleanText}</span>
                      <span className="block text-xs text-forest-soft">
                        {FONTS.find((f) => f.id === fontId)!.name} · {sizeMm} mm · {nameColor.name}
                      </span>
                    </>
                  ) : (
                    'None'
                  )}
                </dd>
              </div>
              <div className="flex justify-between"><dt>Made in</dt><dd>{PRODUCTION_DAYS}</dd></div>
              <div className="flex justify-between"><dt>Price</dt><dd>{formatMoney(model.priceCents)}{hasName && ` + ${formatMoney(PERSONALIZATION_FEE_CENTS)} name`}</dd></div>
            </dl>

            <div className="mt-4 flex items-center gap-3">
              <label htmlFor="qty" className="text-sm font-medium">Quantity</label>
              <select id="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="rounded-full border border-forest/30 bg-white px-3 py-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
              </select>
              <span className="ml-auto text-lg font-semibold">{formatMoney(unitCents * qty)}</span>
            </div>

            {hasName && (
              <label className="mt-4 flex items-start gap-2 text-sm">
                <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1 accent-forest" />
                <span>I’ve checked the spelling and position. Personalized cases are made to order.</span>
              </label>
            )}

            <div id="name-issues" aria-live="polite">
              {issues.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm text-alert">
                  {issues.map((i) => <li key={i}>{i}</li>)}
                </ul>
              )}
              {serverError && <p className="mt-4 text-sm text-alert">{serverError}</p>}
              {hasName && !fontsReady && font !== 'error' && <p className="mt-4 text-sm text-forest-soft">Loading fonts…</p>}
            </div>

            <button type="button" className="btn-primary mt-5 w-full" disabled={!canConfirm} onClick={confirm}>
              {submitting ? 'Saving…' : editing ? 'Save changes to cart' : 'Confirm preview & add to cart'}
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
