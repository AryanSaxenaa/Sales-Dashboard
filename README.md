# Sales Dashboard

A Next.js analytics dashboard for sales data — secured with **Clerk auth** and powered by a **Deepseek AI assistant**.

## Features

- **Clerk authentication** — Sign in / sign up required. All dashboard and API routes are protected.
- **AI chat assistant** — Auto-generated sales summary plus a custom Q&A box (ask about regions, reps, trends, products).
- **KPI cards** — Total sales, units sold, best performing region.
- **Charts** — Sales by region (bar), category (donut), monthly trend (line).
- **Filters** — Region and month range (limited to dates in the dataset).
- **Data table** — Paginated raw sales records (25 rows per page).

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Add to `.env.local`:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — [Clerk](https://dashboard.clerk.com/)
- `DEEPSEEK_API_KEY` — [Deepseek](https://platform.deepseek.com/)

Open [http://localhost:3000](http://localhost:3000), sign in, and explore the dashboard.

## Stack

Next.js · Clerk · Recharts · Deepseek · CSV-backed REST API
