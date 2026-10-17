# NT3105 Admin Studio V3 — staging / preview
Branch: `feature/admin-v3-cms-preview`. **Do not merge yet.**
Related repository: [website PR branch](https://github.com/nt3105/nt3105.github.io/tree/feature/admin-v3-cms-preview).

## What's included
- Supabase-authenticated Admin Studio + original comments moderation, unchanged.
- 18 CMS sections: dashboard, hero, about, gallery, music, effects, brand, navigation, skills, projects, journey, contact, socials, theme, layout, SEO, footer, comments.
- Upload image/music with Supabase Storage (JPEG, PNG, WebP, GIF, MP3, WAV, OGG, M4A; up to 20 MB/file).
- Save Draft, Preview (mobile or desktop), Restore Published to Draft, Import/Export JSON, Publish.
- Data isolation: `nt3105_cms_drafts` Admin-only; `nt3105_cms_published` public-read + Admin-write. Admin role is existing `is_site_comment_admin()`.

## Mandatory before enabling real CMS
1. Inspect `supabase/nt3105_cms_v3.sql` then run it once in **Supabase SQL Editor** as project owner. Script is idempotent for tables and policy setup. Do not paste database passwords or secret keys into GitHub.
2. Verify bucket `nt3105-content` appears in Supabase Storage and is marked **public**. Uploaded objects are public **as soon as uploaded**, even before publish; do not upload private images.
3. Open `admin.nt3105.io.vn` **only after approval/merge**, sign in with already-authorized Admin account, verify `nt3105:admin-auth` flow and 18 tabs.
4. Upload test image/track, Save Draft (public website stays unchanged), then Publish intentionally. Use a non-sensitive test asset first.
5. Verify website guest in incognito: published fields visible and unpublished drafts not readable. Confirm guests cannot write to draft or published table or Storage. Test upload deletion rights using a **non-sensitive** test object.
6. Restore previous content using a downloaded JSON file if needed. A backup JSON should be exported *before* publishing; automatic full revision history is not included.

## Notes
- GitHub Pages can't serve a second live Pages URL from the same repo/branch configuration without changing publishing settings. The PR branch is **source-only preview**, not a separate hosted website. Keep current production domain and Pages source untouched.
- Existing public `site_comments` table remains the comment store; this migration does not change it.
- Public guestbook submissions are subject to spam; enable rate limits/CAPTCHA or moderation before a high-traffic public release.
- All audio must be properly licensed/owned.
- Do not merge these two PRs independently without configuring SQL: existing site falls back when CMS table not found, Admin CMS shows an actionable error.
- The older **standalone HTML demo** is visual only; PR provides a separate backend-integrated implementation and is not pixel-identical to the 92KB standalone demo.

## Safety checklist
- [ ] No changes to `main` or Pages settings
- [ ] Database schema reviewed; RLS denies anonymous modifications
- [ ] Mobile menu and hero remain functional on main site
- [ ] Guest sees only published content, Admin sees drafts
- [ ] Public comments can be submitted and moderated
- [ ] Test 20 MB upload limit and upload failure recovery
- [ ] Test reduced-motion, loading/error states, music permissions
- [ ] Merge only after explicit owner approval
