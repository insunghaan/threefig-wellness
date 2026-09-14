# App ring asset

Asset: `public/images/ring-onboarding-v1.png`.

Created with the built-in image generation tool using the user's silver ring reference. A floating three-quarter angle replaces the old CSS ring across onboarding, profile, and ring settings. The final image has a white matte blended into the app surface with CSS multiply; it is not an alpha cutout. Gold finish remains a display tint of the same geometry.

## Generation prompt

Use case: product-mockup. Create one premium photorealistic polished silver wellness ring cutout for the 3FIG mobile onboarding screen, using the attached ring ONLY as product design reference. Preserve its slim continuous rounded band, narrow width, gently domed exterior, smooth silver mirror finish, no gemstones, no markings, no bulky edges or sensors. DIFFERENT composition from reference: floating horizontally tilted ring in a refined three-quarter view seen slightly from above, its opening a generous diagonal oval, long axis leaning from lower-left to upper-right just 20 degrees, elegantly hovering, centered, occupying 72% canvas. Soft lilac reflected studio highlights with crisp white highlights and controlled charcoal reflection on real silver, extremely sophisticated product photography. Genuinely transparent background with alpha including through the ring opening; no floor, no pedestal, no opaque backdrop, no baked shadow. Full ring completely visible with ample margins. Square canvas. No text, no logos. This is a single reusable product asset, not a UI mockup.

## Final refinement prompt

Edit this product image only. Keep exactly the silver ring, its shape, pose, scale, reflections and full framing. Remove the entire checkerboard background including the checkerboard visible through the ring opening. Replace ALL checkerboard with a perfectly uniform pure white #FFFFFF background. This is a clean product cutout on pure white, NO transparency checkerboard, no gray squares anywhere, no floor horizon, no text, no shadow, no other changes. Preserve smooth polished metal edges.


## Transparent cutout v2
- Asset: `public/images/ring-onboarding-transparent-v2.png`
- Built-in image generation edit, background-extraction, September 11, 2026.
- Replaces the opaque white-matte image in the shared Ring component. Normal blending preserves metal highlights.
- Prompt: Remove ONLY the white background outside the ring and through the open center. Deliver a genuine transparent PNG with alpha=0 in all background pixels, NOT a white background, NOT a drawn checkerboard. Preserve the exact ring geometry, angle, size, silver reflections, bright metal highlights, lilac reflected tint and all edges. No floor, no drop shadow, no text. Keep the ring itself opaque. This is a clean product cutout to overlay on a translucent lavender UI card. Actual transparency is essential.
