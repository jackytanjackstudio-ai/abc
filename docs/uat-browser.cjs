// Browser UAT for the VIAROU studio → cart → checkout flow (desktop mouse + mobile touch).
const { chromium } = require('playwright-core')
const B = process.env.BASE || 'http://localhost:3100'
const OUT = process.env.UAT_OUT || require('os').tmpdir()
const SAFE = { x: 24, y: 24, w: 272, h: 422 } // cabin template
const KEEP = [{ id: 'pull', x: 262, y: 200, w: 34, h: 70 }, { id: 'badge', x: 120, y: 412, w: 80, h: 34 }]
const results = []
const check = (id, ok, info = '') => { results.push({ id, ok: !!ok, info }); console.log(ok ? 'PASS' : 'FAIL', id, info) }

const layer = (page) => page.$eval('[data-testid=name-layer]', (el) => ({ x: +el.dataset.x, y: +el.dataset.y, size: +el.dataset.size, w: +el.dataset.w, h: +el.dataset.h })).catch(() => null)
const box = (l) => ({ x: l.x - l.w / 2, y: l.y - l.h / 2, w: l.w, h: l.h })
const inSafe = (b) => b.x >= SAFE.x - 0.01 && b.y >= SAFE.y - 0.01 && b.x + b.w <= SAFE.x + SAFE.w + 0.01 && b.y + b.h <= SAFE.y + SAFE.h + 0.01
const hitsKeep = (b) => KEEP.filter((k) => b.x < k.x + k.w - 0.01 && b.x + b.w > k.x + 0.01 && b.y < k.y + k.h - 0.01 && b.y + b.h > k.y + 0.01).map((k) => k.id)
const valid = (l) => !!l && inSafe(box(l)) && hitsKeep(box(l)).length === 0
const center = async (page, sel) => { const r = await page.locator(sel).first().boundingBox(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }
async function mouseDrag(page, from, dx, dy) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  for (let i = 1; i <= 12; i++) await page.mouse.move(from.x + (dx * i) / 12, from.y + (dy * i) / 12)
  await page.mouse.up()
  await page.waitForTimeout(150)
}

