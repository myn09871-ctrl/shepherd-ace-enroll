

# Multi-Feature Enhancement Plan

## Overview
Implement 6 features: admin name display fix, bulk position calculation, PDF download for report cards, application delete cleanup, profile photo on report cards, and admin layout showing profile name/avatar.

## 1. Admin Layout — Show Profile Name & Avatar Instead of Email

**File: `src/components/admin/AdminLayout.tsx`**
- Fetch `admin_profiles` for the logged-in user on mount
- Replace the email-derived `adminName` with `display_name` from the profile (fallback to email-derived name)
- Show the avatar in the top bar next to the name
- Link the name/avatar area to `/admin/profile` for easy access

## 2. Bulk Position Calculation on Save

**File: `src/pages/admin/ReportCards.tsx`**
- Add a "Calculate Positions" button next to "Generate All" and "Publish All"
- When clicked:
  1. Fetch all grades for the selected class/year/term
  2. For each subject, rank students by `total_score` descending → assign `position_in_subject`
  3. For each student, compute `learner_average` from their grades, then rank all students → assign `position_in_class`
  4. Batch update `grades.position_in_subject` and `report_cards.position_in_class` + `learner_average`
- Also auto-run position calculation when saving an individual report card (after all grades are saved)

## 3. PDF Download for Report Card

**File: `src/pages/portal/PortalReportCard.tsx`** and **`src/pages/admin/ReportCards.tsx`**
- Install/use `html2canvas` (already available or add) + `jspdf`
- Add a "Download PDF" button
- Implementation: capture `#report-card-print` element with `html2canvas`, then create a jsPDF page from the canvas image
- Add the same button in the admin preview dialog

## 4. Application Delete — Already Implemented
Looking at the code, archive and delete buttons are **already implemented** in `Applications.tsx` (lines 280-304). Archive shows for non-archived/non-enrolled apps, delete shows for archived/rejected apps with a confirmation dialog. No changes needed here.

## 5. Admin Profile Name Update — Already Implemented
The `AdminProfile.tsx` page already has display name editing and avatar upload functionality. No changes needed to the profile page itself — only the layout top bar needs updating (covered in item 1).

## 6. Student Photo on Report Card — Already Implemented
`ReportCardPreview.tsx` already renders `data.photo_url` in the header (line 72-78). The parent portal profile page already has photo upload. No changes needed.

---

## File Changes Summary

| File | Change |
|------|--------|
| `src/components/admin/AdminLayout.tsx` | Fetch admin profile, show name + avatar in top bar |
| `src/pages/admin/ReportCards.tsx` | Add "Calculate Positions" bulk action, auto-rank on save |
| `src/pages/portal/PortalReportCard.tsx` | Add "Download PDF" button using html2canvas + jspdf |
| `src/pages/admin/ReportCards.tsx` | Add PDF download in preview dialog |

## Technical Notes
- `html2canvas` + `jspdf` will be used for PDF generation — captures the styled HTML report card as an image and embeds it in a PDF
- Position calculation queries all students in the class to compute relative rankings
- Admin profile fetch in layout uses `maybeSingle()` to handle cases where no profile exists yet

