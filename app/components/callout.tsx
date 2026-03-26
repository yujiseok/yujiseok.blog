import { cn } from "@/lib/cn";

type CalloutColor = "red" | "yellow" | "blue" | "green" | "purple" | "orange" | "pink";

const colorMap: Record<
  CalloutColor,
  { bg: string; border: string; text: string }
> = {
  red: {
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-500/50 dark:border-red-500/30",
    text: "text-red-900 dark:text-red-200",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-500/50 dark:border-yellow-500/30",
    text: "text-yellow-900 dark:text-yellow-200",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-500/50 dark:border-blue-500/30",
    text: "text-blue-900 dark:text-blue-200",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-500/50 dark:border-green-500/30",
    text: "text-green-900 dark:text-green-200",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-500/50 dark:border-purple-500/30",
    text: "text-purple-900 dark:text-purple-200",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-500/50 dark:border-orange-500/30",
    text: "text-orange-900 dark:text-orange-200",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-500/50 dark:border-pink-500/30",
    text: "text-pink-900 dark:text-pink-200",
  },
};

interface CalloutProps {
  children: React.ReactNode;
  color?: CalloutColor;
  className?: string;
}

export function Callout({
  children,
  color = "blue",
  className,
}: CalloutProps) {
  const colors = colorMap[color];

  return (
    <div
      role="alert"
      data-accent-color={color}
      className={cn(
        "rounded-md border px-3 py-4",
        colors.bg,
        colors.border,
        colors.text,
        className
      )}
    >
      <p className="leading-relaxed text-sm m-0! [&_p]:m-0!">{children}</p>
    </div>
  );
}
