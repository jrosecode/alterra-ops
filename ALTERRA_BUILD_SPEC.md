# Alterra Ops — 3D property operations dashboard

**Property:** 3350 at Alterra, 3350 Toledo Terrace, Hyattsville MD 20782.  
**Branch:** `feat/alterra-ops-dashboard`  
**Status:** planning scaffold; implementation and acceptance tests are NOT yet complete.

## Scope

Replace WareTrack game systems with 283 selectable apartments spread over four floors, with isometric camera, click-to-inspect, camera focusing, and status-based coloring. Add five operations tabs: Work Orders, Inspections, CapEx, Turns, Leasing. Demo data only.

## Architecture

- One static `index.html`, three.js and no required backend.
- Preserve scene, camera, raycasting, inspector and geometry utility patterns where practical.
- New `SAVE_KEY = 'alterra.ops.v1'`; seed once, then persist every mutation.
- Unit records, work orders, inspections, capital projects, unit turns and leasing events; no residents' real personal information.
- All status colors derive from current store. Emergency open orders take priority (red), then turn (amber), rent-ready vacant (green), otherwise occupied (slate). Failed or scheduled inspections receive separate purple overlay/badge.
- Selecting a unit reveals unit attributes, linked orders, inspection history and turn records.

## Seed dataset and consistency

Exactly 283 units. Suggested mutually exclusive initial states: 255 occupied, 8 vacant rent-ready, 12 in turn, 8 maintenance = 283 (90.1% occupied). The originally suggested 90% plus 8 vacant, 12 turns and 8 maintenance would exceed 283; derive occupancy from actual units and do not hard-code it.

Generate 25 work orders including at least two open emergencies, six upcoming inspections, four CapEx projects, ten turn projects and fifteen leasing events within the past fourteen days. Use obviously fictional demo names, IDs and records.

## Features

1. Top bar with property name, date, derived occupancy percentage, open-order counter and emergency notices.
2. Work Orders: All/Open/Emergency filters, create, edit and close orders; selections focus the 3D unit.
3. Inspections: schedule; record pass/fail; a passed re-inspection clears a prior failed flag.
4. CapEx: project cards, editable spend and live budget-versus-spend bars.
5. Turns: Inspect → Repairs → Paint → Clean → Ready transitions; ready creates vacant/rent-ready state.
6. Leasing: recent fourteen-day event feed, derived occupancy and vacancy summaries.
7. Toasts on emergencies, failed inspections and overdue turns.

## Verification before merge

- Serve locally; no uncaught console errors.
- 283 unique clickable unit meshes on four floor levels.
- Selecting each unit opens correct inspector and focuses camera.
- Emergency-create recolors red immediately; close restores derived color.
- Turn-ready becomes green.
- Failed inspections flag purple; re-inspection pass clears flag.
- Create/edit round trips through page reload and `localStorage`.
- No old user-facing warehouse simulation or game mechanics.
- CapEx spend edits update bars; leasing and occupancy reflect persisted state.
- GitHub Pages configured from `main` only after review.

## Legal and privacy gates

The upstream WareTrack code appears to have no LICENSE file. **Do not ship a modified copy publicly or use commercially without explicit permission/license from its copyright holder.** This branch contains only an original specification for development planning; the fork's inherited source is already present in the owner's existing repository. Verify authorization before publishing the modified app. Do not commit real resident data, credentials or API keys.
