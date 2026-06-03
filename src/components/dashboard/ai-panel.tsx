"use client";

import { useEffect, useState } from "react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { SalesFilters } from "@/lib/types";

interface AiPanelProps {
  filters: SalesFilters;
}

export function AiPanel({ filters }: AiPanelProps) {
  const [summary, setSummary] = useState("");
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [askError, setAskError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSummaryLoading(true);
      setSummaryError("");
      try {
        const res = await fetch("/api/ai/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
          credentials: "same-origin",
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to generate summary");
        setSummary(data.summary);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setSummaryError(error.message);
        }
      } finally {
        setSummaryLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters]);

  async function handleAsk() {
    if (!question.trim()) return;
    setAskLoading(true);
    setAskError("");
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...filters, question }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get answer");
      setAnswer(data.answer);
    } catch (error) {
      setAskError(error instanceof Error ? error.message : "Failed to get answer");
    } finally {
      setAskLoading(false);
    }
  }

  async function refreshSummary() {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate summary");
      setSummary(data.summary);
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : "Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <DashboardPanel
      title="AI Insights"
      action={
        <Button variant="outline" size="sm" onClick={refreshSummary} disabled={summaryLoading}>
          Refresh
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-border/60 bg-background/60 p-4">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Auto Summary
          </p>
          {summaryLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : summaryError ? (
            <p className="text-sm text-red-600">{summaryError}</p>
          ) : (
            <p className="text-sm leading-relaxed">{summary || "Generating summary..."}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Ask a question about the sales data..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <Button onClick={handleAsk} disabled={askLoading || !question.trim()}>
            {askLoading ? "Asking..." : "Ask"}
          </Button>
        </div>

        {askError && <p className="text-sm text-red-600">{askError}</p>}
        {answer && (
          <div className="rounded-lg border border-border/60 bg-background/60 p-4">
            <p className="mb-1 text-sm font-medium text-muted-foreground">Answer</p>
            <p className="text-sm leading-relaxed">{answer}</p>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
}
