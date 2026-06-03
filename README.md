# Sales Dashboard
<img width="1071" height="965" alt="image" src="https://github.com/user-attachments/assets/ad12bbaa-89ba-494c-a354-0e7d5ecbf865" />

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

## How I used AI

I used AI as a development assistant (Cursor) throughout the project lifecycle. AI helped generate implementation options, scaffold components, suggest API structures, and accelerate debugging. However, architectural and product decisions remained my responsibility.

For example, I evaluated authentication approaches and chose Clerk rather than implementing custom authentication. I defined the dashboard architecture as a Next.js monolith, selected the filtering model, and decided how AI-powered insights would be exposed through both automated summaries and a custom question-answer workflow.

During development, I iteratively refined the user experience based on my own requirements. Examples include  limiting date filters to months present in the dataset, and ensuring AI responses included sales representative context so questions such as "Who is the best salesperson?" could be answered correctly.

AI accelerated implementation, but I reviewed outputs, adjusted designs, validated functionality against the dataset, and made final decisions on architecture, data handling, security, and user experience.
