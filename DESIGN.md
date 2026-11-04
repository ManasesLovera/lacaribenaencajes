# La Caribeña Encajes — Design System

> [!summary]
> Design foundation for the inventory app of **La Caribeña Encajes**, a Dominican
> lingerie, pajama, and bikini boutique. The system is editorial and warm: deep wine
> fields, cream paper, blush accents, and high-contrast didone type — the same voice
> as the brand's Instagram feed. This document defines tokens, components, and the
> product list screen. No backend logic is in scope yet.

- **Product:** internal inventory and margin tracker for the shop owner.
- **Primary user:** the owner. Non-technical, works from a phone as often as a laptop.
- **Primary language:** Spanish (Dominican Republic). See [Content and voice](#11-content-and-voice).
- **Status:** design system v1, design-only (no app code yet).
- **Logo:** the third reference image (wine square lockup). Asset export is pending.

---

## 1. Brand foundation

| Attribute | Value |
| --- | --- |
| Personality | Sensual, feminine, confident, boutique — never cheap or loud |
| Mood | Editorial fashion magazine, warm Caribbean dusk |
| References | Didone headlines, script signature, halftone photography, starbursts, hand-drawn hearts |
| Surface feel | Paper, not glass. Matte, not glossy. Thin warm hairlines, no heavy shadows |
| Radius language | Small and precise (4–10 px); pills only for filters, chips, and tags |

The interface should feel like the brand's feed became a tool: the same wine and cream,
the same serif confidence, but quiet enough to read numbers all day.

### Design principles

1. **The product is the hero; the chrome is paper.** No gradients, glassmorphism, or
   colored panels competing with the table.
2. **One strong field per screen.** Wine is used in large calm blocks (sidebar, primary
   actions), never sprinkled everywhere.
3. **Serif for identity, sans for data.** Display type never appears in table numbers.
4. **Money must be instantly scannable.** Prices right-aligned, tabular figures, net
   income always visually distinct from cost.
5. **The owner should never do math.** Anything derivable is computed and labeled as such.

---

## 2. Logo

### Versions required at export

| Version | Background | Use |
| --- | --- | --- |
| Primary lockup | Wine `#6E0F0D` square | App icon, sidebar brand block, favicon |
| Cream lockup | Transparent background | Photography, dark fields, stamps, packaging |
| Mono ink lockup | Transparent background | Documents, invoices, one-color print |

The lockup is stacked and centered: `LA` in didone caps, `Caribeña` in the brand script,
`ENCAGES` in wide didone caps. The script overlaps the caps slightly and the whole mark
carries a subtle warm-bevel finish; do not flatten it beyond the supplied export.

### Usage

- Minimum clear space around the mark: **half the height of the "LA"** on all sides.
- Minimum width: **96 px** in the UI; **72 px** only for favicon-scale use.
- Keep the stacked lockup intact: `LA` / `Caribeña` (script) / `ENCAGES` (didone caps).
- On cream surfaces, place the mark on a wine field (sidebar, seal, or footer). Do not
  recolor the script separately.

### Don'ts

- Do not stretch, rotate, outline, or add drop shadows to the logo.
- Do not place the wine-background lockup on cream and let the square edge show as a
  patch — use a wine container or the transparent cream lockup.
- Do not set the wordmark in another font; the script is part of the identity.

---

## 3. Color

### Core palette

| Token | Hex | Usage |
| --- | --- | --- |
| `--wine-900` | `#4A0707` | Sidebar depth, pressed states, overlay |
| `--wine-800` | `#5A0A09` | Primary brand field, sidebar background |
| `--wine-700` | `#6E0F0D` | Primary buttons, logo field |
| `--wine-600` | `#8C2A28` | Hover on wine, chart accents |
| `--blush-400` | `#DCA396` | Decorative strokes, art-directed imagery |
| `--blush-300` | `#E9B9AE` | Accent text on wine, active rules |
| `--blush-200` | `#F3CFC5` | Chips, subtle fills, highlights |
| `--blush-100` | `#F9E7E0` | Row hover, selected background |
| `--cream-50` | `#FBF6F1` | App canvas |
| `--cream-100` | `#F5ECE4` | Cards, inputs, table surface |
| `--cream-200` | `#EFE1D8` | Raised/alternate surface, empty states |
| `--ink-900` | `#2A1B18` | Primary text |
| `--ink-600` | `#6B5651` | Secondary text, labels |
| `--ink-400` | `#9A857F` | Placeholder, disabled text |
| `--line` | `#E6D8CF` | Hairlines, borders, dividers |
| `--line-strong` | `#D8C6BB` | Input borders, table header rule |
| `--success` | `#4F7A5B` | Positive states, stock OK |
| `--warning` | `#B8863B` | Low stock, pending |
| `--danger` | `#A32626` | Destructive actions, negative margin |

### Semantic mapping

| Purpose | Token |
| --- | --- |
| App background | `--cream-50` |
| Sidebar / brand field | `--wine-800` |
| Primary action | `--wine-700` fill, `--cream-50` text |
| Destructive action | `--danger` text, transparent fill |
| Net income | `--wine-700` text on `--blush-100` |
| Focus ring | `2px --wine-700`, offset `2px` |

### Contrast rules

- Body text on cream uses `--ink-900` (AAA). `--ink-600` is for 12 px and up, never
  for long paragraphs below 12 px.
- On wine, text is `--cream-50`; accent text may use `--blush-200`.
- **Never** use blush as text on cream — it fails contrast. Blush is for surfaces,
  rules, and fills only.
- Category chips always pair tinted background with `--ink-900` text.

---

## 4. Typography

### Families

| Role | Family | Fallback |
| --- | --- | --- |
| Display / brand | **Bodoni Moda** | `Didot, Playfair Display, Georgia, serif` |
| Script accent | **Parisienne** | `Snell Roundhand, cursive` |
| UI / data | **Inter** | `system-ui, -apple-system, Segoe UI, sans-serif` |

Load weights: Bodoni Moda 400/500/600 + italic; Inter 400/500/600; Parisienne 400.
Use `font-variant-numeric: tabular-nums` on every monetary and quantity value.

### Scale

| Token | Size / line | Family | Usage |
| --- | --- | --- | --- |
| `display-xl` | 40 / 1.05 | Bodoni 500 | Marketing and empty states only |
| `display-lg` | 32 / 1.10 | Bodoni 500 | Page title |
| `display-md` | 24 / 1.20 | Bodoni 500 | Section titles, stat values |
| `script-lg` | 28 / 1.20 | Parisienne | Editorial accent line |
| `body-lg` | 16 / 1.55 | Inter 400 | Primary reading |
| `body` | 14 / 1.55 | Inter 400 | Default UI |
| `body-sm` | 13 / 1.45 | Inter 400 | Secondary metadata |
| `label` | 11 / 1.20 | Inter 600, uppercase, `0.14em` tracking | Eyebrows, table headers |
| `mono-num` | 14 / 1.30 | Inter 500, tabular | Prices, costs, totals |

Rules:

- Only one didone headline per view. Everything else steps down to Inter.
- Uppercase labels never exceed 12 px and never carry sentences.
- Script is decoration: one accent line maximum per screen, never for data.

---

## 5. Layout, spacing, and shape

### Spacing scale

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` px. Only these values. Layout rhythm uses 24/32.

### Grid

| Breakpoint | Sidebar | Content | Page padding |
| --- | --- | --- | --- |
| ≥ 1280 px | 248 px fixed | Fluid, max 1180 px | 40 px |
| 1024–1279 px | 216 px fixed | Fluid | 32 px |
| 768–1023 px | 72 px rail | Fluid | 24 px |
| < 768 px | Off-canvas drawer | Fluid | 16 px |

### Shape and depth

| Token | Value | Usage |
| --- | --- | --- |
| `radius-xs` | 4 px | Inputs, chips, small controls |
| `radius-sm` | 8 px | Cards, table container |
| `radius-md` | 10 px | Modals, drawers |
| `radius-pill` | 999 px | Filters, tags, buttons in toolbars |
| `shadow-soft` | `0 1px 2px rgba(42,27,24,.05)` | Cards only |
| `shadow-modal` | `0 24px 64px rgba(74,7,7,.22)` | Modal, drawer |

Borders are `1px solid var(--line)`. Prefer a hairline and a background shift over a
shadow. Never stack more than one shadow.

### Texture

Use a very subtle grain (2–3% opacity) on large cream surfaces, and soft wine vignette
on hero imagery. No visible gradients in UI chrome.

---

## 6. Iconography and imagery

- **Icons:** 1.5 px stroke, 20 px box, round caps, `--ink-600` default. Category glyphs:
  bra (Lencería), folded pajama set (Pijamas), bikini (Bikinis), lace ribbon (Encajes).
- **Photography:** warm, low-key, wine-lit, halftone or grainy black-and-white cutouts
  with cream keylines. Never bright e-commerce white-background photos inside the app.
- **Accents:** starburst, hand-drawn hearts, scalloped label pills, and bracket rules
  (`—`) are brand motifs. Use them in empty states, onboarding, and section dividers —
  not in the data table.
- If no product photo exists, use the category glyph on `--blush-100`, never a random
  placeholder image.

---

## 7. Components

### 7.1 Buttons

| Variant | Fill | Text | Border | Height |
| --- | --- | --- | --- | --- |
| Primary | `--wine-700` | `--cream-50` | none | 44 px |
| Secondary | transparent | `--wine-700` | `1px --line-strong` | 44 px |
| Ghost | transparent | `--ink-600` | none | 36 px |
| Danger | transparent | `--danger` | `1px --line` | 40 px |

- Padding: 20 px horizontal (primary/secondary), 12 px (ghost).
- Hover: primary → `--wine-600`; secondary → `--blush-100` background.
- Active: translateY(1px) only; no bounce.
- Every button has an icon slot on the left, text on the right.
- Disabled: 40% opacity, no hover, cursor not-allowed.

### 7.2 Inputs

- Height 44 px, `--cream-50` background, `1px --line-strong` border, `radius-xs`.
- Label above, 11 px uppercase tracked `--ink-600`; optional hint below in `--ink-400`.
- Focus: border `--wine-700` plus 2 px outer ring at 12% wine.
- Currency inputs use a fixed `RD$` prefix inside the field, tabular numerals, right-aligned values.
- Error: `--danger` border, 13 px message with icon; never color alone.
- Calculated fields are never editable and carry a small "Calculado" tag.

### 7.3 Category chips

- Pill, 28 px high, 12 px side padding, `--blush-100` fill, `--ink-900` text, 1 px `--line`.
- Include a 6 px dot in the category color (all categories share wine/blush tones, so
  the dot is decorative, not the only differentiator).

### 7.4 Stat cards

- Surface `--cream-100`, 1 px `--line`, `radius-sm`, 20 px padding.
- Label = `label` style; value = `display-md` with tabular numerals.
- Delta line in `body-sm`, success or danger text plus arrow.
- Optional divider column between cards; no individual shadows.

### 7.5 Table

- Container: `--cream-50`, 1 px `--line`, `radius-sm`, overflow hidden.
- Header: 44 px, `label` style, `--ink-600`, bottom rule `--line-strong`, cream-100 tint.
- Row: 64 px, hairline bottom `--line`, hover `--blush-100` at 60%.
- Numeric cells right-aligned with tabular figures; text cells left-aligned.
- Row hover reveals actions (kebab); actions remain visible on touch.
- Selected row: 2 px `--wine-700` left rule plus `--blush-100` background.
- Empty state: centered, category glyph or starburst illustration, one serif line, one action.

### 7.6 Net income cell

- Value in `mono-num` semibold `--wine-700` on a `--blush-100` pill, 32 px high.
- Margin percentage directly beneath in `body-sm` `--ink-600` (e.g. `50.6% margen`).
- Negative values switch to `--danger` text and no pill fill.
- A small `lock` or `auto` glyph may prefix the column header, not every cell.

### 7.7 Modal / drawer

- Width 520 px, `--cream-50`, `radius-md`, `shadow-modal`, wine overlay at 45%.
- Header: 24 px padding, Bodoni title, `label` eyebrow, close icon button.
- Body: 24 px padding, 16 px field gap.
- Footer: sticky, 16/24 px padding, hairline top, secondary cancel + primary save.
- On mobile the modal becomes a bottom sheet at 92% height with a grab handle.

### 7.8 Navigation

- Sidebar `--wine-800`, 100 vh, logo block 96 px.
- Item: 44 px, 12 px radius, cream 76% text; icon 20 px.
- Active: `--cream-50` text, `--blush-200` 2 px left rule, background
  `rgba(243,207,197,.10)`.
- Section labels: 10 px uppercase, `--blush-200` at 60%, 24 px top margin.
- Bottom: owner card with avatar initials and "Cerrar sesión".

---

## 8. Product list screen

### Purpose

The owner opens the app and immediately sees every product, what it costs her, what she
sells it for, and what she actually earns. She adds a product by filling only four
fields.

### Structure

1. **Sidebar** — brand mark, navigation, owner card.
2. **Top bar** — search (`Buscar producto…`), quick actions, avatar.
3. **Page header** — eyebrow `Catálogo`, title `Productos`, count subtitle, primary
   action `Nuevo producto`.
4. **Summary strip** — three cards: productos activos, valor del inventario, ganancia
   potencial (from current price and cost).
5. **Filter bar** — category pills (Todos, Pijamas, Lencería, Bikinis), sort control,
   result count.
6. **Table** — the five requested columns.
7. **Pagination** — "Mostrando 8 de 24" with prev/next.

### Columns

| Order | Spanish label | English label | Type | Editable | Alignment |
| --- | --- | --- | --- | --- | --- |
| 1 | Producto | Product name | Text + category glyph | Yes | Left |
| 2 | Categoría | Category | Chip | Yes | Left |
| 3 | Precio | Price | Currency | Yes | Right |
| 4 | Costo | Cost | Currency | Yes | Right |
| 5 | Ganancia neta | Net income | Computed currency + margin % | **No** | Right |

The five columns are fixed. Stock, SKU, and supplier are out of scope for v1 and must
not be added to this table.

### Net income rule

- `ganancia neta = precio de venta − costo`.
- `margen % = ganancia neta ÷ precio de venta × 100`, rounded to one decimal.
- Both values update live while the owner types price or cost.
- The field is read-only, visually locked, and labeled `Calculado` in the form.
- Money is stored and displayed to two decimals; display uses `RD$` and a period
  thousands separator (`RD$ 3,850.00`) — Dominican formatting.
- If cost is greater than price, the net income shows in `--danger` and the form shows
  a non-blocking warning: `El costo supera el precio de venta.`
- No other deductions are applied in v1. Taxes, shipping, and card fees can be added
  later as a separate "Gastos" module, not as hidden math.

### Behaviors

- Typing in search filters product names instantly (no submit).
- Category pills filter the table; the active pill is wine-filled with cream text.
- Clicking a row opens the edit drawer with the same four inputs.
- `Nuevo producto` opens the modal with focus on the first field. `Escape` closes it.
- Saving is optimistic in the real build: the row appears immediately, with an undo toast.
- Deletion is confirmed and always reversible for 10 seconds (undo toast).

### Validation

- Product name: required, 2–80 characters.
- Category: required, one of the four seeded categories.
- Price and cost: required, numbers ≥ 0, max two decimals.
- Category `Encajes` exists even though the shop's main lines are the three promoted
  categories (per brand bio: Lencería, Bikinis, Pijamas, Encajes).

### States

| State | Treatment |
| --- | --- |
| Loading | Skeleton rows at 64 px, cream shimmer, no spinner |
| Empty (no products) | Centered starburst, serif "Tu catálogo empieza aquí", primary action |
| Empty (no results) | "No encontramos productos con ese filtro", ghost reset |
| Error | Inline banner on cream, `--danger` left rule, retry action |
| Low stock | Out of scope in v1; reserve `--warning` for later |

---

## 9. Motion

- Durations: 120 ms (hover), 180 ms (expand), 240 ms (modal).
- Easing: `cubic-bezier(.2,.7,.2,1)`.
- Allowed: fade, 4 px upward slide, underline draw.
- Not allowed: bounce, spring, parallax, large scale transforms, animated gradients.
- Respect `prefers-reduced-motion`: disable transforms, keep opacity fades.

---

## 10. Accessibility

- Minimum touch target 44×44 px.
- Visible focus ring on every interactive element; never remove outlines.
- Color is never the only carrier of meaning: net income also has the `Calculado` tag
  and margin text; errors include an icon and message.
- Table headers use `<th scope="col">`; computed column is announced as "Calculado".
- Contrast targets: AAA for body, AA for large display. Check blush text on wine before
  shipping (target ≥ 4.5:1).
- Forms use real `<label for>`; currency and percent values include the unit in text,
  not only visually.

---

## 11. Content and voice

- **Spanish-first** (Dominican Spanish), warm and direct: `Tu ganancia`, `Añadir producto`,
  `Sin resultados`. Avoid corporate tone (`Registrar ítem de inventario`).
- Spanish label → English mapping for future localization:

  | Spanish | English |
  | --- | --- |
  | Producto | Product name |
  | Categoría | Category |
  | Precio | Price |
  | Costo | Cost |
  | Ganancia neta | Net income |
  | Nuevo producto | New product |
  | Buscar producto… | Search product… |

- Currency: `RD$`. Use a non-breaking space between symbol and amount.
- Microcopy for computed values: `Calculado automáticamente`.
- Never say "error" alone; say what to fix.

---

## 12. Implementation notes

- No app code exists yet; this document is the single source of truth for the build.
- Suggested stack when building: React + Vite + TypeScript, Tailwind mapped to these
  tokens, or plain CSS custom properties. Keep the table logic and currency formatter in
  a single `money.ts` utility.
- Export this document's tokens 1:1 into `:root` when implementation starts.
- Fonts: load from Google Fonts (`Bodoni Moda`, `Inter`, `Parisienne`) with `display=swap`
  and local fallbacks. Self-host before launch for offline reliability.
- Out of scope for v1: authentication, sales, stock movements, suppliers, reports,
  multi-user roles, and payments.

---

## 13. Change log

| Date | Change |
| --- | --- |
| 2026-11-03 | v1 — brand foundation, tokens, components, product list screen |
