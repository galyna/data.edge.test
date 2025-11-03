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
    <div className={cn(
      "bg-card border rounded-lg p-4 transition-all hover:border-primary/30",
      highlight && "border-primary/50 glow-primary"
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-muted-foreground text-xs uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className={cn(
        "text-3xl font-bold mb-1",
        highlight && "text-signal"
      )}>
        {value}
      </div>
      
      {change && (
        <div className="flex items-center gap-1">
          <span className={cn(
            "text-sm font-medium",
            trend === "up" && "text-primary",
            trend === "down" && "text-destructive",
            trend === "neutral" && "text-muted-foreground"
          )}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {change}
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
