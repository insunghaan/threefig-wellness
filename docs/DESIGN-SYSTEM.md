# 3FIG / Quiet color and glass

The September 10, 2026 correction follows the user’s explicit direction: borrow only the reference palette, remove the repeated generated image, keep the background barely colored and heavily diffused, restore the original fig, and give cards and bottom navigation rounded glass surfaces.

## Foundations

| Role              | Value                                                               |
| ----------------- | ------------------------------------------------------------------- |
| Pearl background  | `#F7F8FA`                                                           |
| Ink               | `#302C35`                                                           |
| Plum action       | `#4B354C`                                                           |
| Quiet text        | `#726977`                                                           |
| Rose accent       | `#F16AAB`                                                           |
| Apricot accent    | `#FFBB98`                                                           |
| Lavender accent   | `#C4B5E9`                                                           |
| Periwinkle accent | `#D7DDF6`                                                           |
| Glass             | White 60% → 18%, backdrop blur 32px, light edge and inset highlight |
| Panel radius      | 36–40px                                                             |
| Navigation        | 40px radius, 32px backdrop blur, translucent active pill            |
| Dialog            | Denser 84% → 69% glass, 40px blur, 40px radius                      |

Color accents appear at full strength only where a small control, chart or the fig needs definition. They are not full-strength backgrounds. The screen wash uses broad radial color fields at 18–22% opacity before an additional 65–100px blur, painted across oversized bounds to avoid a cut edge. There are no bitmap backgrounds, image crops or repeating textures. The rejected `sunset-atmosphere.jpg` has been removed from the project.

## Original fig

`OrganicForm` and its original CSS geometry remain the source of truth: an asymmetric sculptural shape, inner curved highlight, shaded interior, and the established progressive rotation and opacity. The redesign changes only lavender/rose/peach color and the clarity progression (3px → 2px → 1px → no blur). It does not replace the fig with a circular image. All four states are shown on `/design`.

## Typography and materials

Instrument Serif Regular/Italic carries display headings; Helvetica Neue/Arial carries controls, body text and measurements. Instrument Serif is self-hosted under the SIL Open Font License, retained in `public/fonts`. Source: [Google Fonts / Instrument Serif](https://github.com/google/fonts/tree/main/ofl/instrumentserif).

Cards use real `backdrop-filter` and the prefixed WebKit equivalent, translucent fill, a thin white edge and subtle inset highlights. Cards, navigation and dialogs share the same material; form/dialog opacity is higher for readability. The user’s explicit request for CSS color treatment and the existing fig takes precedence over the earlier generated-asset direction.

Foundations are in `app/globals.css`; the presentation layer is in `app/theme.css`; `/design` uses the production components and tokens. No camera, storage, metric, routing or dialog containment logic changes in this correction.
