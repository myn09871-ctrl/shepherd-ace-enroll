
# Exact Dashboard Correction Plan

## Goal
Replace the current teacher and parent dashboard UI with a much closer, mobile-first reproduction of the earlier uploaded references. Keep all existing backend queries, auth, routing, and real data intact. Only the presentation layer changes.

## What is wrong in the current build
The current implementation diverges from the approved references in these key ways:

- Teacher dashboard uses a framed desktop shell, sidebar emphasis, and white mini-cards instead of the stacked full-width colored stat panels shown in the reference.
- Teacher quick actions are arranged in a grid with oversized icon blocks instead of tall bordered action rows.
- Parent dashboard uses colored header bands, gradients, extra visual decoration, and multi-column desktop composition instead of the plain stacked white cards in the reference.
- Parent sections include extra labels/copy that do not match the reference wording or hierarchy.
- Typography, spacing, border radii, and card density are still too large or too “generated” compared with the screenshots.
- The overall mobile presentation does not match the uploaded images closely enough.

## Build approach

### 1. Rework both dashboards as mobile-first replicas
Use the uploaded references as the source of truth for:
- section order
- spacing
- card height
- border radius
- font scale
- icon placement
- button style
- topbar layout
- badge treatment
- empty-state treatment

Desktop can expand gracefully, but mobile must match the references first.

### 2. Teacher dashboard: rebuild to match the reference layout
Update `src/pages/teacher/TeacherDashboard.tsx` so it matches the uploaded teacher screenshot:

- Beige welcome card at top with compact heading/subtext
- Three full-width stacked stat panels:
  - My Students
  - Assigned Classes
  - Pending Tasks
- Each stat panel uses strong solid color backgrounds and a faint large icon watermark at right
- Quick Actions section becomes three vertically stacked bordered action cards:
  - Mark Attendance
  - Enter Results
  - Create Assignment
- Recent Activity becomes a simple white card section with one-row items and right-aligned date
- Upcoming Events becomes a simple white card section with compact list items and red-toned calendar icon chips

Keep:
- student count query
- assigned class count
- pending task count
- recent activity data
- upcoming events data
- existing route navigation

Change only:
- structure
- text sizing
- spacing
- icon composition
- card styling

### 3. Teacher layout: simplify the shell to match the screenshot
Update `src/components/teacher/TeacherLayout.tsx` and `src/components/teacher/TeacherSidebar.tsx`:

- Remove the heavy “dashboard frame” feel on mobile
- Use a plain white topbar like the screenshot
- Keep hamburger left, bell icon, profile/avatar right
- Reduce visual noise in the header
- Keep sidebar for navigation, but make it secondary so the dashboard page itself matches the screenshot

### 4. Parent dashboard: rebuild to the exact stacked-card composition
Update `src/pages/portal/PortalDashboard.tsx` to match the uploaded parent screenshot:

Order and treatment:
1. Academic Performance
2. Attendance This Term
3. Messages
4. Latest Announcements
5. Fees Summary
6. Recent Documents

For each section:
- white card
- light border
- subtle shadow
- compact title/subtitle
- minimal color accents only where shown
- no colored header bars
- no oversized gradients
- no decorative chart blocks that are not in the reference

Specific corrections:
- Academic card: simple header, slim status pill, compact progress bars, compact metrics layout
- Attendance card: large percentage on left, total days on right, single dark-blue progress bar, bordered CTA button
- Messages card: small unread badge, one compact message preview card, bordered CTA button
- Announcements card: unread badge, compact stacked announcement tiles, bordered CTA button
- Fees card: prominent GH¢ value, green paid pill, bordered CTA button
- Documents card: plain list or empty-state with centered “View All” heading treatment matching the screenshot

Keep:
- fees query
- attendance query
- grades query
- announcements query
- messages query
- documents query
- real navigation targets

Remove or simplify:
- colored section headers
- extra gradients
- complex SVG chart styling
- extra summary chips
- non-reference copy

### 5. Parent layout: simplify the mobile chrome
Update `src/components/parent/ParentLayout.tsx` and `src/components/parent/ParentSidebar.tsx`:

- Match the screenshot’s cleaner mobile top area
- Keep hamburger and bell
- Reduce prominence of extra desktop chrome on mobile
- Preserve child switching, but make it visually quieter
- Keep bottom navigation only if it does not conflict with the reference; otherwise tone it down to fit the uploaded design language

### 6. Global CSS cleanup for exact visual language
Update `src/index.css` to support the reference look:

- smaller typography scale throughout dashboard routes
- tighter card padding
- softer shadows
- light neutral card surfaces
- exact navy/beige/light-blue palette from memory
- remove leftover “framed app shell” styling that makes the UI look unlike the references
- add reusable classes for:
  - stacked stat panels
  - subtle white dashboard cards
  - compact badge pills
  - bordered secondary buttons
  - icon watermark panels
  - compact list rows

## Files to update
- `src/pages/teacher/TeacherDashboard.tsx`
- `src/components/teacher/TeacherLayout.tsx`
- `src/components/teacher/TeacherSidebar.tsx`
- `src/pages/portal/PortalDashboard.tsx`
- `src/components/parent/ParentLayout.tsx`
- `src/components/parent/ParentSidebar.tsx`
- `src/index.css`

## Technical details
- No database changes
- No backend changes
- No new dependencies required
- Existing Lovable Cloud data connections stay as-is
- Existing real-time/data-fetch behavior stays intact
- This is a UI correction pass focused on pixel-close parity with the uploaded references

## Acceptance criteria
The redesign is complete when:

- Teacher mobile dashboard visually matches the earlier uploaded reference in layout, density, and section order
- Parent mobile dashboard visually matches the earlier uploaded reference in layout, density, and section order
- Font sizes are clearly smaller and tighter than the current build
- No emoji appear anywhere in the UI or copy
- Both dashboards still use real persistent data and real routes
- The result no longer looks generic or template-like compared with the reference screenshots
