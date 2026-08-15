# IIT — Institute of International Trade

Alumni network web application built with Next.js 15 (App Router), React 19, Tailwind CSS v4, and shadcn/ui.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values before running the app.

```bash
cp .env.example .env.local
```

### `.env.local` reference

```env
# ── App ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Auth (NextAuth / your auth provider) ─────────────────────────────────────
NEXTAUTH_SECRET=replace-with-a-random-secret
NEXTAUTH_URL=http://localhost:3000

# ── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/iit_db

# ── Email (for password reset / verification emails) ─────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-sender@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="IIT Alumni <no-reply@iit.org>"
```

---

## Test Accounts

> These credentials are for **local development only**. Do not use in production.

| Role            | Email                        | Password       | Notes                              |
| --------------- | ---------------------------- | -------------- | ---------------------------------- |
| Admin           | admin@iit-test.com           | Admin@1234     | Full admin panel access            |
| Verified Alumni | alumni@iit-test.com          | Alumni@1234    | Unlocks alumni directory & forum   |
| Pending User    | pending@iit-test.com         | Pending@1234   | Application under review           |
| Guest           | *(no login required)*        | —              | Public pages only                  |

> To test the **forgot password** flow, use any email above. The reset link is logged to the console in development (no real email sent until SMTP is configured).

---

## Pages

| Route                  | Description                              |
| ---------------------- | ---------------------------------------- |
| `/`                    | Homepage                                 |
| `/login`               | Sign in                                  |
| `/register`            | Create account                           |
| `/forgot-password`     | Request password reset link              |
| `/reset-password`      | Set new password (requires `?token=`)    |
| `/alumni`              | Alumni directory (guest + member views)  |
| `/alumni/apply`        | Alumni membership application form       |
| `/admin/alumni`        | Admin — alumni management panel          |

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **Fonts**: Playfair Display (headings), DM Sans (body)
- **Icons**: Lucide React