async function desktop(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await ctx.addInitScript(() => localStorage.setItem('viarou_consent', 'denied'))
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`${B}/studio?model=cabin&color=sand&pattern=journey-peaks`)
  await page.fill('#name-input', 'JACKY')
  await page.waitForSelector('[data-testid=name-layer]', { timeout: 20000 })
  let l = await layer(page)
  check('D01 name layer appears at a valid position', valid(l), JSON.stringify(l))
  await page.screenshot({ path: `${OUT}/desktop-studio.png` })

  await mouseDrag(page, await center(page, '[data-testid=name-layer] path'), -60, 40)
  const moved = await layer(page)
  check('D02 mouse drag moves the name', Math.abs(moved.x - l.x) > 5 && Math.abs(moved.y - l.y) > 5, `${l.x},${l.y} -> ${moved.x},${moved.y}`)
  await mouseDrag(page, await center(page, '[data-testid=name-layer] path'), -2000, 0)
  l = await layer(page)
  check('D03 drag past edge stops at the safe area', valid(l) && Math.abs(box(l).x - SAFE.x) < 1, `left edge=${box(l).x.toFixed(2)}mm`)
  await page.click('button:has-text("Bottom")')
  await page.waitForTimeout(150)
  await mouseDrag(page, await center(page, '[data-testid=name-layer] path'), 0, 2000)
  l = await layer(page)
  check('D04 drag into badge area is blocked', valid(l), `box=${JSON.stringify(box(l))}`)
  await mouseDrag(page, await center(page, '[data-testid=name-layer] path'), 2000, -300)
  l = await layer(page)
  check('D05 drag toward pull tab is blocked', valid(l), `box=${JSON.stringify(box(l))}`)

  await page.click('button:has-text("Centre")')
  await page.waitForTimeout(150)
  const before = await layer(page)
  await mouseDrag(page, await center(page, '[data-testid=resize-handle] circle:last-child'), 60, 30)
  const bigger = await layer(page)
  check('D06 corner handle scales the name up', bigger.size > before.size && valid(bigger), `${before.size}mm -> ${bigger.size}mm`)
  await mouseDrag(page, await center(page, '[data-testid=resize-handle] circle:last-child'), -90, -45)
  const smaller = await layer(page)
  check('D07 corner handle scales the name down', smaller.size < bigger.size, `${bigger.size}mm -> ${smaller.size}mm`)

  const ys = {}
  for (const p of ['Top', 'Centre', 'Bottom']) {
    await page.click(`button:has-text("${p}")`)
    await page.waitForTimeout(120)
    ys[p] = (await layer(page)).y
  }
  check('D08 Top / Centre / Bottom presets', ys.Top < ys.Centre && ys.Centre < ys.Bottom && valid(await layer(page)), JSON.stringify(ys))

  await page.click('button:has-text("Italic")')
  await page.waitForTimeout(500)
  const sum = await page.textContent('#h-summary + dl')
  check('D09 italic toggle applies', /Italic/.test(sum), sum.replace(/\s+/g, ' ').slice(0, 90))
  await page.click('button:has-text("Signature")')
  await page.waitForTimeout(300)
  check('D10 italic disabled for already-slanted font', await page.isDisabled('button:has-text("Italic")'))
  await page.click('button[aria-pressed]:has-text("Serif") >> nth=0')
  await page.waitForTimeout(300)

  const patternButtons = page.locator('#h-pattern + div button')
  const n = await patternButtons.count()
  let keep = true
  for (let i = 0; i < n; i++) {
    await patternButtons.nth(i).click()
    await page.waitForTimeout(60)
    if (!(await layer(page)) || (await page.inputValue('#name-input')) !== 'JACKY') keep = false
  }
  check('D11 all 12 patterns switch without losing the name', n === 12 && keep, `patterns=${n}`)
  for (const m of ['Check-in 24″', 'Large 28″', 'Cabin 20″']) {
    await page.click(`button:has-text("${m}")`)
    await page.waitForTimeout(250)
    const ok = await page.$('button:has-text("Looks good")')
    if (ok) await ok.click()
  }
  check('D12 size switching keeps a valid name', valid(await layer(page)))

  await page.click('button:has-text("Before / after")')
  const hidden = !(await page.$('[data-testid=name-layer]'))
  await page.click('button:has-text("Show my name")')
  check('D13 before/after hides and restores the name', hidden && !!(await page.$('[data-testid=name-layer]')))

  await page.click('button:has-text("Save design")')
  await page.waitForTimeout(2000)
  const savedUrl = page.url()
  check('D14 save design gives a private link', /design=/.test(savedUrl), savedUrl.replace(B, ''))
  await page.goto(savedUrl)
  await page.waitForSelector('[data-testid=name-layer]', { timeout: 20000 })
  check('D15 saved link reopens the design', (await page.inputValue('#name-input')) === 'JACKY')

  await page.check('input[type=checkbox]')
  await page.click('button:has-text("Confirm preview & add to cart")')
  await page.waitForURL(/\/cart/, { timeout: 20000 })
  await page.waitForSelector('main li', { timeout: 20000 })
  check('D16 add to cart with name', (await page.textContent('main')).includes('JACKY'))

  await page.click('a:has-text("Edit design")')
  await page.waitForSelector('[data-testid=name-layer]', { timeout: 20000 })
  await page.fill('#name-input', 'JACKIE')
  await page.waitForTimeout(300)
  await page.check('input[type=checkbox]')
  await page.click('button:has-text("Save changes to cart")')
  await page.waitForURL(/\/cart/, { timeout: 20000 })
  await page.waitForSelector('main li', { timeout: 20000 })
  const cartText = await page.textContent('main')
  check('D17 edit from cart replaces the line', cartText.includes('JACKIE') && (await page.locator('main li').count()) === 1, `lines=${await page.locator('main li').count()}`)

  await page.goto(`${B}/studio?model=checkin&color=chalk&pattern=line-grid`)
  await page.waitForTimeout(1000)
  await page.click('button:has-text("Confirm preview & add to cart")')
  await page.waitForURL(/\/cart/, { timeout: 20000 })
  await page.waitForSelector('main li', { timeout: 20000 })
  await page.waitForFunction(() => document.querySelectorAll('main li').length === 2, null, { timeout: 10000 }).catch(() => {})
  check('D18 no-name purchase adds a line', (await page.locator('main li').count()) === 2 && (await page.textContent('main')).includes('No name'))
  await page.screenshot({ path: `${OUT}/desktop-cart.png` })

  await page.click('a:has-text("Checkout")')
  await page.selectOption('#country', 'MY')
  await page.waitForSelector('button:has-text("Pay $")', { timeout: 20000 })
  const pay = await page.textContent('button:has-text("Pay $")')
  check('D19 checkout quotes Malaysia shipping in USD', /Pay \$/.test(pay), pay)
  await page.click('button:has-text("Pay $")')
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 }).catch(() => {})
  check('D20 pay redirects to Stripe Checkout', page.url().includes('checkout.stripe.com'), page.url().slice(0, 45))

  await page.goto(`${B}/contact`)
  await page.fill('input[name=name]', 'UAT Bot')
  await page.fill('input[name=email]', 'uat@example.com')
  await page.fill('textarea[name=message]', 'Browser UAT test message')
  await page.click('button:has-text("Send message")')
  check('D21 contact form sends', await page.waitForSelector('text=your message is with us', { timeout: 10000 }).then(() => true).catch(() => false))
  await page.goto(`${B}/collections/journey/peaks`)
  const cta = await page.getAttribute('a:has-text("Personalize this pattern")', 'href')
  check('D22 pattern page links straight into the studio', /pattern=journey-peaks/.test(cta || ''), cta)
  check('D23 no browser JS errors (desktop)', errors.length === 0, errors.slice(0, 2).join(' | '))
  await ctx.close()
}

