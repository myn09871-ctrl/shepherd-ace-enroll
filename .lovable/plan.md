

# Teacher Dashboard for Good Shepherd International School

## Overview
Build a complete teacher portal with its own authentication flow, layout, sidebar, and 8 feature pages. Teachers are a new role — they can only access their assigned classes and students, not admin features.

## Database Changes

### 1. Add `teacher` to `app_role` enum
Currently only has: `super_admin`, `admissions_officer`, `content_manager`. Add `teacher`.

### 2. New `teacher_profiles` table
Stores teacher-specific data linked to `auth.users`:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid NOT NULL UNIQUE | references auth.users |
| full_name | text NOT NULL | |
| phone | text | |
| avatar_url | text | |
| created_at / updated_at | timestamptz | |

RLS: Teachers can SELECT/UPDATE own row. Admins full access.

### 3. New `class_teachers` table
Links teachers to classes (a teacher can have multiple classes):

| Column | Type |
|--------|------|
| id | uuid PK |
| teacher_id | uuid NOT NULL | references teacher_profiles.id |
| class_name | text NOT NULL | matches `students.current_class` |
| academic_year | text NOT NULL |
| is_active | boolean DEFAULT true |

UNIQUE(teacher_id, class_name, academic_year). RLS: Teachers can SELECT own rows. Admins full access.

### 4. New `assignments` table

| Column | Type |
|--------|------|
| id | uuid PK |
| teacher_id | uuid | references teacher_profiles.id |
| class_name | text NOT NULL |
| title | text NOT NULL |
| description | text |
| due_date | date |
| attachment_url | text |
| academic_year | text |
| term | text |
| created_at | timestamptz |

RLS: Teachers can manage own assignments. Parents can SELECT where class matches their child. Admins full access.

### 5. Update `is_admin` function
Currently checks for `super_admin`, `admissions_officer`, `content_manager`. Keep as-is — teachers are NOT admins.

### 6. New `is_teacher` function (SECURITY DEFINER)
```sql
CREATE FUNCTION public.is_teacher(_user_id uuid) RETURNS boolean
```
Checks if user has the `teacher` role in `user_roles`.

### 7. New `get_teacher_profile_id` function (SECURITY DEFINER)
Returns the teacher_profiles.id for a given user_id. Used in RLS policies.

### 8. RLS updates for existing tables
- **`grades`**: Add policy for teachers to INSERT/UPDATE/SELECT grades for students in their assigned classes
- **`attendance`**: Add policy for teachers to INSERT/UPDATE/SELECT attendance for their class students
- **`portal_announcements`**: Add policy for teachers to INSERT announcements for their classes
- **`parent_messages`**: Add policy for teachers to manage messages for their class parents
- **`students`**: Add SELECT policy for teachers to view students in their assigned classes
- **`subjects`**: Already has public SELECT — no change needed

### 9. New storage bucket `teacher-avatars` (public)

---

## New Files

### Auth & Layout
1. **`src/hooks/useTeacherAuth.tsx`** — Context provider similar to `useParentAuth`. Fetches `teacher_profiles` and `class_teachers` for the logged-in user. Exposes: `user`, `teacherProfile`, `assignedClasses`, `loading`, `signIn`, `signOut`.

2. **`src/components/teacher/TeacherLayout.tsx`** — Sidebar + topbar layout matching the reference image (blue sidebar with school crest, white content area). Top bar shows teacher name, avatar, notification bell, logout button. Mobile: sidebar collapses to hamburger.

3. **`src/components/teacher/TeacherSidebar.tsx`** — Blue-themed sidebar with nav items: Dashboard, My Classes, Attendance, Results, Assignments, Announcements, Messages, Profile. School crest at top. Active route highlighting.

### Pages (all under `/teacher/*`)
4. **`src/pages/teacher/TeacherLogin.tsx`** — Login form for teachers (same Supabase auth, but redirects to `/teacher` on success and validates `teacher` role).

