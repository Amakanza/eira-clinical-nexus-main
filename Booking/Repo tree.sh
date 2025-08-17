eira-booking/
├─ app/
│  ├─ api/
│  │  └─ booking/
│  │     ├─ services/route.ts
│  │     ├─ providers/route.ts
│  │     ├─ availability/route.ts
│  │     ├─ hold/route.ts
│  │     ├─ confirm/route.ts
│  │     ├─ cancel/route.ts
│  │     ├─ ics/
│  │     │  ├─ [appointmentId]/route.ts
│  │     │  └─ provider/[providerId]/route.ts
│  │     └─ cron/send-due/route.ts
│  ├─ book/
│  │  ├─ page.tsx
│  │  ├─ manage/[token]/page.tsx
│  │  └─ components/
│  │     ├─ ServicePicker.tsx
│  │     ├─ ProviderPicker.tsx
│  │     ├─ DatePicker.tsx
│  │     ├─ TimeSlots.tsx
│  │     ├─ DetailsForm.tsx
│  │     ├─ ReviewCard.tsx
│  │     └─ SuccessScreen.tsx
│  └─ (admin)/booking/
│     ├─ page.tsx
│     ├─ services/page.tsx
│     ├─ hours/page.tsx
│     ├─ time-off/page.tsx
│     └─ components/AdminCalendar.tsx
├─ lib/
│  ├─ supabaseAdmin.ts
│  ├─ supabaseServer.ts
│  ├─ time.ts
│  ├─ availability.ts
│  ├─ ics.ts
│  ├─ emails.ts
│  ├─ tokens.ts
│  ├─ patientsAdapter.ts
│  └─ types.ts
├─ tests/
│  ├─ availability.test.ts
│  ├─ overlap-concurrency.test.ts
│  └─ tz-sanity.test.ts
├─ scripts/
│  ├─ db-migrate.ts
│  └─ db-seed.ts
├─ supabase/
│  └─ migrations/
│     └─ 0001_booking_init.sql
├─ .env.example
├─ package.json
├─ next.config.mjs
├─ tsconfig.json
├─ README.md
└─ bruno_collection.json  (or Postman collection)