async function mobile(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  })
  await ctx.addInitScript(() => localStorage.setItem('viarou_consent', 'denied'))
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  const cdp = await ctx.newCDPSession(page)
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p.x, y: p.y, id: i })) })

  await page.goto(`${B}/studio?model=cabin&color=sage&pattern=lifestyle-palms`)
  await page.fill('#name-input', 'EMILY')
  await page.waitForSelector('[data-testid=name-layer]', { timeout: 20000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  const svgTop = (await page.locator('svg[role=group]').boundingBox()).y
  const inputTop = (await page.locator('#name-input').boundingBox()).y
  check('M01 preview sits above the options on phone', svgTop < inputTop, `svg y=${svgTop.toFixed(0)} input y=${inputTop.toFixed(0)}`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  check('M02 no horizontal scrolling', overflow <= 0, `overflow=${overflow}px`)

  await page.locator('#name-input').scrollIntoViewIfNeeded()
  const svgBox = await page.locator('svg[role=group]').boundingBox()
  check('M03 preview stays visible while editing', svgBox.y >= 0 && svgBox.y < 200, `svg y=${svgBox.y.toFixed(0)}`)

  let l = await layer(page)
  let c = await center(page, '[data-testid=name-layer] path')
  const scrollBefore = await page.evaluate(() => window.scrollY)
  await touch('touchStart', [c])
  for (let i = 1; i <= 10; i++) await touch('touchMove', [{ x: c.x + i * 3, y: c.y + i * 4 }])
  await touch('touchEnd', [])
  await page.waitForTimeout(150)
  const moved = await layer(page)
  check('M04 finger drag moves the name', Math.abs(moved.y - l.y) > 3 && valid(moved), `${l.x},${l.y} -> ${moved.x},${moved.y}`)
  const scrollAfter = await page.evaluate(() => window.scrollY)
  check('M05 dragging the name does not scroll the page', scrollAfter === scrollBefore, `scrollY ${scrollBefore} -> ${scrollAfter}`)

  await page.click('button:has-text("Centre")')
  await page.waitForTimeout(150)
  l = await layer(page)
  c = await center(page, '[data-testid=name-layer] path')
  await touch('touchStart', [{ x: c.x - 10, y: c.y }, { x: c.x + 10, y: c.y }])
  for (let i = 1; i <= 10; i++) await touch('touchMove', [{ x: c.x - 10 - i * 4, y: c.y }, { x: c.x + 10 + i * 4, y: c.y }])
  await touch('touchEnd', [])
  await page.waitForTimeout(200)
  const pinched = await layer(page)
  check('M06 two-finger pinch scales the name', pinched.size > l.size && valid(pinched), `${l.size}mm -> ${pinched.size}mm`)
  await page.screenshot({ path: `${OUT}/mobile-studio.png` })

  await page.check('input[type=checkbox]')
  await page.click('button:has-text("Confirm preview & add to cart")')
  await page.waitForURL(/\/cart/, { timeout: 20000 })
  await page.waitForSelector('main li', { timeout: 20000 })
  check('M07 add to cart on phone', (await page.textContent('main')).includes('EMILY'))
  await page.goto(`${B}/checkout`)
  await page.waitForSelector('button:has-text("Pay $")', { timeout: 20000 })
  const ov2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  check('M08 checkout fits the phone screen', ov2 <= 0, `overflow=${ov2}px`)
  await page.screenshot({ path: `${OUT}/mobile-checkout.png`, fullPage: true })
  check('M09 no browser JS errors (mobile)', errors.length === 0, errors.slice(0, 2).join(' | '))
  await ctx.close()
}

;(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  try { await desktop(browser) } catch (e) { check('desktop run', false, e.message.split('\n')[0]) }
  try { await mobile(browser) } catch (e) { check('mobile run', false, e.message.split('\n')[0]) }
  await browser.close()
  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} passed`)
  require('fs').writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2))
})()
