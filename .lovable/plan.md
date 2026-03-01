
# Automated Report Card System for GSIS

## Overview
Build a full report card system that mirrors the GSIS Excel template's logic (IAS/ETES scoring, proficiency levels 1-5, grade letters A/P/AP/D/B) while adopting the colorful visual design from the reference image (school crest header, student photo, colored subject rows, grade interpretation key). Admin can enter scores per student, and all calculations (totals, proficiency, grades, class averages, positions) are automated.

## What the GSIS Report Card Contains

**Score Structure:**
- IAS (50%) -- Internal Assessment Score (replaces current class_work + assignment + midterm)
- ETES (50%) -- End of Term Exam Score (replaces current endterm)
- Total Score (100%) = IAS + ETES

**Grading Scale (GSIS-specific, NOT the old A1-F9):**
| Marks | Level | Grade | Meaning |
|-------|-------|-------|---------|
| 80%+  | 1 | A | Advanced |
| 75-79% | 2 | P | Proficient |
| 70-74% | 3 | AP | Approaching Proficiency |
| 65-69% | 4 | D | Developing |
| Below 64% | 5 | B | Beginning |

**Additional Report Fields:**
- Attendance (days present out of total)
- Conduct, Attitude, Interest
- Form Teacher's Name and Remark
- Headteacher's Name and Remark
- Next Term Begins date
- Promoted To class
- Number on Roll (total students in class)
- Student passport photo
- Cumulated Score (total of all subjects) out of max (subjects x 100)
- Class Average Score, Learner's Average Score

---

## Database Changes

