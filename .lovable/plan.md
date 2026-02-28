
# Restructure Admission Form to Match Physical School Form

## Overview
Align the digital admission form with the school's official paper form structure (sections A-H), adding missing fields and reorganizing existing ones. The Parent Portal account section and automated approval logic remain untouched.

## What the Physical Form Has That's Missing Digitally

### Section A - Child's Personal Data (missing fields)
- Hometown
- Language(s) Spoken
- Religion
- Passport-size photograph upload

### Section B - Health Status (partially covered, needs restructuring)
- Specific immunization checklist: BCG, DTP, Whooping Cough, Tetanus, Poliomyelitis, Measles, Yellow Fever, Hepatitis B (3 doses), HIB (3 doses)
- Currently uses generic checkboxes; needs to match the exact vaccinations listed

### Section C - Record of Previous School (missing fields)
- Date Attended
- Last Class Attended (separate from current "last grade completed")

### Section D - Subjects Studied in Previous School (entirely missing)
- Science: Natural Science, Integrated Science, Mathematics
- Social Sciences: Social Studies, RME, Citizenship
- Languages: English, French, Akwapim Twi
- Vocational Skills: Creative Arts, Pre-Tech/BDT, ICT

### Section E - Biological Family Data (needs restructuring)
Current form has "Primary Guardian" and "Secondary Guardian". Physical form has three columns: **Father**, **Mother**, **Guardian** -- each with:
- Name, Occupation, Educational Qualification, Marital Status, Religion
- Address, Tel No (Local or Abroad), Location, House No
- No. of children in home, Other children in this school (Yes/No, how many, which classes)
- Who is responsible for fees (Mr/Mrs/Miss)
- Pupil presently lives with, Younger/Older sibling info

### Section F - Fee Payment Policy (entirely missing)
Three FLEXI Payment Plans:
- One Touch (full fee at once on re-opening)
- Two months Installments (50% on re-opening, 50% after Mid-terms)
- Daily Susu Payment Scheme

### Section G - Regulations (display only, partially in consent)
- Dismissal rules
- Withdrawal notice requirements

### Section H - Undertaking (partially in consent)
- Agreement and signature line

---

## Implementation Plan

### Step 1: Database Migration
Add new columns to `enrollment_applications` table:

```text
Student fields:
  - student_hometown (text, nullable)
  - student_languages_spoken (text, nullable)
  - student_religion (text, nullable)

Father fields (reuse guardian1_ prefix):
  - guardian1_educational_qualification (text, nullable)
  - guardian1_marital_status (text, nullable)
  - guardian1_religion (text, nullable)
  - guardian1_house_no (text, nullable)
  - guardian1_location (text, nullable)
  - guardian1_children_in_home (integer, nullable)
  - guardian1_other_children_in_school (boolean, nullable)
  - guardian1_how_many_children (text, nullable)
  - guardian1_children_classes (text, nullable)
  - guardian1_responsible_for_fees (boolean, nullable)
  - guardian1_pupil_lives_with (boolean, nullable)

Mother fields (reuse guardian2_ prefix, add new):
  - guardian2_occupation (text, nullable)
  - guardian2_educational_qualification (text, nullable)
  - guardian2_marital_status (text, nullable)
  - guardian2_religion (text, nullable)
  - guardian2_house_no (text, nullable)
  - guardian2_location (text, nullable)
  - guardian2_tel_no (text, nullable)
  - guardian2_children_in_home (integer, nullable)
  - guardian2_other_children_in_school (boolean, nullable)
  - guardian2_how_many_children (text, nullable)
  - guardian2_children_classes (text, nullable)
  - guardian2_responsible_for_fees (boolean, nullable)
  - guardian2_pupil_lives_with (boolean, nullable)

Guardian (third person) fields:
  - guardian3_name (text, nullable)
  - guardian3_occupation (text, nullable)
  - guardian3_educational_qualification (text, nullable)
  - guardian3_marital_status (text, nullable)
  - guardian3_religion (text, nullable)
  - guardian3_address (text, nullable)
  - guardian3_tel_no (text, nullable)
  - guardian3_location (text, nullable)
  - guardian3_house_no (text, nullable)
  - guardian3_children_in_home (integer, nullable)
  - guardian3_responsible_for_fees (boolean, nullable)
  - guardian3_pupil_lives_with (boolean, nullable)

Previous school fields:
  - previous_school_date_attended (text, nullable)
  - previous_school_last_class (text, nullable)
  - subjects_studied (text[], nullable)

Fee payment:
  - fee_payment_plan (text, nullable)

Immunizations (specific):
  - immunization_bcg (boolean, default false)
  - immunization_dtp (boolean, default false)
  - immunization_whooping_cough (boolean, default false)
  - immunization_tetanus (boolean, default false)
  - immunization_poliomyelitis (boolean, default false)
  - immunization_measles (boolean, default false)
  - immunization_yellow_fever (boolean, default false)
  - immunization_hepatitis_b (boolean, default false)
  - immunization_hib (boolean, default false)
```

