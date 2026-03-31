# Redesign Teacher Dashboard and Parent Dashboard to Match Uploaded UI References

## Overview

Redesign both dashboards to closely match the uploaded reference images while keeping all existing backend connections intact. The teacher dashboard gets a blue background page with warm welcome card, stat counters, quick action cards with icons, and recent activity/upcoming events sections. The parent dashboard gets a mobile-optimized layout with student selector, grouped dashboard cards (Fees Summary, Attendance, Academic Performance, Announcements), tabbed Messages/Documents section, and a bottom navigation bar on mobile.

---

## Teacher Dashboard Redesign

**Reference image**: Blue background page, welcome card with greeting + class count, 3 stat cards (My Students: 54, Assigned Classes: 2, Pending Tasks: 3), 3 quick action cards with large icons (Mark Attendance, Enter Results, Create Assignment), two side-by-side sections (Recent Activity + Upcoming Events).

### Changes to `src/pages/teacher/TeacherDashboard.tsx`

- **Page background**: Light blue (`bg-blue-50/50`) to match the reference
- **Welcome card**: Full-width beige/cream card with emoji greeting, teacher name, and class count for the day. Example: "Good Morning, Mr. Mensah. You have 2 classes today."
- **Stats row**: 3 horizontal stat cards (white with border) showing icon + label + large number:
  - My Students (count from `students` table by assigned classes)
  - Assigned Classes (from `class_teachers`)
  - Pending Tasks (count of ungraded subjects or unmarked attendance -- query `assignments` with recent due dates)
- **Quick Actions**: 3 cards with larger centered icons (teal/green checkmark for Attendance, A+ grade icon for Results, clipboard for Assignments). Each navigates to the respective route.
- **Bottom section**: Two columns:
  - **Recent Activity**: List items showing recent grade posts and messages, fetched from `grades` (latest posted) and `parent_messages` (latest received). Each item is clickable.
  - **Upcoming Events**: List from `portal_announcements` with upcoming dates.
- All data fetched from Supabase -- no placeholder/fake data.

### Changes to `src/components/teacher/TeacherLayout.tsx`

- **Top bar**: Add "Welcome, Mr. [Name]!" text on the left side. Right side keeps notification bell (with badge count), avatar + name, and a "Logout" button styled as a blue pill.
- Background of the content area: subtle blue tint

### Changes to `src/components/teacher/TeacherSidebar.tsx`

- Already matches the reference (blue sidebar with school crest, white active state). Minor adjustments:
  - Ensure "GOOD SHEPHERD INTERNATIONAL SCHOOL" text matches the reference (uppercase, two-line)
  - Active state: white background with dark blue text (already implemented)

---

## Parent Dashboard Redesign

**Reference image**: Mobile-first design with school header bar (crest + "Good Shepherd School" + notification bell), student selector dropdown showing parent name + selected child with photo and class, "Welcome, [Parent]!" greeting, then a 2-column card grid:

1. **Fees Summary** card (orange header): Outstanding amount, payment status badge, "View All Fees" button
2. **Attendance** card (green header): Percentage with circular progress, days present/total, recent absence records, "View Attendance" button
3. **Academic Performance** card (blue header): Latest exam result term, current average %, grade distribution dots, "View All Results" button
4. **Latest Announcements** card (yellow/orange header): Recent announcement title + preview text
5. **Messages + Recent Documents** tabbed section: Message list with sender avatar + preview, document list with "View PDF" buttons
6. **Bottom navigation bar** (mobile only): Dashboard, My Children, Messages (with badge), Documents, Fees

### Changes to `src/pages/portal/PortalDashboard.tsx`

- Remove the current gradient welcome header and replace with a simpler "Welcome, [ParentName]!" text heading
- Replace the 4 stat cards with the reference layout:
  - **Fees Summary card**: Orange/red header badge, GHS amount outstanding, payment status badge (Partially Paid / Fully Paid / Unpaid), "View All Fees" button. Data from `fees` table.
  - **Attendance card**: Green header badge, percentage with a small circular progress indicator, "X / Y / Z Current Days Present", list of recent absent dates from `attendance` table, "View Attendance" button.
  - **Academic Performance card**: Blue header badge, latest exam result period, current average percentage (large text), grade letter distribution (A, P, AP, D, B counts from `grades`), "View All Results" button.
  - **Latest Announcements card**: Yellow/amber header badge, latest announcement title + truncated content from `portal_announcements`.
- **Messages + Documents section**: Tabbed or side-by-side. Messages list shows sender name, preview text, timestamp, with "View PDF" button for document-type messages. Documents tab shows recent `student_documents`.
- All data from Supabase with real queries.

### Changes to `src/components/parent/ParentLayout.tsx`

- **Top header bar**: School crest + "Good Shepherd School" on left, notification bell on right
- **Student selector**: Below the header, show parent name dropdown on left + selected child's photo + name + class on right. Uses existing `students` array and `setCurrentStudent`.
- **Mobile bottom nav bar** (visible only on small screens): 5 icons -- Dashboard, My Children, Messages (with unread badge), Documents, Fees. Hide sidebar on mobile entirely, use bottom nav instead.
- Keep sidebar for desktop/tablet.

### Changes to `src/components/parent/ParentSidebar.tsx`

- Minor styling refinements to match the cleaner reference look. The sidebar is mainly for desktop; mobile uses bottom nav.

---

## Report Card Enhancement

The report card preview (`ReportCardPreview.tsx`) already has the correct GSIS branding and structure. Minor additions:

- Ensure student `photo_url` is prominently displayed (already implemented)
- No structural changes needed -- the current design matches the GSIS template

---

## File Changes Summary


| File                                                                                                    | Change Type                                                                               |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/pages/teacher/TeacherDashboard.tsx`                                                                | Major rewrite -- new card layout matching reference                                       |
| `src/components/teacher/TeacherLayout.tsx`                                                              | Update top bar with welcome text + logout button                                          |
| `src/pages/portal/PortalDashboard.tsx`                                                                  | Major rewrite -- grouped cards (fees, attendance, academic, announcements, messages/docs) |
| `src/components/parent/ParentLayout.tsx`                                                                | Add mobile bottom nav bar, update header with school branding + student selector          |
| Use smaller font sizes and cards for the ui to sleek and clen`src/components/parent/ParentSidebar.tsx` | Minor style adjustments                                                                   |


## Technical Notes

- All data continues to come from existing Supabase tables (`fees`, `attendance`, `grades`, `portal_announcements`, `parent_messages`, `student_documents`, `students`, `class_teachers`)
- No database schema changes needed -- all required tables and columns already exist
- No new dependencies required
- Mobile bottom nav uses fixed positioning with `z-50`, content area gets `pb-16` on mobile to avoid overlap
- Grade distribution in Academic Performance card counts grade letters from `grades` table grouped by `grade_letter`