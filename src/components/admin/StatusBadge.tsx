import { cn } from "@/lib/utils";

type StatusType = "pending" | "under_review" | "approved" | "rejected" | "enrolled";

interface StatusBadgeProps {
  status: StatusType | string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "New",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  under_review: {
    label: "Under Review",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  enrolled: {
    label: "Enrolled",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
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
        status === "pending" && "bg-blue-500",
        status === "under_review" && "bg-yellow-500",
        status === "approved" && "bg-green-500",
        status === "rejected" && "bg-red-500",
        status === "enrolled" && "bg-purple-500"
      )} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
