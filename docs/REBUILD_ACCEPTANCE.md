# Alterra Ops — architectural reconstruction and UI acceptance specification

## Reference authority
The user-provided five-view composite is the visual source of truth: FRONT VIEW (TOLEDO TERR), BACK VIEW (PARKING), LEFT ANGLE (DEAN DR), RIGHT ANGLE (TOLEDO TERR), ROOF VIEW (TOP DOWN).

The images are perspective renderings and are not measured architectural drawings. Do not claim exact dimensions or unit placements based on these images alone.

## Known deficiencies in current implementation
- The Three.js building is a collection of axis-aligned boxes rather than a continuous architectural mesh.
- The current roof outline and courtyard recesses were guessed.
- Windows, balconies, materials, parking, and landscaping repeat mechanically instead of matching the provided views.
- Raycast unit targets are schematic and do not correspond to verified apartment locations.
- The site has no GLTFLoader-based building asset or visual regression tests.
- The CSS added in the prior UI refresh changed the original visual hierarchy without a reference screenshot comparison.

## Geometry acceptance gates
1. Trace a top-down footprint using the supplied roof-view panel. Match outer perimeter, courtyard cutouts, rear wings, and entrance projections. Show overlay for approval.
2. Model a single watertight, connected 4-story building shell with consistent floor heights. Do not scatter disconnected volumes.
3. Match Toledo Terrace frontage: facade bays, brick/light-cladding alternation, balcony stacks, entrance, roof setbacks.
4. Match rear parking elevation and both corner perspectives; verify balconies, parapets, roof mechanical elements.
5. Build roads and parking as separate site meshes. Keep trees out of the line of sight in reference comparison captures.
6. Export optimized glTF 2.0 / GLB. Verify geometry in a standalone glTF viewer before loading into the app.
7. Load via GLTFLoader, preserve orbit/pan/zoom, and add unit pick meshes with verified mapping only. Label unmapped units explicitly.
8. Compare five fixed camera captures with the five supplied views. Do not release until user confirms the shape is right.

## UI acceptance gates
1. Use the original repository CSS as baseline, with screenshot comparisons rather than a speculative redesign.
2. Keep the original header, navy palette, occupancy and work-order indicators, right-side navigation/inspector, and management tabs.
3. Preserve Work Orders, Inspections, CapEx, Turns, Leasing, Supabase sign-in, and guest demo mode.
4. Verify desktop and mobile layouts, no horizontal scrolling, and accessible controls.
5. Confirm 3D initialization, WebGL recovery, raycasting, and status legends in a real browser.
6. Deploy only after browser screenshots and smoke tests pass.

## Current milestone
Original CSS restored in development branch. Architectural modeling and browser screenshot verification are **not yet complete**. Do not merge this branch as a finished reconstruction.
