# ohmtools design

One look for every ohmtools app, web page and document. The values live in
[`tokens/`](tokens/), this file holds the rules. The reference implementation
is [zeiteisen](https://github.com/ohmtools/zeiteisen): where an app and this
file disagree, this file wins and the app gets fixed.

## Basis

- [shadcn/ui](https://ui.shadcn.com) with style `base-sera` (Base UI
  primitives, not Radix), base colour Neutral, theme Red, icons lucide, font
  Inter. Config: [`shadcn/components.json`](shadcn/components.json), theme:
  [`shadcn/index.css`](shadcn/index.css).
- **shadcn defaults, no custom styling.** Tailwind for layout (flex, grid,
  gap, width) plus the semantic tokens (`text-muted-foreground`, `border`); no
  own colours, radii, shadows or custom CSS. A customization pass is made
  here, for every app at once, never in one app.
- Projects without shadcn (plain web pages, LaTeX, anything else) rebuild the
  same look from the tokens ([`dist/`](dist/)) and the rules below.

## Colour

- **Red is the only accent** (`primary`); everything else is neutral grey.
- Only semantic tokens, never raw values or palette classes (`text-red-600`,
  `#c10007`) in app code. App icons and link preview images are the one
  exception (see below).
- `primary`: the main action, active marks (the tab bar's line), links.
- `destructive`: destructive actions and errors only. A destructive button is
  tinted (destructive text on a 10 % destructive fill), never a second filled
  red.
- Data told apart by colour (one per timetable, series, category) uses
  **tints of `primary`**: the hue never changes, each step is darker and less
  saturated (`tint-1` … `tint-3`, then the ramp starts over), and the text on
  them is `primary-foreground`. Charts use `chart-1` … `chart-5`.
- **Colour is never the only cue**: a label, name or position says the same.
- A mark drawn over red content (a "now" line over timetable blocks) uses
  `foreground`; a `primary` line vanishes there.

## Light and dark

- Both modes, always; the device decides (`prefers-color-scheme`), also when
  it changes while the app is open. **No theme toggle.**
- No white flash: the mode is set before the first paint. shadcn apps: a
  blocking `<script src="/dark.js">` in `<head>` (a file, not inline, so the
  CSP needs no hash) sets the `.dark` class, a `ThemeProvider` keeps it in
  sync. Plain pages: `dist/tokens.css` switches by media query alone.

  ```js
  // public/dark.js
  document.documentElement.classList.toggle(
    "dark",
    matchMedia("(prefers-color-scheme: dark)").matches,
  );
  ```

- `<meta name="color-scheme" content="light dark">` and one `theme-color`
  per scheme with the `background` token: `#ffffff` light, `#0a0a0a` dark.
- Print and PDF are light.

## Typography

- **Inter** for everything, headings included (`--font-heading` is
  `--font-sans`). Bundled with the app (`@fontsource-variable/inter`), never
  from a font CDN. Other toolchains use Inter where they have it, else their
  sans-serif.
- The scale, as base-sera sets it:

  | Use | Size | Weight |
  | --- | --- | --- |
  | Title of a section, dialog, card | 18px (`text-lg`) | semibold |
  | Body text | 14px (`text-sm`) | normal |
  | Description, hint | 14px (`text-sm`), relaxed line height, `muted-foreground` | normal |
  | Button, label, menu group label | 12px (`text-xs`) | semibold |
  | Menu item | 12px (`text-xs`) | medium |
  | Input, text area | 16px on phones (keeps iOS from zooming in), 14px from 768px (`text-base md:text-sm`) | normal |

- **No uppercase text and no wide letter spacing** (`uppercase`,
  `tracking-wider`, `tracking-widest`). base-sera brings them into some
  components: strip them after every `shadcn add`.
- A name inside a sentence is quoted in the text itself: English “…”, German
  „…“. Not in titles, button labels or file names.

## Shape and surfaces

- **Square corners** on everything: controls, inputs, overlays, badges
  (base-sera's `rounded-none`). Only app icons are rounded.
- **No boxes.** Sections are split by 1px divider lines (`border`), not by
  cards, background fills or shadows. A shadcn `Card` used as a section loses
  its background, shadow and ring (zeiteisen's `Section`).
- Only overlays float: dialogs, popovers, menus and toasts on `popover`, with
  a 1px ring of `foreground` at 10 % and a medium shadow.
- Inputs are an underline (`input`, `ring` while focused): no box, no
  horizontal padding.
- Buttons are 40px high (`sm` 36px, `xs` 28px, `lg` 44px); variants as
  shadcn ships them: default (`primary`), outline, secondary, ghost,
  destructive, link.
- Focus: border `ring` plus a 2px ring of `ring` at 30 %. Disabled: 50 %
  opacity.

## Spacing

- Tailwind's 4px scale.
- **One spacing unit around every divider: 24px**, on both sides. Change the
  paddings together so edges stay aligned.

## App shell

- Full width, no max-width container.
- **No header.** Logo, name and version sit in the desktop footer and on the
  phone's Settings page; an `sr-only` `<h1>` keeps the page titled. The
  version (from `package.json`, put in at build time) tells which deploy a
  browser runs.
- **Desktop** (`desktop:` variant: width ≥ 64rem AND height ≥ 600px): the
  whole app in one viewport, no page scroll, sections scroll inside
  themselves. What only cares about width keeps `lg:` / `md:`.
- **Below it** (phones, short laptops): a fixed bottom tab bar, a 20px icon
  over the label per tab. The active tab is marked by a `primary` line on the
  bar's divider, not by a filled button. The last tab, Settings, is the
  desktop footer as a page. The current view's controls dock just above the
  bar, within thumb reach. Page, bar and toasts pad by
  `env(safe-area-inset-*)` (needs `viewport-fit=cover` in the viewport meta).
- Desktop footer: logo, name and version first, the language switcher last.
- Settings page: one titled section per topic, language first, about (name,
  version) last; its items are full-width outline buttons.
- Transient feedback is a toast, never a panel; toasts sit above the tab bar.

## Language

- German and English, following the browser.
- The only switchers: small `EN` / `DE` ghost buttons in the desktop footer
  and, on the Settings page, a toggle group of the languages named in
  themselves (English, Deutsch). Never in a header.

## Icons

- [lucide](https://lucide.dev) (`lucide-react`, or the plain SVGs), as
  shipped. 14px in buttons (base-sera's default), 20px in the tab bar.
- An icon-only button carries an accessible name.

## Documents (PDF, LaTeX, slides)

The same rules on paper: light mode, Inter (or the toolchain's sans-serif),
red as the only accent ([`dist/ohmtools-colors.sty`](dist/ohmtools-colors.sty)
for LaTeX), no uppercase or letter-spaced labels, divider lines instead of
boxes, square corners.

## App icon, favicon, link preview

The only places with colours of their own.

- **App icon** ([`assets/app-icon.svg`](assets/app-icon.svg) as template):
  512 × 512, a squircle backdrop (`rx` 112) with a vertical gradient
  `#1E232D` → `#101216` and a 1.5px white rim at 12 % opacity. The glyph is
  drawn in metal (`#F5F5F4` → `#D6D3CE` → `#8C8884`), dark faces (`#262B35`
  → `#12151A`), red (scarlet `#E23A46` → `#9E0711`, maroon `#9E0711` →
  `#5C040A`) and white, and stays inside the maskable safe zone: a circle of
  40 % radius around the centre.
- **Favicon**: the glyph alone, no backdrop (`viewBox` cropped to it).
- PNGs rendered from the SVG: `apple-touch-icon.png` 180 × 180 full-bleed
  (square backdrop, no rim: iOS rounds the corners itself and paints
  transparency black; iOS reads only this `<link>`, never the manifest),
  `icon-192.png` and `icon-512.png` as drawn, `icon-maskable-512.png`
  full-bleed (Android crops it to its own shape).
- Web app manifest: `background_color` is the light `primary`, `#c10007`
  (the splash screen).
- **Link preview** (Open Graph image): 1200 × 630 PNG under 300 KB (WhatsApp
  takes no SVG and nothing bigger), the icon's backdrop gradient, an 8px
  `primary` bar along the top edge, glyph and app name in white bold Inter,
  the tagline in white, secondary text in `#D6D3CE`, red tints for
  illustration. German only: a URL has one card, it cannot follow the
  viewer's language.

## Accessibility and checks

- Respect `prefers-reduced-motion` for flashes, scrolling and animation.
- Check every visible change at 360px and 400px wide (phones) and at 1440px
  (desktop), in German and English, in light and dark mode.

## Colours

Every token, as sRGB hex (the tokens themselves are OKLCH). Use the names,
never the values.

<!-- tokens:begin (generated by npm run build) -->

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#ffffff` | `#0a0a0a` | Page background. |
| `foreground` | `#0a0a0a` | `#fafafa` | Text and icons on the background. |
| `card` | `#ffffff` | `#171717` | Card surface. Sections drop it (no boxes), so it is rarely seen. |
| `card-foreground` | `#0a0a0a` | `#fafafa` | Text on card. |
| `popover` | `#ffffff` | `#171717` | Floating surfaces: dialogs, popovers, menus, toasts. |
| `popover-foreground` | `#0a0a0a` | `#fafafa` | Text and icons on popover. |
| `primary` | `#c10007` | `#9f0712` | The one accent colour: main action, active marks, links, data tints. |
| `primary-foreground` | `#fef2f2` | `#fef2f2` | Text and icons on primary and on its tints. |
| `secondary` | `#f4f4f5` | `#27272a` | Secondary buttons. |
| `secondary-foreground` | `#18181b` | `#fafafa` | Text on secondary. |
| `muted` | `#f5f5f5` | `#262626` | Subtle fills: hover and open state of ghost and outline controls. |
| `muted-foreground` | `#737373` | `#a1a1a1` | Secondary text: descriptions, hints, captions, trailing notes. |
| `accent` | `#f5f5f5` | `#262626` | Highlighted item in menus, lists and selects (hover, keyboard focus). |
| `accent-foreground` | `#171717` | `#fafafa` | Text on accent. |
| `destructive` | `#e7000b` | `#ff6467` | Destructive actions and errors: text, and tinted fills at 10-30 %. |
| `border` | `#e5e5e5` | `#ffffff1a` | Divider lines and borders. |
| `input` | `#e5e5e5` | `#ffffff26` | Underline of inputs, outline of controls. |
| `ring` | `#a1a1a1` | `#737373` | Focus indication. |
| `chart-1` | `#ffa2a2` | `#ffa2a2` | Chart series 1 (lightest red). |
| `chart-2` | `#fb2c36` | `#fb2c36` | Chart series 2. |
| `chart-3` | `#e7000b` | `#e7000b` | Chart series 3. |
| `chart-4` | `#c10007` | `#c10007` | Chart series 4. |
| `chart-5` | `#9f0712` | `#9f0712` | Chart series 5 (darkest red). |
| `sidebar` | `#fafafa` | `#171717` | shadcn sidebar background. |
| `sidebar-foreground` | `#0a0a0a` | `#fafafa` | Text on sidebar. |
| `sidebar-primary` | `#e7000b` | `#fb2c36` | Primary inside the sidebar. |
| `sidebar-primary-foreground` | `#fef2f2` | `#fef2f2` | Text on sidebar-primary. |
| `sidebar-accent` | `#f5f5f5` | `#262626` | Highlighted sidebar item. |
| `sidebar-accent-foreground` | `#171717` | `#fafafa` | Text on sidebar-accent. |
| `sidebar-border` | `#e5e5e5` | `#ffffff1a` | Sidebar borders. |
| `sidebar-ring` | `#a1a1a1` | `#737373` | Focus indication inside the sidebar. |
| `tint-1` | `#9f1214` | `#7e1817` | Tint step 1 of primary, for data told apart by colour. |
| `tint-2` | `#7f1d19` | `#5f1d19` | Tint step 2 of primary, for data told apart by colour. |
| `tint-3` | `#5f201b` | `#401c19` | Tint step 3 of primary, for data told apart by colour. |

<!-- tokens:end -->
