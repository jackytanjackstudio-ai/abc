# Website UAT

Automated browser run (headless Chrome via playwright-core) against a local build. Desktop = 1440×900 mouse; Mobile = 390×844 touch (iPhone profile, real touch events incl. two-finger pinch). Re-run: `node docs/uat-browser.cjs` with the dev server on :3100.

Result: **32/32 passed** (2026-11-15).

| | ID | Check | Detail |
|---|---|---|---|
| ✅ | D01 | name layer appears at a valid position | {"x":160,"y":141,"size":42,"w":129.78,"h":38.22} |
| ✅ | D02 | mouse drag moves the name | 160,141 -> 99.43,181.38 |
| ✅ | D03 | drag past edge stops at the safe area | left edge=24.00mm |
| ✅ | D04 | drag into badge area is blocked | box={"x":95.11,"y":328.89,"w":129.78,"h":38.22} |
| ✅ | D05 | drag toward pull tab is blocked | box={"x":166.22000000000003,"y":26.03,"w":129.78,"h":38.22} |
| ✅ | D06 | corner handle scales the name up | 42mm -> 80mm |
| ✅ | D07 | corner handle scales the name down | 80mm -> 22mm |
| ✅ | D08 | Top / Centre / Bottom presets | {"Top":103,"Centre":235,"Bottom":348} |
| ✅ | D09 | italic toggle applies | CaseCabin 20″ · SandPatternPeaksNameJACKYSerif Italic · 22 mm · Forest greenMade |
| ✅ | D10 | italic disabled for already-slanted font |  |
| ✅ | D11 | all 12 patterns switch without losing the name | patterns=12 |
| ✅ | D12 | size switching keeps a valid name |  |
| ✅ | D13 | before/after hides and restores the name |  |
| ✅ | D14 | save design gives a private link | /studio?design=d28923f6-9583-4f6a-a20c-23cde46af210 |
| ✅ | D15 | saved link reopens the design |  |
| ✅ | D16 | add to cart with name |  |
| ✅ | D17 | edit from cart replaces the line | lines=1 |
| ✅ | D18 | no-name purchase adds a line |  |
| ✅ | D19 | checkout quotes Malaysia shipping in USD | Pay $708.00 |
| ✅ | D20 | pay redirects to Stripe Checkout | https://checkout.stripe.com/g/pay/cs_test_b0x |
| ✅ | D21 | contact form sends |  |
| ✅ | D22 | pattern page links straight into the studio | /studio?model=cabin&color=sand&pattern=journey-peaks |
| ✅ | D23 | no browser JS errors (desktop) |  |
| ✅ | M01 | preview sits above the options on phone | svg y=161 input y=1018 |
| ✅ | M02 | no horizontal scrolling | overflow=0px |
| ✅ | M03 | preview stays visible while editing | svg y=76 |
| ✅ | M04 | finger drag moves the name | 160,141 -> 195.69,220.32 |
| ✅ | M05 | dragging the name does not scroll the page | scrollY 623 -> 623 |
| ✅ | M06 | two-finger pinch scales the name | 42mm -> 80mm |
| ✅ | M07 | add to cart on phone |  |
| ✅ | M08 | checkout fits the phone screen | overflow=0px |
| ✅ | M09 | no browser JS errors (mobile) |  |

## Reviewer checklist mapping

| Checklist item | Covered by | Status |
|---|---|---|
| 20″/24″/28″ and colours switch correctly | D12, D18 | ✅ automated |
| 12 factory designs display; switching keeps parameters | D11 | ✅ automated |
| Name can be typed, moved, scaled; never enters no-print areas | D01–D08, M04, M06 + server checks | ✅ automated |
| No-name purchase keeps the pattern complete | D18 + API A01 | ✅ automated |
| Phone and tablet operate smoothly | M01–M09 (phone). Tablet not yet run | ⚠️ phone only |
| Cart and order keep the full design and price | D16–D19, order snapshot tests | ✅ automated |
| Back office exports accurate UV DTF data | production API: layered mm SVG (COLOR/WHITE/VARNISH/CUT), sheet, mirror | ✅ automated |
| Physical print matches the website preview | needs factory sample | ⏳ factory |

## Still manual

- Live Stripe test payment end to end on production (card 4242…).
- Physical UV DTF sample on a real case; lock RIP/white/varnish settings (see `PRINT_SPEC.pendingFactorySignOff`).
- Real iOS Safari / Android Chrome devices (automated run uses Chrome mobile emulation).
