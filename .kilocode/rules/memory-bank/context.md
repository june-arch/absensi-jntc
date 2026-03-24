# Active Context: Next.js Starter Template

## Current State

**App Status**: ✅ Attendance App (AbsensiKu) - Fully Built

Full-featured employee attendance app with selfie photo check-in/out, admin panel, Supabase auth & DB, ImageKit image storage.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Supabase Auth (login/register)
- [x] Supabase DB (profiles + attendance tables)
- [x] ImageKit.io selfie image upload
- [x] Employee dashboard with selfie check-in/out + history
- [x] Admin panel: manage employees (CRUD)
- [x] Admin panel: view all attendance with filters
- [x] Middleware for route protection
- [x] Supabase schema SQL file

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Redirects to /dashboard | ✅ Ready |
| `src/app/login/page.tsx` | Login page | ✅ Ready |
| `src/app/register/page.tsx` | Register page | ✅ Ready |
| `src/app/dashboard/` | Employee dashboard | ✅ Ready |
| `src/app/admin/employees/` | Admin: manage employees | ✅ Ready |
| `src/app/admin/attendance/` | Admin: all attendance | ✅ Ready |
| `src/app/api/attendance/` | Attendance API | ✅ Ready |
| `src/app/api/employees/` | Employees CRUD API | ✅ Ready |
| `src/app/api/upload-selfie/` | ImageKit upload API | ✅ Ready |
| `src/components/SelfieCamera.tsx` | Webcam selfie component | ✅ Ready |
| `src/components/Navbar.tsx` | Navigation bar | ✅ Ready |
| `src/lib/supabase/` | Supabase client (browser/server/admin) | ✅ Ready |
| `src/lib/imagekit.ts` | ImageKit uploader | ✅ Ready |
| `src/types/index.ts` | TypeScript types | ✅ Ready |
| `src/middleware.ts` | Auth route protection | ✅ Ready |
| `supabase-schema.sql` | DB schema to run in Supabase | ✅ Ready |
| `.env.local` | Environment variables template | ✅ Ready |

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

## Setup Steps for User

1. Create Supabase project, run `supabase-schema.sql` in SQL editor
2. Create ImageKit.io account
3. Fill in `.env.local` with real credentials
4. Create first admin user via Supabase Auth dashboard, then manually set `role = 'admin'` in profiles table

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-24 | Built full attendance app: selfie check-in/out, admin panel, Supabase auth+DB, ImageKit |
