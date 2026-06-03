import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div>
            <h1 className="text-lg font-semibold">Sales Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              KPIs, charts, and AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-4">
        <DashboardClient />
      </main>
    </div>
  );
}
