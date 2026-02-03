# Evernote Clone Design System
## Version 2.0 - Lufga Warm Palette

> **Callback to Revert**: `backup-emerald-2026-01-31`  
> Backup location: `/src/styles/backup-emerald-2026-01-31/`  
> Original CSS: `/src/app/globals.backup-2026-01-31.css`

---

## 🎨 Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-black` | `#000000` | Primary text (light mode), Dark backgrounds |
| `--color-golden` | `#F7D44C` | Primary accent, highlights, selection |
| `--color-coral` | `#EB7A53` | Secondary accent, tags, warnings |
| `--color-sky` | `#98B7DB` | Tertiary accent, links, info states |
| `--color-sage` | `#ABD672` | Success states, checkmarks, completed items |
| `--color-cream` | `#F6ECC9` | Light backgrounds, note cards, surfaces |
| `--color-white` | `#FFFFFF` | Pure white for overlays and text |

### Semantic Colors
```css
/* Light Mode */
--background-primary: #FFFFFF;
--background-secondary: #F6ECC9;
--background-tertiary: #FBF8F0;
--foreground-primary: #000000;
--foreground-secondary: #4A4A4A;
--foreground-muted: #7A7A7A;

/* Dark Mode */
--background-primary: #1A1A1A;
--background-secondary: #252525;
--background-tertiary: #303030;
--foreground-primary: #F5F5F5;
--foreground-secondary: #CCCCCC;
--foreground-muted: #888888;
```

### Accent Gradients
```css
--gradient-primary: linear-gradient(135deg, #F7D44C 0%, #EB7A53 100%);
--gradient-secondary: linear-gradient(135deg, #ABD672 0%, #98B7DB 100%);
--gradient-warm: linear-gradient(180deg, #F7D44C 0%, #F6ECC9 100%);
--gradient-midnight: linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%);
```

### Theme Variants
The design system includes 8 distinct theme options:

1. **Light** - Clean and bright with warm undertones
2. **Dark** - True black with high contrast
3. **Warm** - Dark shell with cream content surfaces
4. **Cool** - Modern blue-tinted dark mode
5. **Earth** - Natural sage green with warm content
6. **Spring** - Playful pastels with soft pink
7. **Midnight** - Deep purple night with rich violet accents
8. **Autumn** - Sunset warmth with coral and peach accents

**Midnight Theme Colors:**
```css
/* Shell/Navigation */
--surface-shell: #1A0F2E;         /* Deep purple-black */
--surface-shell-hover: #251835;   /* Rich purple */

/* Content */
--surface-content: #2D1B4E;       /* Royal purple */
--surface-content-secondary: #3A2560; /* Deeper purple */

/* Interactive */
--accent-primary: #A78BFA;        /* Vibrant purple */
--accent-secondary: #C4B5FD;      /* Light lavender */
--highlight: #C4B5FD;             /* Selection color */

/* Text */
--text-primary: #F3F0FF;          /* Almost white with purple tint */
--text-secondary: #C4B5FD;        /* Lavender */
```

**Autumn Theme Colors:**
```css
/* Shell/Navigation */
--surface-shell: #6B2D2D;         /* Deep maroon/burgundy */
--surface-shell-hover: #8B3A3A;   /* Lighter burgundy */

/* Content */
--surface-content: #FFF8F0;       /* Warm cream */
--surface-content-secondary: #FFEFDB; /* Light amber */

/* Interactive - True autumn red */
--accent-primary: #D84A4A;        /* True autumn red */
--accent-secondary: #E06E6E;      /* Lighter red */
--card-red: #C62828;              /* Deep red */
--highlight: #D84A4A;             /* True autumn red */

/* Text */
--text-primary: #3E2723;          /* Deep brown */
--text-on-shell: #FFF8F0;         /* Cream on maroon */
```

---

## 🔤 Typography

### Font Family
**Primary**: Lufga  
**Fallback**: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif  
**Monospace**: "JetBrains Mono", "Fira Code", monospace

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700

### Type Scale
| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| Display | 48px / 3rem | 1.1 | 700 | Hero headings |
| H1 | 32px / 2rem | 1.2 | 700 | Page titles |
| H2 | 24px / 1.5rem | 1.3 | 600 | Section headings |
| H3 | 20px / 1.25rem | 1.4 | 600 | Subsections |
| Body | 16px / 1rem | 1.6 | 400 | Paragraph text |
| Small | 14px / 0.875rem | 1.5 | 400 | Secondary text |
| XSmall | 12px / 0.75rem | 1.4 | 500 | Labels, captions |

---

## 📐 Spacing & Layout

### Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Border Radius
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

---

## 🌟 Effects & Shadows

### Glassmorphism
```css
.glass-warm {
  background: rgba(246, 236, 201, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(247, 212, 76, 0.2);
}

.glass-dark {
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### Shadows
```css
--shadow-soft: 
  0 1px 2px rgba(0, 0, 0, 0.04),
  0 4px 8px rgba(0, 0, 0, 0.04),
  0 8px 16px rgba(0, 0, 0, 0.04);

--shadow-warm:
  0 4px 12px rgba(247, 212, 76, 0.15),
  0 8px 24px rgba(235, 122, 83, 0.1);

--shadow-elevated:
  0 4px 6px rgba(0, 0, 0, 0.05),
  0 10px 20px rgba(0, 0, 0, 0.1),
  0 20px 40px rgba(0, 0, 0, 0.1);
```

---

## 🧩 Component Patterns

### Note Cards (Bento Style)
- Large rounded corners (`radius-xl`)
- Color-coded backgrounds based on note type:
  - Default: `--color-cream`
  - Task/Todo: `--color-golden`
  - Image notes: Gradient `--color-coral` to `--color-golden`
  - Lectures: `--color-white` with image
- Subtle drop shadows
- Heart/favorite icon with animation

### Pill Buttons (Categories)
```css
.pill {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
}

.pill-active {
  background: #000000;
  color: #FFFFFF;
}

.pill-inactive {
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
```

### Action Bar (Editor)
- Dark background with rounded corners
- Circular icon buttons with subtle borders
- Color picker dots with checkmark indicator

---

## 📱 Mobile Patterns

### Text Editor Toolbar
- Full-width bottom sheet
- Dark mode overlay
- Font picker dropdown
- Size selector (14, 16, 18)
- Alignment buttons in row

### Yellow Highlight Selection
```css
.text-highlight {
  background: #F7D44C;
  color: #000000;
  padding: 2px 4px;
  border-radius: 4px;
}
```

### Floating Action Button
```css
.fab {
  background: var(--gradient-primary);
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-warm);
}
```

---

## 🔄 Reverting to Previous Design

To revert all changes:

1. Replace `globals.css` with:
   ```bash
   cp src/app/globals.backup-2026-01-31.css src/app/globals.css
   ```

2. Replace `editor.css` with:
   ```bash
   cp src/components/editor/editor.backup-2026-01-31.css src/components/editor/editor.css
   ```

3. Restore component backups from:
   ```
   src/styles/backup-emerald-2026-01-31/
   ```