5. **`src/pages/teacher/TeacherDashboard.tsx`** — Welcome card with greeting + class count. Stats cards: My Students count, Assigned Classes count, Pending Tasks count. Quick Actions: Mark Attendance, Enter Results, Create Assignment. Recent Activity feed (latest grades posted, messages received). Upcoming Events section.

6. **`src/pages/teacher/TeacherClasses.tsx`** — Displays class cards for assigned classes only (from `class_teachers`). Each card shows class name, student count. Click opens student list for that class.

7. **`src/pages/teacher/TeacherAttendance.tsx`** — Select class (from assigned only), date picker. Shows student table with Present/Absent/Late radio buttons. Bulk save to `attendance` table. Writes are visible to admin and parent dashboards.

8. **`src/pages/teacher/TeacherResults.tsx`** — Select class, subject, term. IAS/ETES score entry per student (matching existing `grades` table structure with `ias_score`, `etes_score`). Auto-calculates total, grade letter, proficiency level. Bulk save.

9. **`src/pages/teacher/TeacherAssignments.tsx`** — List of assignments created by this teacher. Create form: title, description, class (from assigned), due date, optional file upload. Stored in `assignments` table.

10. **`src/pages/teacher/TeacherAnnouncements.tsx`** — Create class-level announcements (stored in `portal_announcements` with `target_audience = 'specific_class'` and `target_class` set). List of own announcements.

11. **`src/pages/teacher/TeacherMessages.tsx`** — List parents by class. Send message to individual parent or entire class. Uses existing `parent_messages` table with `sender_type = 'teacher'`. Inbox view with read status.

12. **`src/pages/teacher/TeacherProfile.tsx`** — Update full name, phone, avatar (upload to `teacher-avatars` bucket). Email shown read-only. Change password via `supabase.auth.updateUser`.

### Route Updates
13. **`src/App.tsx`** — Add teacher routes:
```
/teacher/login -> TeacherLogin
/teacher (TeacherLayout)
  /teacher -> TeacherDashboard
  /teacher/classes -> TeacherClasses
  /teacher/attendance -> TeacherAttendance
  /teacher/results -> TeacherResults
  /teacher/assignments -> TeacherAssignments
  /teacher/announcements -> TeacherAnnouncements
  /teacher/messages -> TeacherMessages
  /teacher/profile -> TeacherProfile
```

---

## Admin Side: Teacher Management
14. **Add to admin sidebar**: "Teachers" nav item linking to `/admin/teachers`

15. **`src/pages/admin/TeacherManagement.tsx`** — Admin page to:
- Create teacher accounts (creates auth user + teacher role + teacher_profiles record)
- Assign classes to teachers (insert into `class_teachers`)
- View/edit/deactivate teacher accounts
- This uses the existing `create-student-portal` edge function pattern to create auth accounts, or a new `create-teacher-account` edge function

16. **New edge function `supabase/functions/create-teacher-account/index.ts`** — Creates auth user, inserts `user_roles` with `teacher` role, and inserts `teacher_profiles` record. Uses service role key.

---

## Parent Portal Updates
- **Assignments page**: Add `/portal/assignments` route showing assignments for the parent's child's class
- **`src/pages/portal/PortalAssignments.tsx`** — Lists assignments filtered by child's `current_class`

---

## UI Design
- Sidebar: Deep blue background (`#1e3a5f` or similar from the reference), white text, school crest at top
- Active nav item: Lighter blue or white background with blue text
- Dashboard cards: White with subtle shadows, matching the reference image layout
- Responsive: Sidebar collapses on mobile with hamburger trigger
- Search uses icon-only expandable pattern (no large search bars)

---

## File Count Summary
- 1 database migration (tables + enum + functions + RLS policies)
- 1 edge function (`create-teacher-account`)
- 1 auth hook (`useTeacherAuth`)
- 3 layout/sidebar components
- 10 page components (login + 8 features + admin management)
- 1 route update (`App.tsx`)
- 1 sidebar update (`AdminSidebar.tsx`)
- 1 parent portal page (`PortalAssignments.tsx`)