### 1. New `report_cards` Table
Stores per-student, per-term report metadata (the fields that aren't per-subject):

```text
report_cards:
  id (uuid, PK)
  student_id (uuid, FK -> students)
  academic_year (text)
  term (text)
  class_name (text) -- snapshot of class at time of report
  number_on_roll (integer) -- total students in class
  attendance_present (integer)
  attendance_total (integer)
  conduct (text)
  attitude (text)
  interest (text)
  form_teacher_name (text)
  form_teacher_remark (text)
  headteacher_name (text)
  headteacher_remark (text)
  next_term_begins (date)
  promoted_to (text)
  cumulated_score (numeric) -- auto-calculated
  max_possible_score (numeric) -- subjects_count x 100
  learner_average (numeric) -- auto-calculated
  class_average (numeric)
  position_in_class (integer)
  is_published (boolean, default false) -- only visible to parents when true
  created_at, updated_at (timestamps)
  UNIQUE(student_id, academic_year, term)
```

### 2. Modify `grades` Table
Add/rename columns for IAS/ETES structure:

```text
Add columns:
  ias_score (numeric) -- Internal Assessment Score (out of 50)
  etes_score (numeric) -- End of Term Exam Score (out of 50)
  proficiency_level (integer) -- 1-5
  grade_description (text) -- "Advanced", "Proficient", etc.
  position_in_subject (integer) -- position for this specific subject
```

The existing `total_score` and `grade_letter` columns will be repurposed for the new grading scale.

### 3. RLS Policies
- `report_cards`: Admin full access; parents can SELECT their own children's published reports
- Updated `grades` policies remain as-is (admin write, parent read)

---

## File Changes

### New Files

**`src/pages/admin/ReportCards.tsx`** -- Main admin report card management page
- Select class, academic year, term
- See list of all students in that class
- Click a student to open their report card editor
- Bulk actions: "Generate All Reports" (creates empty report_card records for all students in class), "Publish All" (sets is_published = true)

**`src/components/admin/ReportCardEditor.tsx`** -- Single student report card editor
- Top section: Student info (auto-filled from DB), attendance inputs, conduct/attitude/interest
- Middle: Subject score table with IAS and ETES input fields; Total, Proficiency Level, Grade, and Description auto-calculate as admin types
- Bottom: Form teacher name/remark, headteacher name/remark, next term begins, promoted to
- Performance analysis section auto-shows: Cumulated Score, Max Possible, Learner's Average, Class Average
- "Save" and "Preview Report Card" buttons

**`src/components/admin/ReportCardPreview.tsx`** -- Visual report card (styled like the reference image)
- Colorful header with school name, logo/crest, contact info (matching the green/yellow header from reference)
- "LEARNER'S TERMINAL REPORT" title bar
- Student info grid: Name, Gender, Form/Class, Position, Average Mark, Remark, Number on Roll, Academic Year, Term, Promoted To, Next Term Begins
- Subject scores table with colored rows (alternating), columns: S/N, Subject, IAS Score, ETES Score, Total Score, Grade, Level of Proficiency, Description
- Attendance, Conduct, Attitude, Interest section
- Form Teacher and Headteacher remarks
- Grade Interpretation key at the bottom (the 5-level scale)
- School-branded colors: blue header gradient, white body, colored grade cells
- This same component is reused for PDF generation and parent portal viewing

**`src/pages/portal/PortalReportCard.tsx`** -- Parent portal view
- Select term/year
- Renders `ReportCardPreview` in read-only mode
- "Download as PDF" button using jsPDF or html2canvas

### Modified Files

**`src/pages/admin/ResultsManagement.tsx`** -- Restructure score entry
- Change columns from CW(20)/Assign(10)/Mid(30)/End(40) to IAS(50)/ETES(50)
- Update `calculateGradeLetter` to use GSIS proficiency scale (A/P/AP/D/B)
- Add `calculateProficiencyLevel` function
- Auto-calculate position in subject across all students in same class

**`src/pages/portal/PortalAcademics.tsx`** -- Update to match new structure
- Change column headers to IAS/ETES instead of CW/Assignment/Mid/End
- Update grade color coding for new scale (A=green, P=blue, AP=yellow, D=orange, B=red)
- Add link to "View Full Report Card" which navigates to PortalReportCard

**`src/App.tsx`** -- Add new routes
- `/admin/report-cards` -> ReportCards
- `/portal/report-card` -> PortalReportCard

**`src/components/admin/AdminSidebar.tsx`** -- Add "Report Cards" nav item

**`src/components/parent/ParentSidebar.tsx`** -- Add "Report Card" nav item

---

## Report Card Visual Design (Reference Image Style)

The report card preview will be designed to match the uploaded reference image:

```text
+----------------------------------------------------------+
| [School Crest]  GOOD SHEPHERD INTERNATIONAL SCHOOL       |
|                 Contact Info | Email | Motto     [Photo]  |
+----------------------------------------------------------+
|          LEARNER'S TERMINAL REPORT                        |
+----------------------------------------------------------+
| Name: ___________    Gender: ___    Number on Roll: ___   |
| Form/Class: ___      Academic Year: ___    Term: ___      |
| Position: ___        Promoted To: ___                     |
| Average Mark: ___    Remark: ___                          |
| Next Term: ___                                            |
+----------------------------------------------------------+
| S/N | Subject      | IAS | ETES | Total | Grade | Level  |
|-----|--------------|-----|------|-------|-------|--------|
|  1  | English      |  45 |  30  |  75   |   P   |   2    |
|  2  | Mathematics  |  40 |  35  |  75   |   P   |   2    |
| ... (colored alternating rows)                            |
+----------------------------------------------------------+
| OVERALL: 651.0  OUT OF 900.0                              |
+----------------------------------------------------------+
| Attendance: 54/56  | Conduct: Respectful                  |
| Attitude: Hardworking | Interest: Poetry reciting          |
| Form Teacher: ___ | Remark: ___                           |
| Headteacher: ___ | Remark: ___                            |
| Date: ___                                                 |
+----------------------------------------------------------+
| GRADE INTERPRETATION                                      |
| 80%+ (1: Advanced) | 75-79 (2: Proficient) | ...         |
+----------------------------------------------------------+
```

Colors will use the school's blue brand as the primary header, with green/teal accents for grade highlights, matching the reference image's vibrant style.

---

## Auto-Calculation Logic

1. **Total Score**: IAS + ETES (max 100)
2. **Proficiency Level**: Based on total (80+=1, 75-79=2, 70-74=3, 65-69=4, <65=5)
3. **Grade Letter**: Maps from level (1=A, 2=P, 3=AP, 4=D, 5=B)
4. **Grade Description**: "Advanced", "Proficient", "Approaching Proficiency", "Developing", "Beginning"
5. **Cumulated Score**: Sum of all subject totals
6. **Max Possible**: Number of subjects x 100
7. **Learner's Average**: Cumulated / Number of subjects
8. **Class Average**: Average of all students' learner averages in same class/term/year
9. **Position in Class**: Rank by learner's average (computed when saving)
10. **Position in Subject**: Rank by subject total among classmates

---

## Implementation Sequence

1. Database migration (report_cards table + new grades columns + RLS)
2. Update ResultsManagement with IAS/ETES inputs and new grading scale
3. Create ReportCardEditor (admin enters attendance, remarks, etc.)
4. Create ReportCardPreview (colorful visual report card)
5. Create ReportCards admin page (class list -> student report cards)
6. Create PortalReportCard (parent view with PDF download)
7. Update routes and sidebars
8. Update PortalAcademics to reflect new column structure
