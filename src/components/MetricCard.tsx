import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  highlight?: boolean;
}

const MetricCard = ({ title, value, change, trend, icon: Icon, highlight }: MetricCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 transition-all hover:border-primary/30",
        highlight && "glow-primary border-primary/50"
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{title}</span>
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className={cn("mb-1 text-3xl font-bold", highlight && "text-signal")}>{value}</div>

      {change && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "text-sm font-medium",
              trend === "up" && "text-primary",
              trend === "down" && "text-destructive",
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {change}
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
