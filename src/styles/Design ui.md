# UI Overhaul — Reference Design Implementation

You are the lead frontend engineer. Overhaul the existing UI of this
application to match the design language, component patterns, and
visual identity shown in the attached reference image. This is a
ground-up visual redesign — preserve all existing functionality and
data flows but completely rework the presentation layer.

## Design System to Implement

### Color Palette & Theming — Dual Mode

This app supports both **light mode** and **dark mode**. The design
system must define tokens for both. The reference image primarily
shows a dark-shell / warm-content split — use this as the foundation
and extrapolate a full dual-mode system.

**Dark Mode (Primary Reference):**
- Shell/navigation backgrounds: Near-black (#1A1A1A)
- Content surfaces: Warm cream/parchment (#F5ECD7 to #FAF3E0) for
  detail/reading views — NOT pure white, NOT cool gray
- Card backgrounds: Burnt orange (#E8783A), goldenrod yellow
  (#E8C840), muted olive (#A8B87A), dark charcoal (#2A2A2A) — full
  saturated fills, not borders
- Text on dark: Pure white (#FFFFFF)
- Text on light/cream: Near-black (#1A1A1A)
- Selection/highlight: Warm yellow (#F2D466)
- Shadows: Warm-toned, subtle elevation — never cool/blue cast
- Dividers/borders: Warm gray (#3A3632) on dark, (#E0D6C4) on cream

**Light Mode:**
- Shell/navigation backgrounds: Warm off-white (#FAF6EE) or soft
  cream (#F7F2E8) — NOT stark white, NOT cool gray
- Content surfaces: White with warm undertone (#FFFDF8) for detail
  views
- Card backgrounds: Same accent palette but at ~85% saturation and
  slightly lighter: softened orange (#EE9460), light gold (#F0D76A),
  soft sage (#B8C890), warm light gray (#F0ECE4)
- Text primary: Near-black (#1A1A1A)
- Text secondary/metadata: Warm medium gray (#7A7168)
- Selection/highlight: Same warm yellow (#F2D466)
- Shadows: Slightly more visible than dark mode but still warm-toned
- Dividers/borders: (#E8E0D0)

**Mode Switching Rules:**
- Respect system preference by default, allow manual override
- Store preference persistently
- All color references in components must use theme tokens — NEVER
  hardcode hex values in component files
- Define a single theme config (e.g. theme.ts or CSS custom
  properties) that maps semantic names to mode-specific values:
  `--surface-primary`, `--surface-content`, `--text-primary`,
  `--text-secondary`, `--accent-orange`, `--accent-gold`,
  `--accent-green`, `--card-dark`, `--highlight`, `--shadow-color`,
  `--border-subtle`
- Transition between modes should be smooth (200-300ms transition on
  background-color and color properties)
- Both modes must feel warm and organic — light mode should NOT feel
  clinical or sterile

### Typography
- Display headings: 32-40px, bold/black weight, tight line-height
  (1.1), geometric sans-serif (Inter, SF Pro Display, or system font
  at heavy weight)
- Section headings: 20-24px, semibold
- Body text: 16px, regular weight, comfortable line-height (1.5)
- Metadata/labels: 12-13px, medium weight, slightly muted opacity
- All text should feel generously sized and confident — this is an
  editorial, magazine-quality aesthetic, not a dense utilitarian UI

### Layout & Spacing
- Generous padding throughout: minimum 16px internal card padding,
  20-24px screen margins
- Corner radius: 16-20px on cards and containers, 24px+ on pill
  buttons/chips, 12px on smaller elements like buttons
- Card grid: 2-column masonry-style layout on list views with varying
  card heights based on content type
- Breathing room between all elements — err on the side of more
  whitespace, not less
- Content screens should feel like a single warm surface with the
  content floating on it

### Component Specifications

**Filter Chips / Pill Buttons:**
- Horizontal scrollable row below the main heading
- Rounded pill shape (full border-radius)
- Active state: filled dark background with white text + count badge
  (dark mode) / filled dark background with white text (light mode)
- Inactive state: outlined/ghost with muted text, adapting border
  color per mode
- Comfortable tap targets (40px+ height)

**Content Cards:**
- Full background color (not bordered, not outlined — FILLED with
  color)
- Each card type gets a distinct background color from the accent
  palette, adjusted per light/dark mode
- Dark cards for task/checklist content (charcoal in dark mode, warm
  gray in light mode)
- Bright/warm cards for media or image-heavy content
- Wide/full-width list cards for collections or grouped items
- Each card includes: title (bold), optional metadata line
  (timestamp, count), optional favorite/heart icon (top-right),
  truncated preview content
- Cards should feel tactile and elevated with subtle shadow

**Floating Action Bar (Bottom):**
- Semi-transparent or solid bottom bar matching shell background per
  mode
- Central "+" creation button (prominent, circular)
- Secondary action icons flanking (microphone/voice, etc.)
- Safe area aware — proper bottom spacing on modern devices

**Detail/Content View:**
- Warm content background filling the entire content area
  (cream in dark mode, warm white in light mode)
- Oversized bold title at top (40px+)
- Avatar overlap on title area for personalization/authorship
- Collaboration indicators: stacked avatar row + share action in
  header
- Contextual bottom toolbar with icon actions (add, camera, edit,
  menu) — icons should be outlined/line style, not filled
- Subtle content fold indicators where appropriate

**Text Selection & Editing:**
- Custom selection highlight in warm yellow (not system default blue)
  — consistent across both modes
- Floating contextual toolbar above selection: cut, copy, paste as
  minimal icons
- Inline formatting bar between content and keyboard: font size
  options, text style toggles, list formatting
- Formatting bar should be compact and non-intrusive
- Toolbar surfaces adapt to current mode (dark bg in dark mode, warm
  light bg in light mode)

**Navigation:**
- Back arrows: simple chevron, not heavy
- Header actions contextual per screen (share, menu, etc.)
- No tab bar — navigation is hierarchical (list → detail) with a
  home/list screen as root

### Overall Design Principles
1. **Warm over cold** — every surface, shadow, and color in BOTH
   modes should feel warm and organic. Light mode is creamy, not
   clinical. Dark mode is charcoal, not blue-black.
2. **Editorial confidence** — large type, bold headings, generous
   space. This should feel like a premium magazine layout, not a
   standard mobile app.
3. **Color as information** — card colors signal content type.
   Establish a consistent mapping that holds across both modes.
4. **Contextual density** — home/list screens can be denser (grid of
   cards); content/detail screens should be sparse and focused on
   readability.
5. **Shell vs content contrast** — in dark mode the shell is dark and
   content surfaces are warm/light. In light mode, maintain a
   subtler version of this same depth hierarchy (slightly darker
   shell tones vs brighter content surfaces).
6. **Tactile and layered** — cards feel lifted off the surface,
   toolbars float, avatars overlap boundaries. Use shadows, layering,
   and subtle depth cues. Shadow intensity and color should adapt per
   mode.

### Implementation Notes
- Apply this design system globally across all existing screens
- Preserve all current functionality, routing, data fetching, and
  state management — this is a visual-only overhaul
- **Create a centralized theme configuration** with all color tokens,
  typography scales, spacing values, and border radii defined once.
  Every component references these tokens — zero hardcoded values.
- Implement a theme provider / context that toggles between light and
  dark token sets
- Default to system color scheme preference, with a manual toggle
  accessible from settings or a quick-access control
- Ensure responsive behavior and proper safe area handling
- If the current app uses a component library, restyle or override
  it to match — do NOT let default component library aesthetics leak
  through
- Every screen should feel cohesive — if a screen doesn't map
  directly to the reference, extrapolate from the design system
  principles above
- Test both modes thoroughly — no component should look broken,
  unreadable, or off-brand in either mode