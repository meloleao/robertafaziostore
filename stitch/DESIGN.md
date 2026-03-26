# Design System Document

## 1. Overview & Creative North Star: "The Hand-Crafted Sanctuary"

This design system is built to bridge the gap between soulful, organic artistry and premium eCommerce functionality. The **Creative North Star** for this experience is **"The Hand-Crafted Sanctuary."** 

Unlike generic "flat" or "minimalist" stores that feel cold and industrial, this system treats the digital screen as a warm, tactile canvas. We move beyond the "template" look by introducing intentional asymmetry, organic textures that mimic paper and watercolor, and a layering system that feels like physical stationery. Every interaction should feel like a personal invitation into Roberta Fazio’s world—welcoming, educational, and deeply human.

---

## 2. Colors

The palette is rooted in the "earth and spirit" tones found in the temperament illustrations. It avoids clinical whites and harsh blacks in favor of creams and deeply pigmented naturals.

*   **Primary (`#9a402b` - Terracotta Red):** The heartbeat of the brand. Use for primary CTAs and core branding elements.
*   **Secondary (`#3a6756` - Earthy Green):** Represents growth and stability. Ideal for "educational" sections and secondary actions.
*   **Tertiary (`#306466` - Soft Teal):** Used for spiritual or reflective highlights and specialized temperament categories.
*   **Background (`#fff9eb` - Warm Cream):** The foundation of the "Sanctuary." It provides a softer, more eye-friendly experience than pure white.

### The "No-Line" Rule
To maintain the organic feel, **explicitly prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through:
1.  **Background Color Shifts:** Use `surface-container-low` sections sitting on a `surface` background to define content blocks.
2.  **Organic Overlays:** Use hand-drawn "blobs" or soft-edged containers to break the rectangular grid.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine textured paper. 
*   **Level 1 (Base):** `surface` (`#fff9eb`)
*   **Level 2 (In-page containers):** `surface-container` (`#f3eddf`)
*   **Level 3 (Interactive Cards):** `surface-container-lowest` (`#ffffff`) to provide a subtle "pop" of brightness.

### The "Glass & Gradient" Rule
For floating menus or high-end product displays, use **Glassmorphism**. Apply a semi-transparent version of `surface` with a 12px-20px backdrop blur. This allows the illustrative backgrounds to bleed through, softening the edges of the UI.

---

## 3. Typography

The typography strategy reflects a dialogue between the "Student" (the clean, grounded serif) and the "Artist" (the organic display font).

*   **The Artist (Display & Headlines):** **Be Vietnam Pro** (interpreted through an organic lens). Used for `display-lg` through `headline-sm`. This font carries the friendly, personal weight of the temperament titles. 
*   **The Student (Body & Titles):** **Newsreader**. A clean, readable serif that suggests a classic, grounded, and educational feel. Used for `body-lg` through `title-sm`. 

**Hierarchy Note:** Always pair a large, expressive display headline with a generous amount of line-height in the Newsreader body text to ensure the spiritual and educational content feels "breathable."

---

## 4. Elevation & Depth

We eschew traditional material shadows in favor of **Tonal Layering** and **Ambient Glows.**

*   **The Layering Principle:** Stacking surface-container tiers creates a natural lift. A `surface-container-lowest` card on a `surface-container-low` section mimics the look of a sticker or a separate piece of paper without needing a harsh shadow.
*   **Ambient Shadows:** When a "floating" effect is strictly required (e.g., a cart drawer), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(86, 66, 62, 0.06);`. The shadow color should be a tinted version of `on-surface-variant`—never pure grey.
*   **The "Ghost Border" Fallback:** If a border is necessary for accessibility, use the `outline-variant` token at **15% opacity**. This creates a "suggestion" of a boundary that feels hand-sketched rather than machine-tooled.

---

## 5. Components

### Buttons & Inputs
*   **Primary Button:** Uses a subtle gradient from `primary` (`#9a402b`) to `primary-container` (`#b95740`) to give it "soul." Radius should be `md` (1.5rem) or `full`.
*   **Input Fields:** Avoid boxes. Use a `surface-container` background with a slightly irregular `DEFAULT` (1rem) border radius. Placeholder text should use `on-surface-variant` in **Newsreader**.

### Chips & Language Toggles
*   **Language Toggle (PT-BR / EN-US):** Design these as "toggled sketches." Use a hand-drawn underline style (using a SVG background-image) for the active state rather than a solid background fill.
*   **Temperament Chips:** Use `secondary-container` for Phlegmatic, `primary-container` for Choleric, etc.

### Cards & Lists
*   **Rule:** **Forbid the use of divider lines.** 
*   **Separation:** Use vertical white space (Spacing `8` or `10`) or subtle background shifts. For product lists, allow images to slightly overlap their container boundaries to create a bespoke, non-grid feel.

### Unique Component: The "Temperament Accent"
Include a component for "Handwritten Annotations"—small SVG-based arrows, hearts, or swirls (inspired by the illustration style) that can be positioned absolutely near headers to draw attention to key educational points.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts. Let an image be slightly larger or off-center compared to the text block next to it.
*   **Do** use high border-radius values (`lg` or `xl`) for all containers to evoke a "soft" and "welcoming" tone.
*   **Do** prioritize the "Warm Cream" background over "White" to maintain the Christian/personal warmth of the brand.

### Don't:
*   **Don't** use 90-degree sharp corners. This breaks the "Hand-Drawn" aesthetic.
*   **Don't** use pure black (`#000000`) for text. Use `on-surface` (`#1d1c13`) to keep the typography feeling integrated into the earthy palette.
*   **Don't** use high-contrast, heavy shadows. If the UI feels like it's "floating" too high above the page, it loses its grounded, spiritual tone.
*   **Don't** use standard horizontal dividers. If you need to separate content, use a change in background color or a wider gap from the spacing scale.