### Step 2: Update Zod Schema (`src/lib/admission-schema.ts`)
- Add new fields to `studentInfoSchema` (hometown, languages, religion)
- Add `fatherSchema`, `motherSchema`, `guardianSchema` to replace guardian1/guardian2 schemas (while keeping guardian1_/guardian2_ DB column mapping for backward compatibility)
- Add `subjectsStudiedSchema` with checkbox arrays matching the physical form
- Add `feePaymentSchema` with the 3 FLEXI options
- Add specific immunization fields to health schema
- Add `undertakingSchema` for the agreement section
- Keep `portalAccountBaseSchema` completely unchanged

### Step 3: Restructure FormPage1 (`src/components/admission/FormPage1.tsx`)
Reorganize into sections matching the physical form:

**Section A: Child's Personal Data**
- Existing: Surname, Other Names, Date of Birth, Gender, Nationality, Place of Birth
- New: Hometown, Language(s) Spoken, Religion
- New: Passport photo upload area

**Section B: Health Status of Child** (moved from Page 2)
- Health problems/defects text area
- Immunization checklist with specific vaccines: BCG, DTP, Whooping Cough, Tetanus, Poliomyelitis, Measles, Yellow Fever, Hepatitis B, HIB
- Additional info for school management

**Section C: Record of Previous School(s) Attended**
- Name of School, Address, Date Attended, Last Class Attended
- "Applying For Admission To Class" dropdown

**Section D: Subjects Studied in Previous School** (tick boxes)
- Science: Natural Science, Integrated Science, Mathematics
- Social Sciences: Social Studies, RME, Citizenship
- Languages: English, French, Akwapim Twi
- Vocational Skills: Creative Arts, Pre-Tech/BDT, ICT

**Parent Portal Account** (kept as-is, digital-only section)

### Step 4: Restructure FormPage2 (`src/components/admission/FormPage2.tsx`)
Reorganize into sections matching the physical form:

**Section E: Biological Family Data**
Three-column layout for Father, Mother, and Guardian:
- Name, Occupation, Educational Qualification, Marital Status, Religion
- Address, Tel No, Location, House No
- No. of children in the home, Other children in school (Yes/No, how many, which classes)
- Who is responsible for fee payment
- Child presently lives with

**Section F: Fee Payment Policy**
Display the three FLEXI payment plans with radio selection:
- One Touch
- Two Months Installments
- Daily Susu Payment Scheme

**Section G: Regulations** (display only)
Show dismissal and withdrawal rules as read-only text

**Section H: Undertaking**
Agreement text with date and digital signature checkbox

**Existing sections kept:**
- Special Educational Needs (enhanced from current)
- Financial Acknowledgment (merged with Section F)
- Transportation (kept)
- Consent checkboxes (merged into Section H Undertaking)

### Step 5: Update PDF Generation (`src/pages/AdmissionForm.tsx`)
- Restructure PDF sections to match A-H layout
- Add the new fields to PDF output
- Keep the reference number and header format
- Do NOT touch the submission handler's portal account fields or the approve-admission edge function trigger

### Step 6: Update Submission Handler
- Add new fields to the `applicationData` object in the submit function
- Map form field names to database column names
- Keep all portal_email, portal_password_hash, security_question, security_answer handling exactly as-is

## What Will NOT Change
- Parent Portal Account section (portal_email, password, security question)
- The `approve-admission` edge function
- The automated student/parent record creation on approval
- The `AdmissionFormHeader` component
- Navigation footer and page structure (still 2 pages)
- Reference number generation

## File Changes Summary
1. **Database migration** -- Add ~40 new nullable columns
2. **`src/lib/admission-schema.ts`** -- Restructured Zod schemas with new fields
3. **`src/components/admission/FormPage1.tsx`** -- Sections A, B, C, D + Portal Account
4. **`src/components/admission/FormPage2.tsx`** -- Sections E, F, G, H + Special Needs + Transport
5. **`src/pages/AdmissionForm.tsx`** -- Updated default values, submission data mapping, PDF generation
