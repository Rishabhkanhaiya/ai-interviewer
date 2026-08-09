---
name: Cognitive Professional
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#464555'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 48px
---

## Brand & Style

The design system is engineered for a high-stakes desktop AI interview platform. The brand personality is **authoritative, calming, and intellectually rigorous**, aiming to evoke a sense of "prepared confidence" in career-focused professionals.

The visual style follows a **Corporate Modern** aesthetic with **Minimalist** restraint. It prioritizes clarity and focus, utilizing generous white space to reduce cognitive load during stressful interview preparation. The interface avoids unnecessary ornamentation, relying instead on precise typography and a disciplined color application to signal premium quality and high-trust technology.

## Colors

The palette is anchored by **Deep Indigo (#4f46e5)**, chosen for its association with intelligence and reliability. This is paired with a sophisticated slate of neutrals to create a structured, professional environment.

- **Primary (Indigo):** Used for primary actions, progress indicators, and active states. It signals the "AI" intelligence layer.
- **Secondary (Slate):** Used for deep text, headers, and navigation elements to provide a grounded, serious tone.
- **Tertiary (Emerald):** Reserved for success states, completed tasks, and positive feedback loops (e.g., "Ready to interview").
- **Surface Palette:** A range of ultra-light grays (#f8fafc to #f1f5f9) is used to differentiate between the background and container layers, maintaining a clean, breathable UI.

## Typography

The design system utilizes **Manrope** exclusively to maintain a modern, geometric, yet highly legible appearance. 

The type hierarchy is designed for information density without sacrificing clarity. **Headline-XL** is reserved for main dashboard greetings and high-level page headers. **Body-MD** is the default for most interactions, ensuring readability during long reading or feedback sessions. Labels use a slight tracking (letter-spacing) increase and semi-bold weights to provide clear categorization and metadata differentiation.

## Layout & Spacing

This system employs a **Fixed Grid** model for the main content area to ensure a consistent, professional reading experience on desktop monitors, centered within a 1280px container.

- **Grid:** A 12-column system with 24px gutters is the standard for content layout.
- **Sidebar:** A fixed 260px left navigation bar provides persistent access to core features.
- **Spacing Rhythm:** Based on an 8px base unit. Stack spacing (vertical) should be generous between sections (48px) to allow the "Cognitive" aspect of the brand to shine through whitespace.
- **Breakpoints:** 
    - **Desktop:** 1280px+ (Full 12-column)
    - **Tablet:** 768px - 1279px (Fluid, 8-column, sidebar collapses to icons)

## Elevation & Depth

To maintain a high-trust, professional aesthetic, this design system avoids heavy shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Background):** #f8fafc. The base canvas.
- **Level 1 (Cards/Containers):** #ffffff with a subtle 1px border (#e2e8f0). No shadow.
- **Level 2 (Interactive/Floating):** Used for tooltips and dropdowns. Features an ultra-diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.05)`.
- **Level 3 (Modals):** A soft backdrop blur (8px) is applied to the layer behind modals to maintain context while focusing the user's attention.

## Shapes

The shape language is **Rounded**, striking a balance between the precision of a professional tool and the approachability of a career coach.

- **Standard Components:** Buttons and input fields use a 0.5rem (8px) corner radius.
- **Large Components:** Dashboard cards and main content containers use 1rem (16px) to feel substantial and modern.
- **Status Pills:** Use a full "Pill-shaped" (rounded-full) radius to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid #4f46e5 with white text. 8px radius. High contrast.
- **Secondary:** White background with #e2e8f0 border and #1e293b text. Used for less urgent actions.
- **Ghost:** No background or border. Indigo text. Used for "View all" or navigation links.

### Input Fields
- Use a white background with a 1px #e2e8f0 border. On focus, the border transitions to #4f46e5 with a subtle 2px indigo glow.

### Cards
- Standard cards use a white background and 16px corner radius. Padding is fixed at 24px. Use a subtle header border (1px #f1f5f9) to separate titles from content.

### AI Feedback Chips
- Use a light indigo tint background (#e0e7ff) with indigo text (#4338ca) to highlight AI-generated insights or tags.

### Progress Bars
- Linear, 8px height. The background track is #f1f5f9, and the fill is a gradient of #4f46e5 to #6366f1. Used for "Interview Readiness" scores.