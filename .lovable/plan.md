# Six-Part GSIS Dashboard and Homepage Update

## Goal
Apply the requested admin presentation fixes, profile-save correction, cleanup, compact programme selector, homepage jump links, and image accuracy audit without changing database rules, data queries, authentication, or routes.

## Changes

### 1. Admin dashboard
- Replace the gradient welcome banner with a flat navy editorial panel, Fraunces heading, and short gold rule.
- Replace solid-colour statistics with restrained ivory/white bordered cards, small navy icons, Fraunces numbers, and muted labels.
- Make Pending Review neutral at zero and gold-accented only when work is pending.
- Use the existing semantic status palette for application states; Enrolled becomes neutral and pending statuses receive the gold treatment.
- Rebuild Quick Actions as compact icon-over-label tiles while preserving every existing destination.

### 2. Admin profile save
- Add `onConflict: "user_id"` to the existing profile upsert so saving updates the unique profile row instead of colliding on its generated ID.

### 3. Temporary cleanup function
- Remove the one-time `tmp-purge-auth-users` function directory.
- Remove only its matching function registration from the backend configuration.

### 4. Programme selector
- Keep all five existing programme records and their copy.
- Replace the long repeated rows with an accessible stage selector and one active photo/details panel.
- Preserve the editorial styling, admission link, and compact mobile layout.

### 5. Header jump links
- Point Programmes, Results, Gallery, Admissions, and Contact to their homepage section IDs.
- Preserve Home, About Us, the admission CTA, phone link, route-aware navigation, mobile close behavior, and smooth scrolling.

### 6. Homepage image audit
- Inspect every visible image in Hero, Heritage, Programmes, Beyond the Classroom, Results, and the database-driven Gallery.
- Replace the Crèche building placeholder with a properly licensed people-free nursery/object photograph.
- Replace or correctly crop the Naval Corps image with a clearly appropriate licensed parade/drill photograph.
- Correct any additional mismatches found, without presenting stock people as GSIS pupils.
- Keep source notes in code for non-GSIS stock assets and report every changed assignment/source.

## Validation
- Check the refreshed site at desktop and 360–430px widths, including programme switching and every header jump link.
- Verify admin dashboard presentation and profile-save code path.
- Confirm the current build has no errors and the temporary function is absent.
