# ohmtools design

One look for every ohmtools app, web page and document. The values live in
[`tokens/`](tokens/), this file holds the rules. The reference implementation
is [zeiteisen](https://github.com/ohmtools/zeiteisen) since its redesign:
where an app and this file disagree, this file wins and the app gets fixed.

## Basis

- [shadcn/ui](https://ui.shadcn.com) with style `base-vega` (Base UI
  primitives, not Radix), base colour Neutral, icons lucide, fonts Geist and
  Geist Mono. Config: [`shadcn/components.json`](shadcn/components.json),
  theme: [`shadcn/index.css`](shadcn/index.css).
- **The design's own theme on shadcn's components**: OLED black and white
  grounds, a neutral `primary`, red (`accent-red`) as the one accent, data
  coloured by kind. The theme lives in `src/index.css` only; components keep
  shadcn's classes apart from the hand-edits listed under "Components".
  Components that more than one app needs are shared from
  [`shadcn/src/`](shadcn/src/) ("Shared components").
  Tailwind for layout plus the semantic tokens (`text-muted-foreground`,
  `border`, `bg-red`, `text-warning`); no raw colours in app code.
- Projects without shadcn (plain web pages, LaTeX, anything else) rebuild the
  same look from the tokens ([`dist/`](dist/)) and the rules below.

## Colour

- **Grounds are black and white**: `background` white, OLED black (`#000`)
  in dark mode; `card`, `popover` and `surface` one step above it.
- **`primary` is neutral**: the main action is black on light, white on
  dark. Everything else is grey.
- **Red is the one accent** (`accent-red`, `bg-red` / `text-red`, the same
  `#dc2626` in both modes), and only for what must stand out: today, the
  now-line, the picked day, the app tile, a dot for "update waiting", and the
  fill of destructive buttons. Never decoration, never a second red.
- **In documents and reading pages red marks what is added** to an original
  text or to a task: an added passage ("Ergänzung"), a solution, a mark drawn
  into a figure or a form. Original text and original figures carry no red.
  See "Documents" and "Reading pages".
- Red text uses `destructive` (`#dc2626` light, `#ef4444` dark, readable on
  black); red fills, lines and dots use `accent-red`.
- `destructive`: red text for errors, invalid fields and destructive menu
  items. A destructive **button** is filled `accent-red` with
  `accent-red-foreground`.
- `warning`: amber text for hints and warnings ("partly picked", a broken
  rule), one line per kind of warning; never a fill, never a counter.
- **Data told apart by colour** (zeiteisen's lecture kinds, series,
  categories) uses the data colours, a fill plus a 1px border each, in this
  order: `kind-su` neutral, `kind-ue` blue, `kind-pr` orange, `kind-tu` teal,
  `kind-s` violet, `kind-wf` lime. Text on them is `foreground`, with
  `block-kind` and `block-room` for the second and third line. The names are
  zeiteisen's; other apps use the same tokens in the same order.
- **Curves in a plot are series too** (faltung's f, g and their product,
  user decision): each takes a data colour in the same order, its border
  colour for the line and its fill for a shaded area under it; a result drawn
  from them is `foreground`. `chart-1` … `chart-5` are shades of red, so
  they stay out of a plot that carries a red mark (a now-line, a playhead):
  they would read as the accent.
- **Colour is never the only cue**: the kind, name or label is written on
  the block itself; a plot's curves are named where they are entered or
  listed, each name with a short stroke in its colour before it (no legend
  box), and a shaded area has a second cue (hatching in its border colour
  over its fill).
- **Plots in apps** (faltung, user decisions 2026-10-25):
  - **Every line solid.** No dashed or dotted lines, above all none that
    move: a dash pattern crawling along an animated curve is confusing. What
    is secondary (a curve before a change, the part of a result not reached
    yet) is thinner and `ring`, not dashed.
  - **Nothing written inside the plot**: no curve labels, no values, no
    legend. Numbers only on the axes, mono 12px `hour`; a second y axis on the
    right when one curve has another unit.
  - **No empty space**: the value range ends just above the largest value
    and at 0 unless something is negative; the plot fills the height it is
    given.
- Lines inside a grid or chart are `grid` (fainter than `border`), their
  labels `hour`, in mono.
- A mark drawn over coloured content (the now-line over blocks, faltung's
  playhead over its curves) is `accent-red` with a dot at its start, so it
  never vanishes in a fill.

## Light and dark

- Both modes, always; the device decides (`prefers-color-scheme`), also when
  it changes while the app is open. **No theme toggle.**
- No white flash: the mode is set before the first paint. shadcn apps: a
  blocking `<script src="/dark.js">` in `<head>` (a file, not inline, so the
  CSP needs no hash) sets the `.dark` class, a `ThemeProvider` keeps it in
  sync. Plain pages: `dist/tokens.css` switches by media query alone. A page
  shipped as one file with no CSP of its own (a Claude.ai artifact,
  lernhelfer-skript) inlines the same script.

  ```js
  // public/dark.js
  document.documentElement.classList.toggle(
    "dark",
    matchMedia("(prefers-color-scheme: dark)").matches,
  );
  ```

- `<meta name="color-scheme" content="light dark">` and one `theme-color`
  per scheme with the `background` token: `#ffffff` light, `#000000` dark.
- Print and PDF are light.

## Typography

- **Geist** for text and headings (`--font-heading` is `--font-sans`),
  **Geist Mono** only for times, rooms, dates, week numbers, group numbers,
  version numbers and file endings (documents and reading pages add the
  numbers named there: points, pages, values, chapter and equation
  numbers). Bundled with the app
  (`@fontsource-variable/geist`, `@fontsource-variable/geist-mono`), never
  from a font CDN: apps run offline. Other toolchains use Geist where they
  have it, else their sans-serif.
- Three sizes, 16px only for headings and inputs on phones:

  | Use | Size | Weight |
  | --- | --- | --- |
  | Heading of a page, panel or section | 16px (`text-base`) | semibold (dialog and sheet titles: base-vega's medium) |
  | Controls, lists, tabs, menu items, body text | 14px (`text-sm`) | medium for controls, normal for text |
  | Blocks in a grid, times, hints, captions, badges | 12px (`text-xs`) | normal or medium |
  | Input, text area | 16px on phones (keeps iOS from zooming in), 14px from 768px (`text-base md:text-sm`) | normal |

- An app sets `text-sm` on its root, so text without a size of its own is
  14px, never the browser's 16px (faltung's pages fell back to 16px and read
  too large next to zeiteisen). Formulas (KaTeX) scale with it.
- Reading pages (long text, see "Reading pages") and documents add larger
  headings for their content; the shell around them keeps the three sizes.
- **No uppercase text and no wide letter spacing** (`uppercase`,
  `tracking-wider`, `tracking-widest`). Strip them after every `shadcn add`.
- Codes and names are never cut short or broken inside a word; what does not
  fit is collected ("+n"), not truncated.
- A name inside a sentence is quoted in the text itself: English “…”, German
  „…“. Not in titles, button labels or file names.
- **No counters and no legends**, except where a number tells things apart
  ("14 of 40 picked", "2 own").

## Shape and surfaces

- Three radii, from `--radius` (10px): **6px** (`rounded-sm`) blocks,
  badges, tab fields; **8px** (`rounded-md`) buttons, inputs, menus,
  popovers; **10px** (`rounded-lg`) grid frames, dialogs, drawers and sheets
  (their free corners). App icons have their own (see below).
- **No boxes.** Sections are split by 1px divider lines (`border`), not by
  cards, background fills or shadows. Structure comes from lines and space.
- Only overlays float: popovers, menus, dialogs, drawers, sheets and toasts,
  all alike as frosted glass (`popup-glass`): `popover` at 72 % over a
  backdrop blurred by 24px (saturation 150 %), a 1px ring of `foreground` at
  30 % (sheets and drawers: a border of it on their free edge) and a large
  shadow (`black` at 15 %, 60 % in dark mode). Lines, fields and hovers
  inside are tints of `foreground` (`border` 12 %, `input` 15 %, `muted`
  6 %, `accent` 8 %) so they show on the glass. Why: a popover on an iPad
  (no scrim behind it) on `#0a0a0a` with a 10 % ring stood out too little
  from the black grid (user decision, 2026-10-25, against a lighter opaque
  surface and a stronger edge alone). Behind dialogs, drawers and sheets
  still a plain scrim, `black` at 40 % (70 % in dark mode), no blur.
- Inputs are base-vega's: a 1px `input` border, `rounded-md`, 36px high,
  a faint `input` fill in dark mode.
- Tabs: a `muted` track; the picked tab is one indicator (`background` with a
  small shadow, in dark mode an `input` border on `input` at 30 %) that glides
  from tab to tab. The tabs themselves stay flat.
- Buttons: **ghost unless they are the main action** (default = `primary`),
  outline and secondary where shadcn uses them, destructive filled red.
  Ghost buttons in a list sit flush with the text beside them. Heights: 36px
  (`h-9`, default) on iPad and desktop, 40px on phones, 44px in a phone's
  drawer; `sm` 32px, `xs` 24px. Icon buttons of one row stand without gaps,
  in headers 8px apart. An open panel's or pressed toggle's button is filled
  `accent`.
- Focus: border `ring` plus a 3px ring of `ring` at 50 %. Disabled: 50 %
  opacity.

## Spacing

- Tailwind's 4px scale.
- **One spacing unit around every divider: 24px, 16px on phones**, on both
  sides, plus the safe areas. Change the paddings together so edges stay
  aligned.
- 16px between groups, 8px within one. Dense content (blocks in a grid) 2px
  apart, padded `py-1 px-2`.

## App shell

- Full width, no max-width container. **Every step is exactly one viewport
  tall, the page never scrolls**: content, panels and pages scroll inside
  themselves.
- **Every region that scrolls is `relative`.** An absolutely positioned
  element inside it without a positioned ancestor (`sr-only` text in a
  button is one) is laid out against the document, escapes the region's
  clipping and makes the document taller; `scrollIntoView` then scrolls the
  document and the header leaves the screen (found in lernhelfer-skript,
  2026-10-25). Check that `document.documentElement.scrollHeight` equals
  `innerHeight` on every view.
- **Three steps, the same content in other containers** (the `compact:`,
  `wide:` and `short:` variants in `shadcn/index.css`; in script `useStep()`
  from `steps.ts`, see "Shared components"):

  | Step | When | Devices | Layout |
  | --- | --- | --- | --- |
  | Narrow (base) | below 40rem | phones upright, narrow windows | one column; header on top, the view's tabs and controls in a bar at the bottom, within thumb reach; panels and settings are pages of their own with a back arrow; every popup is a drawer |
  | Compact (`compact:`) | from 40rem, or under 600px height in landscape | phones turned sideways, iPads upright (744–834px), small laptops | one header row with everything; panels as a 380px sheet from the right, over the content; popups; settings a page |
  | Wide (`wide:`) | from 64rem AND 700px height | large iPads upright (1024px), iPads in landscape, desktops | panels as a 340px sidebar beside the content, closable; settings a dialog |

  Wide only where the content and the sidebar fit side by side: at 1024px a
  week of five days plus the 340px sidebar fit, at 834px they do not (user
  decision, 2026-10-25). 700px: a laptop with about 650px under the browser's
  bars is a small laptop and takes the compact step. iPads upright take the
  compact step, not the phone's: their width holds the whole content, and
  popups at the element are what iPads do. Orientation counts only for
  `short:`; a tall, narrow desktop window takes the step of its width. Put
  `interactive-widget=resizes-visual` into the viewport meta, so the
  on-screen keyboard never changes the step.

  `short:` (under 600px height in landscape) lowers the header and puts less
  in each line. What only cares about width keeps `lg:` / `md:`.
- **A header**, 56px (48px on `short:` screens): left the app tile (red,
  with the name) or what the view belongs to, then the view's tabs and
  navigation from compact on; right the panels' icon buttons, then the
  settings last. When one row does not hold everything on a compact screen
  that is not `short:` (an iPad upright in German), the view's switches move
  to a second row under it; on `short:` screens the row puts less in each
  part instead. The page has one `<h1>`, `sr-only` if nothing shows it.
- **Settings are never a panel**, so an app can grow its settings without
  crowding a sidebar: a dialog on wide screens, a page on phones and compact
  screens (user decision, 2026-10-25). One section per topic, the same
  sections on every step: "General" first (the language as tabs, the
  languages named in themselves; what else concerns the whole app), "About"
  last (name, version in mono, GitHub link, debug info). The version (from
  `package.json`, put in at build time) tells which deploy a browser runs.
  `SettingsDialog` and `SettingsPage` build both (see "Shared components").
  - Wide: a centred dialog of up to 1000×720, at least 24px off the
    screen's edges, frosted glass like every popup. Left the sections,
    240px: the title "Settings" over ghost buttons with an icon, the open
    one filled `accent` and semibold (`aria-current="page"`), a `border`
    line on their right. Right the open section's title (16px semibold)
    with the close button, its content below, scrolling inside the dialog.
    Groups within a section are split by lines, 24px around each. Dialogs
    the settings open stand over them.
  - Narrow and compact: a page in place of the view (back arrow, title
    "Settings"), listing the sections as 56px rows: a 20px muted icon, the
    name, what is set now muted at the right (language, mode, version in
    mono), a chevron; lines between the rows from the name on. A section
    opens as a page one level deeper; its back arrow returns to the list.
- Page, header, bars, sheets and toasts pad by `env(safe-area-inset-*)`
  (needs `viewport-fit=cover` in the viewport meta).
- Transient feedback is a toast (sonner), never a panel: on phones above the
  bottom bar, elsewhere bottom right.
- Every state has a way forward: an empty state names what to do with its
  buttons right there, an error offers "Try again". Destructive buttons are
  red and stand next to "Cancel".

### Elements by step

Each step has its own elements for the same job; an element of one step
never shows up on another (user decision, 2026-10-25). **No popups on
phones, no drawers from compact on, no sidebar on phones, no pages of their
own on wide screens** except the views behind tabs.

| Element | Narrow | Compact | Wide |
| --- | :---: | :---: | :---: |
| Drawer from the bottom | ✓ | ✗ | ✗ |
| Popup: popover, menu, a select's list, dialog, question | ✗ | ✓ | ✓ |
| Sidebar | ✗ | ✓ a sheet from the right over the content, 380px, full height | ✓ beside the content, 340px |
| Page of its own (a panel, the settings) | ✓ | settings only | ✗ |
| Views behind tabs | ✓ in the bar at the bottom | ✓ in the header | ✓ in the header |
| Editing in the page | ✓ where it fits, else a drawer | ✓ where it fits, else a sheet from the right | ✓ |
| Expanding in the page | ✓ | ✓ | ✓ |
| Toast | ✓ above the bar at the bottom | ✓ bottom right | ✓ bottom right |
| Bar at the bottom | ✓ | ✗ | ✗ |
| Header with everything | ✗ | ✓ | ✓ |
| Tooltip, hover | ✗ | with a mouse (`hover: hover`) | ✓ |
| Keyboard shortcuts | ✗ | with a keyboard | ✓ |
| Swipe gestures | ✓ | with touch, always also a button | ✗ |

Their counterparts, wide and compact on the left, phones on the right:

| Wide and compact | Narrow |
| --- | --- |
| Popover, menu, a select's list | drawer from the bottom |
| Dialog, question | drawer from the bottom |
| Editing in the page that does not fit | drawer from the bottom |
| Sidebar (compact: sheet from the right) | page of its own |
| Settings dialog (wide) | page of sections, each a page |
| Tabs in the header | tabs in the bar at the bottom |
| Toast bottom right | toast above the bar at the bottom |
| Tooltip, keyboard shortcut | reachable another way: shown, in a drawer, on a page |
| A button | a swipe gesture (the button may stay) |

- Input, not layout: a compact screen is a phone turned sideways (touch) or
  a small laptop (mouse). Tooltips and hover follow `hover: hover`, touch
  targets and gestures `pointer: coarse`, never the step.
- Compact screens in landscape keep `env(safe-area-inset-left/right)` (the
  camera and the corners of a phone turned sideways) on header, sheets and
  content. A phone's keyboard covers most of a landscape screen: fields go
  to the top of a sheet or dialog.

### Which group

What the person does picks the group; the group brings the element of each
step.

| Group | Narrow | Compact | Wide |
| --- | --- | --- | --- |
| **View** (tabs) | bar at the bottom | header | header |
| **Editing in the page** | in the page where it fits, else a drawer | in the page where it fits, else a sheet from the right | in the page |
| **Panel** | page of its own | sheet from the right | sidebar |
| **Area** (settings) | page of sections | page of sections | large dialog |
| **Toast** | above the bar | bottom right | bottom right |
| **Expanding** | in the page | in the page | in the page |
| **Popup** | drawer | popover, menu, dialog, question | popover, menu, dialog, question |

Ask in this order; the first yes decides:

1. A main view of equal rank that is used on its own (faltung's animator,
   guide, properties)? **View.**
2. The point of the view, changed often, taking effect at once (faltung's
   formulas)? **Editing in the page.** It fits when it takes at most two
   lines and what it changes stays in sight; else it goes into a drawer
   (narrow) or a sheet from the right (compact), `EditorSheet`.
3. Used beside the content, for longer and again and again (zeiteisen's
   groups and notes)? **Panel.**
4. An area of its own with sections, visited rarely, not needing the content
   in sight (the settings)? **Area.**
5. Feedback on something that already happened ("Link copied")? **Toast.**
6. Extra information in its place that should block nothing (the function
   reference inside faltung's editor)? **Expanding.**
7. Anything else, short, once, then back to the content? **Popup**, below.

Where they meet: stays open while the person goes on working in the content
→ panel; closed after one thing → popup. Must be seen together with the main
content → panel; replaces it → view. Changed every time → in the page; now
and then → popup.

### Popups

| Kind | When | Leaving it |
| --- | --- | --- |
| **Menu** (`ResponsiveMenu`, `ResponsiveSelect`) | a list of actions, or one choice that closes once picked | closes |
| **Popover** (`ResponsivePopover`) | details or small settings of one element, taking effect at once | closes |
| **Dialog** (`ResponsiveDialog`) | a task with an end: inputs count only with the main button; or reading too long for a popover | runs Cancel, or nothing |
| **Question** (`ResponsiveAlertDialog`) | before something that cannot be undone | runs Cancel |

- **Leaving without choosing** (a swipe down, a press outside, Esc, the back
  gesture, the close button): a popup with Cancel runs Cancel, without
  asking; a popup without Cancel does nothing and waits for its buttons, and
  shows no swipe handle (user decision, 2026-10-25). Menus, popovers,
  selects and editors that apply at once lose nothing by closing: closing
  is their Cancel.
- **Undo before questions**: deleting what can be brought back shows a toast
  with "Undo" instead of asking; the question stays for what cannot be
  undone.
- The main button: in a drawer on top, full width, 44px; in a dialog bottom
  right. Red only when it destroys something, next to Cancel.
- **At most one level on top**: over a panel, a page or the settings a
  popup; over a popup only a dialog or a question (on phones a second
  drawer, stacked). Never three.
- Popups scroll inside themselves. On phones a dialog longer than one screen
  or with several steps becomes a page of its own.
- Drawers: the content starts 16px under the swipe handle and keeps the
  bottom safe area; buttons 44px.

## Motion

The app moves where state changes, never for decoration.

- **One easing, `cubic-bezier(0.2, 0, 0, 1)`** (fast out, gentle landing),
  at half the usual speed (user decision, 2026-10-25: movement should be
  easy to follow): 560 ms coming in, 400 ms going out
  (`motion.duration-in`, `motion.duration-out`); shadcn's own popups (100 ms)
  take 200 ms. A drawer comes in in 560 ms on its own easing and leaves at
  the speed of the swipe.
- An animation that explains something (faltung's guide building a step: a
  curve mirrored, shifted, an area filling) plays once when its state
  changes, 1–2.5 s, easing in and out so the eye can follow.
- Without a library: the browser's View Transitions where the layout changes
  (a sidebar opening, a phone page coming in), the Web Animations API where
  something only slides in, CSS for the rest.
- Pages and panels come in from the right and go back to the right; content
  that changes in a direction (next week, next day) slides in from that side,
  24–48px, fading in. Only the incoming state moves.
- Picked marks glide (the tab indicator, a picked day); new items fade and
  zoom in a little; a press gives a little (a button moves down 1px, a block
  shrinks), hover lifts a colour a little.
- A live mark may pulse slowly (the now-line's dot). Nothing else loops.
- Scrolling to a place on the view already shown is smooth; jumping to a
  place on another page is instant, and the target is held in place while
  the new page settles (drawings, charts and images that measure themselves
  after mounting move it), for at most a second and only until the user
  scrolls (wheel, touch, pointer).
- A view sliding in sideways inside a scrolling region clips the region
  sideways (`overflow-x: hidden`) while it moves, else a horizontal
  scrollbar flashes; of overlapping slides only the last one releases it.
- A View Transition names its parts (`view-transition-name`) only while it
  runs (`html[data-transition]` set for its duration, zeiteisen's
  `src/motion.css`). For a sidebar the old shot of the page is hidden and
  the new one stands at once; only the sidebar slides (a crossfade of the
  page's two widths shows every line twice).
- **`prefers-reduced-motion`: no movement anywhere**, the app's own or
  shadcn's; state changes still show, at once (the rule at the end of
  `shadcn/index.css`).

## Language

- German and English, following the browser.
- The only switcher: tabs in the settings, the languages named in themselves
  (English, Deutsch). Never in a header.

## Icons

- [lucide](https://lucide.dev) (`lucide-react`, or the plain SVGs), as
  shipped, 16px (`size-4`, base-vega's default); muted in lists, foreground
  in headers.
- An icon-only button carries an accessible name.

## Components

### Shared components

Every component more than one app needs lives once, in
[`shadcn/src/`](shadcn/src/), at the path it takes in an app:

- `components/ui/`: shadcn's components with the hand-edits below
  (zeiteisen's; `dropdown-menu` and `tooltip`, which zeiteisen does not
  use, from shadcn's output with the same hand-edits).
- `components/ohmtools/`: the design's own. The popups of "Elements by
  step", each a drawer on phones and its popup from compact on, with the
  rule for leaving it: `ResponsiveDialog`, `ResponsiveAlertDialog`,
  `ResponsivePopover`, `ResponsiveMenu`, `ResponsiveSelect` (all on
  `PhoneDrawer`); `EditorSheet` for editing that does not fit into the page;
  `PanelSheet` and `PanelHeader` for panels and pages; `SettingsDialog`,
  `SettingsPage` and `LanguageTabs`; `BottomBar`, `AppToaster`,
  `ThemeProvider`, `GitHubLink`. Texts come in as props (`closeLabel`,
  `backLabel`, titles), in the app's language.
- `lib/ohmtools/`: `steps.ts` (the step queries and `useStep()`),
  `motion.ts` (the easing, view transitions, `slideIn`, `easeInOut`),
  `bottom-bar-height.ts` (`--bottom-bar`).

An app copies them with `npx --yes github:ohmtools/design add <name>…`
(`--all`, `list`), which also copies what they import and names the npm
packages still to install; the app brings `@/lib/utils` (`cn`) from
`shadcn init`. A copy starts with a marker naming its source and is never
edited in the app: `ohmtools-design check` fails when it differs, and a
change goes into the design first, for every app. Apps leave the copies out
of their formatter.

### Hand-edits

shadcn generates the components in `components/ui/`; these hand-edits are
part of the design (zeiteisen's `src/components/ui/NOTES.md`) and go back in
after every regeneration:

- `uppercase` and `tracking-wider` / `tracking-widest` stripped.
- `Button` variant `destructive`: filled red, `bg-red text-red-foreground
  hover:bg-red/90`.
- `AlertDialogCancel` defaults to `ghost`.
- The overlays of `Dialog`, `AlertDialog`, `Sheet` and `Drawer`: a plain
  scrim, `bg-black/40 dark:bg-black/70`, no blur.
- `popup-glass` instead of `bg-popover` (and shadcn's shadow) on
  `PopoverContent`, `DialogContent`, `AlertDialogContent`, `SheetContent`,
  `DrawerContent` (its bleed the same glass colour) and `SelectContent`
  (its `before:` blur layer removed); the ring `ring-foreground/30`, on
  sheets and drawers `border-foreground/30`. Sonner's toasts:
  `--normal-bg` the glass colour, `--normal-border` `foreground` at 30 %,
  `popup-glass` on the toast.
- `DialogContent`: centred from `compact:` on, at most 28rem. Below
  `compact:` it falls back to a sheet from the bottom edge, full width,
  scrolling inside itself; apps never show it there (phones get a drawer,
  `ResponsiveDialog`). `DialogFooter` stacks below `compact:` (main button
  on top) and is a row from there. `DialogHeader` carries `pr-10` for the
  close button.
- `DialogContent` and `SheetContent` take `closeLabel`, the close button's
  name in the app's language.
- `Drawer`: free corners 10px, 560 ms in on its own easing (a swipe's close
  keeps its own speed), `popup-glass` with its bleed in the same colour.
- `DropdownMenuContent`, `TooltipContent`, `PopoverContent`, `SelectContent`
  and the centred dialogs: 200 ms.
- `TabsList` (default variant): one indicator span glides to the active tab;
  the active tab has no fill, border or shadow of its own.
- `Checkbox`: a minus for `indeterminate`.
- `sonner`: `theme="system"`, no `next-themes`.

## Documents (PDF, LaTeX, slides)

The same rules on paper, in the style of a datasheet: tables, lines and
plain type. The reference is the Lernhelfer's worksheet
(`ohmtools/claude-plugins`, `lernhelfer/skills/lernen/vorlagen/`).

### Basics

- Light only, white paper. Colours only by token name
  ([`dist/ohmtools-colors.sty`](dist/ohmtools-colors.sty) for LaTeX).
- Geist for text (the toolchain's sans-serif where it has no Geist, e.g.
  Helvetica in pdfTeX). Geist Mono (else the toolchain's monospace) for
  numbers read as data: points, page numbers, times, dates, values with
  units in tables, file names. Labels and words stay in Geist.
- Formulas in the toolchain's math font (italic variables, upright units and
  numbers, `,` as decimal mark), never in Geist.
- **No frame around the page, no coloured bars or bands, no boxes, no
  fills.** Structure comes from lines and space: 1px `foreground` lines for
  the strong edges (under the running head, above the footer, under a table
  head, at a table's end), 1px `border` lines between rows and parts.
- Radii as in the app: 6px for badges and number tiles, 4px for check boxes.
- Badges: 12px medium, 20px high, 8px side padding, 6px radius. Outline
  (1px `border`) for facts ("10 Punkte"), secondary (`muted` fill, `border`)
  for "Angabe", **filled `accent-red` with `accent-red-foreground`** for
  "Lösung" (and "Ergänzung" on reading pages). No other badge is red.

### Running head and footer

- Head: left "OhmTools" in semibold with the product in `muted-foreground`
  ("OhmTools Lernhelfer"); right the kind of document in `muted-foreground`
  ("Übungsblatt") and the badge of the sheet ("Angabe" or "Lösung"). A 1px
  `foreground` line below, 2mm (8px) under the badge's lower edge; the badge
  never touches it.
- Footer: a 1px `foreground` line above; left the subject and the sheet in
  `muted-foreground` ("Grundlagen der Elektrotechnik · Angabe"), right
  "Seite 2 / 5" with the numbers in mono, `foreground`.

### Cover sheet

- Title (the subject) 46px (about 34pt) bold, tracking slightly tight
  (-0.025em), then a muted line "Übungsblatt · 4 Aufgaben · 24 Punkte" at
  18px.
- Below it two columns, 40px apart:
  - "Auf einen Blick" (200px): rows split by `border` lines, each a 12px
    muted label above its value: Bearbeitungszeit, Gesamtpunkte, Aufgaben
    (values mono 18px medium), Hilfsmittel (text), Erstellt (date and time
    mono).
  - The tasks as a table "Nr. | Aufgabe | Punkte | Erreicht", the last
    column left empty to fill in; a "Summe" row in bold whose "Erreicht"
    cell is a 2px `accent-red` line to write on. Below it "Hinweise" as a
    list with 6px round `ring` bullets.
  - Section headings of the cover sheet ("Auf einen Blick", "Hinweise"):
    14px bold with a 2px `accent-red` line below.

### Task pages

- Head of a task: "Aufgabe 1" 12px muted (number mono), the title 28px bold
  with tight tracking, right an outline badge "10 Punkte".
- Text 14px. Given values as a table "Symbol | Bedeutung | Wert" (symbol in
  the math font, values mono and right-aligned), then a line "Gesucht" with
  the quantities. A figure goes to the right of it, with the caption
  "**Abb. 1** RC-Glied beim Aufladen" (number semibold `foreground`, text
  muted, 12px).
- Parts one below the other, split by `border` lines with 14px above and
  below: the letter in a 22px tile (`primary` fill, `primary-foreground`,
  6px radius, 12px semibold), the question, right the points "2 P" (mono
  12px).
- Answer formats: radio circles 16px and check boxes 16px (4px radius), both
  with a 1.5px `foreground` outline; tables to complete with empty cells;
  diagrams on millimetre paper (below).
- No written hints on the sheet or in the solution.

### Solutions

- A solution stands right below its part, indented to the question text.
  It starts with the "Lösung" badge (red); further lines of the same part
  align with it without repeating the badge.
- The working in the math font in `foreground`; the result bold in
  `destructive`; the points of each step at the right in mono 12px,
  `destructive`.
- Marks in red (`accent-red`): the cross in a check box, the dot in a radio
  circle (8px), missing table values (semibold, `destructive`), and
  everything drawn into a diagram: the curve 2px, construction lines 1px
  dashed, a 3.5px dot with a direct label ("τ = 47 ms").

### Figures

- Diagrams to draw into are millimetre paper: minor lines `grid`, major
  lines (every fifth) `border`, axes 1.2px `foreground` with filled arrow
  heads, tick labels mono 12px `hour`, axis labels in the math font
  ("*t* in ms"). Check `grid` on a printout; if it vanishes, the minor lines
  get the `border` colour and the major ones `ring`.
- Circuits after DIN EN 60617 (the worksheet's rules), 1.5px `foreground`,
  labels in the math font, voltage and current arrows straight with filled
  heads.
- Curves in `foreground`, a second one dashed; no legend, labels at the
  curve.

## Reading pages

Web pages that are read rather than worked in: the Lernhelfer's scripts
(`ohmtools/lernhelfer-skript`), one chapter per page, original text plus what
the Lernhelfer adds. The app shell, components and colours stay as above;
these rules come on top.

### Shell

- Header (56px, 48px on `short:` screens): the title of the script (16px
  semibold), an outline badge "Kapitel 2 / 3", then on the right the view's
  tabs "Mit Ergänzungen | Nur Original" (`TabsList`) and the icon buttons
  "Inhalt" (compact only), "Auf dieser Seite" and "Einstellungen" (settings
  last, an open panel's button filled `accent`). The questions page has no
  sections and so no "Auf dieser Seite" button.
- The three steps of the app shell (user decision, 2026-10-25: the canvas
  shows only wide and narrow):
  - Compact: one column, the header row as above with everything in it, no
    bottom bar. "Inhalt" (search and chapter list as on phones) and "Auf
    dieser Seite" are panels, a 380px sheet from the right; the page at most
    720px wide with 24px side padding. Below `md:` (768px) the chapter
    badge stays in the page's meta line, as on phones, so the title keeps
    room (at 568px the tabs and buttons leave it about 140px).
- Wide: three columns, each scrolling for itself.
  - Left, 280px, `border` line right: a search `Input` in a top section,
    then the chapter list as sidebar buttons (32px, 8px radius, active
    `accent` fill and medium): chapter numbers mono 12px muted, sections
    indented 24px without numbers, the questions page with a red "Ergänzung"
    badge at the right. A muted 12px group label "Kapitel" above.
  - Middle: the page, at most 720px wide with 56px side padding, left
    aligned.
  - Right, 280px: "Auf dieser Seite" (14px medium) over a list with a 1px
    `border` line on its left; the current entry `foreground` and medium with
    a 1px `foreground` line, the others muted; Ergänzungen indented with a
    6px `accent-red` dot; closable like an app's sidebar.
- Narrow: header with the title and a search button; content; a bottom bar
  with the tabs "Skript | Inhalt | Einstellungen" (`TabsList`, 40px, full
  width, safe area below). "Inhalt" holds the search (16px input) with its
  hits and the chapter list (44px rows).
- Settings are the app's settings ("App shell"; user decision, 2026-10-25,
  instead of the canvas's 340px panel): the dialog on wide screens, the page
  of sections on compact ones; on phones the "Einstellungen" tab shows that
  page, without a back arrow (it is the tab's root; the section pages have
  one). Two sections: "Ansicht"
  (radio group "Mit Ergänzungen" / "Nur Original", each with a muted
  one-line description, below it muted "Hell oder dunkel folgt dem
  Gerät."), its row showing the view picked; "Über dieses Skript" last (a
  table: Original with the file name in mono, Umfang, Erstellt in mono, and
  an outline link button "Vorlage auf GitHub" with an external-link icon).
  No language and no version: the page is German only and a document.

### Type

shadcn's typography, for the content only:

| Use | Wide | Narrow |
| --- | --- | --- |
| Chapter heading (h2), 1px `border` line below, 8px gap | 30/36px semibold, tracking -0.025em | 26/32px |
| Section heading (h3) | 24/32px semibold, tracking -0.025em | 20/28px |
| Body text | 16/28px | 16/26px |
| Lead (intro of a page) | 18/28px muted | 16/26px muted |
| Tables, questions' controls, Ergänzung headers | 14/20px | 14/20px |
| Meta lines, captions | 12/20px muted | 12/20px muted |

- Display formulas centred, the equation number right-aligned in mono 12px
  muted ("(2.1)").
- A page break of the original is a meta line "Seite 4 im Original" (number
  mono) followed by a 1px `border` line to the right edge.

### Original and Ergänzung

- Original text and original figures stay unmarked, word for word. A figure
  of the original keeps its look (a scan is inverted in dark mode) and gets
  the caption "**Abb. 2.2** …" (14px, number semibold `foreground`, text
  muted, units mono).
- **Every Ergänzung is a block in the text flow**, never beside it in a
  margin, 24px from the text around it:
  - Header row: the badge "Ergänzung" (`accent-red` fill,
    `accent-red-foreground`), the title in 14px semibold ("Variablen in
    Gleichung 2.1", "Woher die 63 % kommen", "Zur Abbildung 2.2"), at the
    right optionally an outline badge for the kind ("Interaktiv", "Grafik").
    Below it a 2px `accent-red` line, 8px under the text.
  - Content: tables 14/20px, prose 16/28px, a question 16/24px medium.
    "Antwort zeigen" is an outline button (32px).
  - End row, 16px under the content: a 2px `accent-red` line filling the
    width, then "Ende der Ergänzung" (12/20px muted) at the right, 12px
    from the line. Why: readers could not tell where an Ergänzung ended and
    the original went on (user decision, 2026-10-25). Red marks it as the
    Ergänzung's end, apart from a page break's grey line; the words make
    sure colour is not the only sign.
- An annotation of a single word: the word gets a 1.5px dotted `accent-red`
  underline and is a button; it opens a popover (`popover`, ring, shadow,
  8px radius, 280px) headed by the "Ergänzung" badge and "Anmerkung".
- "Nur Original" removes every Ergänzung and annotation; the page then shows
  the original alone.

### Questions page

- At the end of every chapter, one page "Wiederholungsfragen": above the
  heading a meta line with the "Ergänzung" badge and "Zu Kapitel 2 · Das
  RC-Glied", the lead "Antworte erst selbst, dann vergleiche."
- Each question: header row with the number (mono 14px semibold) and an
  outline badge for its kind ("Rechnen", "Erklären", "Auswahl"), the 2px
  `accent-red` line below, the question 16/24px medium.
- Rechnen: an `Input` (mono, 140px) with the unit, a primary button
  "Prüfen". Right: a check icon and "Richtig: 1000 Hz. …" in `foreground`.
  Wrong: the input border `destructive`, an x icon and "Noch nicht. …" in
  `destructive`.
- Erklären: a `Textarea` "Deine Antwort", an outline button "Antwort
  zeigen" / "Antwort verbergen", the answer below with a 2px `border` line on
  its left.
- Auswahl: radio rows split by `border` lines; after a choice an outline
  badge "richtig" with a check at the right answer, a badge "falsch" with an
  x (`destructive` text, `destructive` border at 30%) at a wrong choice, and
  that option's explanation muted below it; the general explanation after
  the list.
- At the end of every page: an outline button back (chevron left, the
  previous page's name) and a primary button forward (the next one's name,
  chevron right), after a 1px `border` line.

### Interactive parts and graphs

- Controls are the app's: `Slider`, `ToggleGroup` (outline) for a switch
  ("offen | geschlossen"), a parameter table "Parameter | Wert" with the
  sliders in it and the values in mono, the computed value (τ = RC) in the
  last row in semibold.
- Graphs on millimetre paper as in documents; the curve `chart-3` (light) /
  `chart-2` (dark) 2.5px, reference lines (63 %) `muted-foreground` dashed
  with a mono label at their end, a marked point as a dot in the curve's
  colour with a direct label (τ). No legend.
- Search hits: the section as a 12px muted line (with the red "Ergänzung"
  badge when the hit lies in one), then the sentence with the term bold and
  underlined.

### Motion

"Motion" above, applied to reading:

- The next page (forward, a later chapter) comes in from the right, the
  previous one from the left; on phones the bottom bar's tabs come in from
  the side of the picked tab.
- "Mit Ergänzungen | Nur Original" fades the page in again, without moving
  it.
- "Auf dieser Seite" (wide) slides in from the right and out to the right;
  the page takes its new width at once. Panels on compact screens are
  sheets, the settings a page, both as in apps.
- What is revealed fades and zooms in a little: an answer, the verdicts and
  explanations of a choice, the feedback of "Prüfen", the sections under a
  chapter just opened in the chapter list.
- A section of the page shown scrolls into view smoothly; a section of
  another page is jumped to and held (see "Motion").

## App icon, favicon, link preview

Flat, in the theme's colours: no gradients, no metal.

- **App icon** ([`assets/app-icon.svg`](assets/app-icon.svg) as template):
  512 × 512, a squircle backdrop (`rx` 112) in OLED black `#000000` with a
  1.5px white rim at 12 % opacity. The glyph is drawn flat in white
  `#FAFAFA`, the dark face `#0A0A0A`, the red accent `#DC2626` and the data
  colours' borders as dark mode has them (orange `#F97316`, …), shapes
  rounded like the UI (`rx` 12 at this size), and stays inside the maskable
  safe zone: a circle of 40 % radius around the centre.
- **Favicon**: the glyph alone, no backdrop (`viewBox` cropped to it), with a
  black halo behind white parts so they show on light tab strips.
- PNGs rendered from the SVG: `apple-touch-icon.png` 180 × 180 full-bleed
  (square backdrop, no rim: iOS rounds the corners itself and paints
  transparency black; iOS reads only this `<link>`, never the manifest),
  `icon-192.png` and `icon-512.png` as drawn, `icon-maskable-512.png`
  full-bleed (Android crops it to its own shape).
- Web app manifest: `theme_color` and `background_color` `#000000` (the
  splash screen is the dark ground).
- **Link preview** (Open Graph image): 1200 × 630 PNG under 300 KB (WhatsApp
  takes no SVG and nothing bigger), OLED black, an 8px `#DC2626` bar along
  the top edge, the favicon glyph and the app name in Geist semibold
  `#FAFAFA`, the tagline in `#FAFAFA`, secondary text in `#A3A3A3`, an
  illustration in the dark theme's colours (blocks with data-colour fills and
  borders, `#1F1F1F` lines). German only: a URL has one card, it cannot
  follow the viewer's language.

## ohmtools logo

The organisation's own sign, in [`assets/logo/`](assets/logo/); the apps
keep their own icons.

- **The mark**: an omega drawn as one 40px stroke (at 512) with a terminal
  at each foot, the left one in the ink, the right one `accent-red`. Ink is
  `#FAFAFA` on dark grounds, `#0A0A0A` on light ones
  (`mark-on-dark.svg`, `mark-on-light.svg`).
- **The wordmark**: the mark, then "OhmTools" (that spelling), "Ohm" in Geist
  bold and "Tools" in Geist light, both in the ink; never red, never another
  weight (`wordmark-on-dark.svg`, `wordmark-on-light.svg`, the text as
  paths).
- **The icon** (`icon.svg`, `avatar-512.png` full-bleed for GitHub): the app
  icon template with the mark on a circuit board in `#333333`: a capacitor,
  a switch, a series resistor and a wiper that makes the omega a
  potentiometer. Every line ends at a terminal of the omega or at a pad, and
  none crosses the omega. The drawing sits halfway between the omega
  centred and the whole drawing centred. The circuit belongs to the icon
  only.
- **Favicon** (`favicon.svg`): the mark alone with a black halo.
- **Social preview** (`social-preview.png`, 1280 × 640, GitHub's size): the
  link preview rules above with the icon, "OhmTools" as in the wordmark, the
  tagline and `github.com/ohmtools` in `#A3A3A3`.
- Never recoloured, outlined, rotated or set in another font.

## Accessibility and checks

- Real buttons, links and labels; icon-only buttons named; what a colour or a
  position says is also written (the kind in the block) or `sr-only` (a
  block's day and time).
- Respect `prefers-reduced-motion` (see "Motion").
- Check every visible change at 360px and 400px wide (phones), on a phone
  turned sideways (844 × 390), on an iPad upright (834 × 1194) and at 1440px
  (desktop), in German and English, in light and dark mode.
- Check motion in the browser, not in the code (Playwright with Chromium):
  after each interaction `document.getAnimations()` lists what moves (empty:
  nothing does); sample a slide on every animation frame (horizontal
  overflow of the region and the document, opacity, transform) and its end
  state (opacity 1, no transform, no inline style left behind), also after
  fast repeated clicks; with `reducedMotion: "reduce"` no animation runs
  longer than 1ms and no View Transition starts.
- Documents: look at the PDF as an image (`pdftoppm -r 300`, cropped to the
  running head, a task head, a figure), in both versions (Angabe and
  Lösung).

## Colours

Every token, as sRGB hex (the chart colours are OKLCH in the tokens). Use the
names, never the values.

<!-- tokens:begin (generated by npm run build) -->

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#ffffff` | `#000000` | Page ground: white, OLED black in dark mode. |
| `foreground` | `#0a0a0a` | `#fafafa` | Text and icons on the background. |
| `card` | `#fafafa` | `#0a0a0a` | Card surface, a step above the ground. Sections drop it (no boxes), so it is rarely seen. |
| `card-foreground` | `#0a0a0a` | `#fafafa` | Text on card. |
| `popover` | `#fafafa` | `#262626` | Floating surfaces (popovers, menus, dialogs, sheets, drawers, toasts), always as frosted glass: at 72 % over a blurred backdrop (`popup-glass`). |
| `popover-foreground` | `#0a0a0a` | `#fafafa` | Text and icons on popover. |
| `primary` | `#0a0a0a` | `#fafafa` | The main action: neutral, black on light, white on dark. Red is never primary (accent-red). |
| `primary-foreground` | `#fafafa` | `#0a0a0a` | Text and icons on primary. |
| `secondary` | `#e5e5e5` | `#1f1f1f` | Secondary buttons. |
| `secondary-foreground` | `#0a0a0a` | `#fafafa` | Text on secondary. |
| `muted` | `#f5f5f5` | `#111111` | Subtle fills: the tab track, hover of ghost and outline controls. |
| `muted-foreground` | `#737373` | `#a3a3a3` | Secondary text: descriptions, hints, captions, trailing notes, icons in lists. |
| `accent` | `#f5f5f5` | `#1f1f1f` | Highlighted item in menus, lists and selects; a pressed toggle (an open panel's button). |
| `accent-foreground` | `#0a0a0a` | `#fafafa` | Text on accent. |
| `destructive` | `#dc2626` | `#ef4444` | Red text: errors, invalid fields, destructive menu items. A destructive button is filled accent-red. |
| `border` | `#e5e5e5` | `#1f1f1f` | Divider lines and borders. |
| `input` | `#e5e5e5` | `#262626` | Border of inputs and outline controls. |
| `ring` | `#a3a3a3` | `#525252` | Focus indication. |
| `chart-1` | `#ffa2a2` | `#ffa2a2` | Chart series 1 (lightest red). |
| `chart-2` | `#fb2c36` | `#fb2c36` | Chart series 2. |
| `chart-3` | `#e7000b` | `#e7000b` | Chart series 3. |
| `chart-4` | `#c10007` | `#c10007` | Chart series 4. |
| `chart-5` | `#9f0712` | `#9f0712` | Chart series 5 (darkest red). |
| `sidebar` | `#ffffff` | `#000000` | shadcn sidebar background: the ground. |
| `sidebar-foreground` | `#0a0a0a` | `#fafafa` | Text on sidebar. |
| `sidebar-primary` | `#0a0a0a` | `#fafafa` | Primary inside the sidebar. |
| `sidebar-primary-foreground` | `#fafafa` | `#0a0a0a` | Text on sidebar-primary. |
| `sidebar-accent` | `#f5f5f5` | `#1f1f1f` | Highlighted sidebar item. |
| `sidebar-accent-foreground` | `#0a0a0a` | `#fafafa` | Text on sidebar-accent. |
| `sidebar-border` | `#e5e5e5` | `#1f1f1f` | Sidebar borders. |
| `sidebar-ring` | `#a3a3a3` | `#525252` | Focus indication inside the sidebar. |
| `grid` | `#f0f0f0` | `#141414` | Lines inside a grid or chart (zeiteisen's hour lines), fainter than border. |
| `hour` | `#737373` | `#8a8a8a` | Labels on those lines (hours, axis ticks), in mono. |
| `accent-red` | `#dc2626` | `#dc2626` | The one accent, the same in both modes: marks that must stand out (today, the now-line, the picked day, the app tile, an update waiting) and the fill of destructive buttons. Tailwind: bg-red, text-red. |
| `accent-red-foreground` | `#ffffff` | `#ffffff` | Text and icons on accent-red. |
| `warning` | `#b45309` | `#fbbf24` | Hints and warnings: amber text, never a fill. |
| `surface` | `#fafafa` | `#0a0a0a` | A plain step above the ground for an area set apart or covered (zeiteisen's lecture-free day). |
| `kind-su` | `#f5f5f5` | `#111111` | Data colour, neutral (zeiteisen: SU lecture): block fill. |
| `kind-su-border` | `#d4d4d4` | `#2e2e2e` | Border of a kind-su block. |
| `kind-ue` | `#eff6ff` | `#0d1f3c` | Data colour, blue (zeiteisen: Ue exercise): block fill. |
| `kind-ue-border` | `#3b82f6` | `#2563eb` | Border of a kind-ue block. |
| `kind-pr` | `#ffedd5` | `#4a1a04` | Data colour, orange (zeiteisen: Pr laboratory): block fill. |
| `kind-pr-border` | `#ea580c` | `#f97316` | Border of a kind-pr block. |
| `kind-tu` | `#f0fdfa` | `#062b2a` | Data colour, teal (zeiteisen: Tu tutorial): block fill. |
| `kind-tu-border` | `#14b8a6` | `#0d9488` | Border of a kind-tu block. |
| `kind-s` | `#f5f3ff` | `#25104d` | Data colour, violet (zeiteisen: S seminar): block fill. |
| `kind-s-border` | `#8b5cf6` | `#7c3aed` | Border of a kind-s block. |
| `kind-wf` | `#f7fee7` | `#1a2e05` | Data colour, lime (zeiteisen: WF elective): block fill. |
| `kind-wf-border` | `#65a30d` | `#84cc16` | Border of a kind-wf block. |
| `block-kind` | `#404040` | `#d4d4d4` | Second line inside a coloured block (zeiteisen: the kinds). |
| `block-room` | `#525252` | `#a3a3a3` | Third line inside a coloured block (zeiteisen: the room, mono). |

<!-- tokens:end -->
