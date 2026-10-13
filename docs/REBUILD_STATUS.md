# Architectural rebuild — development preview

Implementation checkpoint: `76d77f4` (subsequent documentation commits do not change model).
Preview: https://deploy-preview-7--alterra3d.netlify.app

## Implemented

- Uniformly scaled outline traced from the recovered hand sketch: continuous
  four-story shell, front recesses and rear projections, triangulated roof cap.
- New `assets/alterra-building.glb`, loaded by the bundled GLTFLoader. Nineteen
  material/site batches, approximately 5.1 MiB; no external texture requests.
- Brick/siding courses, recessed framed glazing, curtain variation, balcony
  slabs and railings, parapets and rooftop equipment constrained to the roof.
- Front road, rear parking, sidewalks, cars and planting.
- Five camera presets, orbit, wheel/pinch zoom, keyboard controls, reset,
  optional status overlays and 283 unique schematic selection targets.
- Model-derived static views when WebGL is unavailable. They support preset
  switching and image zoom; they do not simulate interactive orbit or raycasting.
  Apartment selection remains available through the unit dropdown and records.
- Original navy dashboard identity retained: property header, status indicators,
  prominent viewer, right operations panel, five management tabs and inspector.
- Responsive CSS, focus indicators and unit selector. Authentication/database
  configuration remains unchanged; guest data is still temporary.
- Local pinned Three.js/GLTFLoader with MIT license; clean `dist/` deploy bundle.
- Legacy `assets/alterra-building.gltf` is obsolete and excluded from deployment,
  retained in source history during review.

## Checks completed

- Khronos glTF validator: **0 errors, 0 warnings**.
- Actual Three.js GLTFLoader parses the exported binary successfully.
- CPU checks: 19 merged meshes, finite coordinates, 283 unique targets,
  selection highlighting, orthographic zoom/reset and fallback view switching.
- All five depth-buffered CPU model renders generated; all five
  renders inspected. An initial painter-order artifact was corrected using a
  per-pixel depth buffer. These are **not WebGL screenshots**.
- `npm run build` passes, and Netlify reports a successful deploy preview.
- HTTP checks return 200 for the page, viewer, styles, model, layout and all five
  fallback images. Viewer/styles/model/layout/images exactly match local bytes.

## Acceptance still pending — do not merge

The browser previously failed to create a WebGL context. Attempts to open the
new preview timed out twice. Therefore the new release has **not** passed real
browser desktop/mobile checks, live orbit/pinch/raycast checks, or authenticated
write tests. Production/main have not been changed. The earlier production
version's guest-tab smoke checks are not acceptance of this replacement.

## Remaining architectural approximations

The footprint is a freehand trace, not a survey. The five-view composite does
not provide an exact apartment map or construction dimensions. Facade bay
spacing, balcony locations, roof equipment, street curvature and landscaping
are conceptual. The schematic unit targets are explicitly labeled, and must
not be used as verified apartment locations. Materials use modeled detail and
flat PBR colors, not photographic textures. This is an architectural concept
model, not a photorealistic or surveyed digital twin.

## Reproduction

```sh
npm ci
npm run model
npm test
npm run build
```

To regenerate the five model-derived fallback views, install Python `numpy` and
`Pillow`, then run:

```sh
MODEL_RENDER_DATA=/tmp/alterra-render.json npm run model
MODEL_RENDER_DATA=/tmp/alterra-render.json python3 scripts/render-previews.py
```

The binary and committed previews must be regenerated together after any model
edit. See `model-review.jpg` for the five-view contact sheet.
