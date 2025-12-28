import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "warning" | "success" | "info";
}

const StatsCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatsCardProps) => {
  const variantStyles = {
    default: "bg-card",
    warning: "bg-yellow-50 dark:bg-yellow-950/20",
    success: "bg-green-50 dark:bg-green-950/20",
    info: "bg-blue-50 dark:bg-blue-950/20",
  };

  const iconStyles = {
    default: "bg-primary/10 text-primary",
    warning: "bg-yellow-500/20 text-yellow-600",
    success: "bg-green-500/20 text-green-600",
    info: "bg-blue-500/20 text-blue-600",
  };

  return (
    <div className={cn("rounded-lg border border-border p-4 shadow-soft", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-xl font-bold text-foreground mt-1">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs mt-1 flex items-center gap-1",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% from yesterday</span>
            </p>
          )}
        </div>
        <div className={cn("p-2 rounded-lg", iconStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
