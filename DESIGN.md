---
name: Vital Assurance
colors:
  surface: '#f9f9ff'
  surface-dim: '#d5dae8'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e8eefd'
  surface-container-high: '#e3e8f7'
  surface-container-highest: '#dde2f1'
  on-surface: '#161c26'
  on-surface-variant: '#444655'
  inverse-surface: '#2b313c'
  inverse-on-surface: '#ecf1ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#294fdb'
  primary: '#264dd9'
  on-primary: '#ffffff'
  primary-container: '#4568f3'
  on-primary-container: '#fffbff'
  inverse-primary: '#b8c3ff'
  secondary: '#ae2f34'
  on-secondary: '#ffffff'
  secondary-container: '#ff6b6b'
  on-secondary-container: '#6d0010'
  tertiary: '#974300'
  on-tertiary: '#ffffff'
  tertiary-container: '#be5600'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c3ff'
  on-primary-fixed: '#001355'
  on-primary-fixed-variant: '#0035bd'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410006'
  on-secondary-fixed-variant: '#8c1520'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68e'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#763300'
  background: '#f9f9ff'
  on-background: '#161c26'
  surface-variant: '#dde2f1'
  surface-dark: '#0E141E'
  surface-white: '#FFFFFF'
  accent-coral: '#FF6B6B'
  brand-blue: '#4A6CF7'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style
The brand personality is authoritative yet empathetic, balancing the precision of medical technology with the warmth of human-centric care. The design system targets healthcare administrators and enterprise partners who require a platform that feels secure, efficient, and forward-thinking.

The chosen design style is **Corporate / Modern** with a refined **Minimalist** lean. It focuses on clarity of information through generous whitespace, a structured systematic layout, and a deliberate use of high-contrast accents to guide the user’s eye toward critical actions and data points. The aesthetic is professional and dependable, avoiding unnecessary ornamentation in favor of functional elegance.

## Colors
The palette is anchored by a deep obsidian (`#0E141E`) for text and dark-mode surfaces, providing a sophisticated foundation. The primary brand blue (`#4A6CF7`) serves as the core action color, symbolizing trust and technological innovation. 

A vibrant coral-red (`#FF6B6B`) is used sparingly as a secondary accent for notifications, highlights, or critical status indicators, ensuring high visibility without overwhelming the professional atmosphere. Backgrounds should default to pure white (`#FFFFFF`) to maintain the clinical, airy feel essential for modern healthcare interfaces.

## Typography
This design system utilizes **Inter** exclusively to lean into its systematic, utilitarian nature. Inter’s high x-height and neutral character make it exceptionally legible for complex health data and long-form policy text.

Hierarchy is established through significant weight shifts (Bold for headlines, Regular for body) rather than excessive size variations. Display styles use tighter letter spacing to maintain a "locked-in" professional look on large screens. For mobile, headline sizes are scaled down to ensure that readability remains high within narrow viewports.

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop, centering content within a 1280px container to ensure a premium, editorial feel. A 12-column system is used with 24px gutters to allow for complex dashboard arrangements and multi-column forms.

For mobile and tablet, the system transitions to a fluid model with 16px side margins. Spacing between sections is generous (typically 80px - 120px on desktop) to promote focus and reduce cognitive load, which is critical in healthcare applications. All spatial relationships should be multiples of the 8px base unit.

## Elevation & Depth
Depth is conveyed using **Tonal Layers** and extremely **Ambient Shadows**. Most surfaces are flat, with depth used only to indicate interactivity or information stacking.

Interactive cards and modals should use a "soft lift" shadow: a very low-opacity blue-tinted shadow (e.g., `rgba(14, 20, 30, 0.08)`) with a large blur radius (24px+). This creates a sense of floating without the harshness of traditional shadows. Secondary elevation is achieved through subtle border strokes (`1px`) in light gray to define boundaries on white backgrounds without adding visual weight.

## Shapes
The shape language is **Rounded**, utilizing a 0.5rem (8px) corner radius for most standard components like buttons and input fields. This radius strikes a balance between the "friendly" nature of consumer apps and the "structured" nature of enterprise tools.

Larger containers and cards should utilize the `rounded-lg` (16px) or `rounded-xl` (24px) tokens to create a softer, more modern aesthetic for high-level content blocks.

## Components
- **Buttons:** Primary buttons use the brand blue with white text and 8px rounded corners. They should feature a subtle hover transition that slightly darkens the blue. Secondary buttons use a transparent background with a 1px stroke of the neutral dark color.
- **Input Fields:** Fields should have a light gray border that thickens and turns blue on focus. Use the `label-sm` typography for field labels, positioned consistently above the input.
- **Chips/Badges:** Small, high-contrast badges for status (e.g., "Active" or "Pending"). Use light-tinted backgrounds of the brand colors with dark text for high legibility.
- **Cards:** White backgrounds with a subtle 1px border. Use 16px corner radii. Content within cards should follow the 8px spacing rhythm for padding.
- **Lists:** Clean, borderless list items separated by light horizontal rules. Use icons sparingly to provide visual cues for data types.
- **Progress Indicators:** Use the secondary coral color for highlights in progress bars or health-related metrics to ensure they stand out from the primary navigational blue.