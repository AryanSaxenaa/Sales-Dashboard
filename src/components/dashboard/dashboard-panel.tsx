import { cn } from "@/lib/utils";

interface DashboardPanelProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export function DashboardPanel({
  title,
  subtitle,
  action,
  className,
  contentClassName,
  children,
}: DashboardPanelProps) {
  return (
    <section className={cn("rounded-lg border border-border bg-background p-4", className)}>
      {(title || subtitle || action) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
