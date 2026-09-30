import { cn } from "@/lib/utils";

type StatusType = "pending" | "under_review" | "approved" | "rejected" | "enrolled";

interface StatusBadgeProps {
  status: StatusType | string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "New",
    className: "bg-[hsl(var(--gsis-gold-soft))] text-foreground border border-[hsl(var(--gsis-gold))]",
  },
  under_review: {
    label: "Under Review",
    className: "bg-[hsl(var(--gsis-gold-soft))] text-foreground border border-[hsl(var(--gsis-gold))]",
  },
  approved: {
    label: "Approved",
    className: "bg-[hsl(var(--gsis-status-good-soft))] text-[hsl(var(--gsis-status-good))]",
  },
  rejected: {
    label: "Rejected",
    className: "bg-[hsl(var(--gsis-status-urgent-soft))] text-[hsl(var(--gsis-status-urgent))]",
  },
  enrolled: {
    label: "Enrolled",
    className: "bg-muted text-muted-foreground",
  },
};

const StatusBadge = ({ status, size = "md" }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        config.className
      )}
    >
      <span className={cn(
        "rounded-full mr-1.5",
        size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
        status === "pending" && "bg-[hsl(var(--gsis-gold))]",
        status === "under_review" && "bg-[hsl(var(--gsis-gold))]",
        status === "approved" && "bg-[hsl(var(--gsis-status-good))]",
        status === "rejected" && "bg-[hsl(var(--gsis-status-urgent))]",
        status === "enrolled" && "bg-[hsl(var(--gsis-status-neutral))]"
      )} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
