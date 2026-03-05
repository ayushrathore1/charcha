# CodeLearnn Brand Theme Guide

> The definitive brand reference for **<CodeLearnn/>** — a developer-first learning OS.

---

## Logo

The logo is a **text-based code-tag** design: `<CodeLearnn/>`

| Element | Color | Hex | Notes |
|---|---|---|---|
| `<` opening bracket | Neon Lime Green | `#c8fa3c` | Bold, monospace-style |
| `Code` | Pure White | `#ffffff` | Bold sans-serif (Inter/Geist) |
| `Learnn` | Soft Purple/Violet | `#a78bfa` | Gradient feel, same font weight |
| `/>` closing tag | Neon Lime Green | `#c8fa3c` | Matches opening bracket |

### SVG Logo (Inline)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 50" fill="none">
  <text x="0" y="38" font-family="'Inter', 'Geist Sans', 'SF Mono', monospace" font-size="36" font-weight="700" letter-spacing="-0.5">
    <tspan fill="#c8fa3c">&lt;</tspan>
    <tspan fill="#ffffff">Code</tspan>
    <tspan fill="#a78bfa">Learnn</tspan>
    <tspan fill="#c8fa3c">/&gt;</tspan>
  </text>
</svg>
```

### Image Generation Prompt

> "Generate a professional, minimalist SVG logo for a developer platform called 'CodeLearnn'. The logo displays the text `<CodeLearnn/>` in a modern, bold geometric sans-serif font (Inter or Geist). The opening bracket `<` is neon lime green (#c8fa3c). The word 'Code' is bright white (#ffffff). The word 'Learnn' is soft purple-violet (#a78bfa). The closing sequence `/>` is neon lime green (#c8fa3c). The background is transparent. The design should feel clean, minimal, coding-component aesthetic — suitable for dark-themed websites."

---

## Color Palette

### Core Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Dark Background** | `#0a0a0f` | `10, 10, 15` | Page background, body |
| **Card Background** | `#12121a` | `18, 18, 26` | Cards, elevated surfaces |
| **Elevated Surface** | `#1a1a2e` | `26, 26, 46` | Modals, dropdowns, inputs |
| **Border** | `#2a2a3e` | `42, 42, 62` | Card borders, dividers |

### Accent Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Primary Lime** | `#c8fa3c` | `200, 250, 60` | CTAs, highlights, active states, logo brackets |
| **Lime Glow** | `rgba(200,250,60,0.15)` | — | Button glow, hover effects |
| **Teal** | `#2dd4bf` | `45, 212, 191` | Secondary accent, tags, badges |
| **Purple** | `#a78bfa` | `167, 139, 250` | Logo text, decorative accents |
| **Deep Purple** | `#7c3aed` | `124, 58, 237` | Gradients, hover states |

### Text Colors

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Primary Text** | `#ffffff` | `255, 255, 255` | Headings, body text |
| **Secondary Text** | `#e0e0e0` | `224, 224, 224` | Paragraphs, descriptions |
| **Muted Text** | `#a0a0b0` | `160, 160, 176` | Captions, timestamps, labels |
| **Dim Text** | `#6b6b80` | `107, 107, 128` | Placeholders, disabled text |

### Status Colors

| Name | Hex | Usage |
|---|---|---|
| **Success** | `#22c55e` | Completed, verified |
| **Warning** | `#f59e0b` | Caution, pending |
| **Error** | `#ef4444` | Failed, destructive |
| **Info** | `#3b82f6` | Informational badges |

---

## Typography

### Font Stack

```css
/* Primary — Headings & UI */
font-family: 'Inter', 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Code / Monospace — Logo, code blocks, tags */
font-family: 'Geist Mono', 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
```

### Scale

| Element | Size | Weight | Tracking |
|---|---|---|---|
| **Logo** | 32px | 700 (Bold) | -0.5px |
| **H1** | 48–56px | 700 | -1px |
| **H2** | 28–32px | 700 | -0.5px |
| **H3** | 20–24px | 600 | -0.3px |
| **Body** | 16px | 400 | 0 |
| **Small/Caption** | 13–14px | 500 | 0.2px |
| **Badge/Tag** | 11–12px | 600 | 1.5px (uppercase) |

---

## Spacing & Layout

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | `4px` | Tight spacing |
| `--space-sm` | `8px` | Between inline elements |
| `--space-md` | `16px` | Component padding |
| `--space-lg` | `24px` | Section spacing |
| `--space-xl` | `32px` | Major section gaps |
| `--space-2xl` | `48px` | Page-level padding |
| `--radius-sm` | `6px` | Small buttons, tags |
| `--radius-md` | `12px` | Cards, inputs |
| `--radius-lg` | `16px` | Modals, hero sections |
| `--radius-pill` | `9999px` | Pill badges, pills |

---

## Effects & Shadows

```css
/* Card elevation */
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);

/* Primary button glow */
box-shadow: 0 0 20px rgba(200, 250, 60, 0.3), 0 0 60px rgba(200, 250, 60, 0.1);

/* Border glow (focus state) */
border-color: rgba(200, 250, 60, 0.5);
box-shadow: 0 0 0 3px rgba(200, 250, 60, 0.1);

/* Subtle grid background pattern */
background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
background-size: 60px 60px;
```

---

## Button Styles

### Primary (Lime CTA)
```css
background-color: #c8fa3c;
color: #0a0a0a;
font-weight: 700;
padding: 14px 32px;
border-radius: 8px;
box-shadow: 0 0 20px rgba(200, 250, 60, 0.3);
```

### Secondary (Outline)
```css
background-color: transparent;
border: 2px solid #c8fa3c;
color: #c8fa3c;
font-weight: 700;
padding: 14px 32px;
border-radius: 8px;
```

### Ghost (Muted)
```css
background-color: rgba(255, 255, 255, 0.05);
color: #a0a0b0;
border: 1px solid #2a2a3e;
padding: 10px 20px;
border-radius: 8px;
```

---

## Input Fields

```css
/* Text input / Link input bar */
background-color: #1a1a2e;
border: 1px solid #2a2a3e;
border-radius: 12px;
color: #ffffff;
padding: 14px 20px;
font-size: 15px;
transition: border-color 0.2s, box-shadow 0.2s;

/* Focus state */
border-color: rgba(200, 250, 60, 0.5);
box-shadow: 0 0 0 3px rgba(200, 250, 60, 0.1);
outline: none;
```

---

## CSS Variables (Quick Reference)

```css
:root {
  /* Backgrounds */
  --bg-dark: #0a0a0f;
  --bg-card: #12121a;
  --bg-elevated: #1a1a2e;
  --bg-border: #2a2a3e;

  /* Accents */
  --color-primary: #c8fa3c;
  --color-primary-glow: rgba(200, 250, 60, 0.15);
  --color-teal: #2dd4bf;
  --color-purple: #a78bfa;
  --color-deep-purple: #7c3aed;

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #e0e0e0;
  --text-muted: #a0a0b0;
  --text-dim: #6b6b80;

  /* Fonts */
  --font-sans: 'Inter', 'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Geist Mono', 'SF Mono', 'Fira Code', monospace;
}
```
