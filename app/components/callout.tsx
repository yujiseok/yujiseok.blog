import { cn } from "@/lib/cn";

interface CalloutProps {
  children: React.ReactNode;
  className?: string;
}

export function Callout({ children, className }: CalloutProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-neutral-200 px-4 py-3 text-sm leading-relaxed text-neutral-700 [&_p]:m-0! dark:border-neutral-800 dark:text-neutral-300",
        className
      )}
    >
      {children}
    </div>
  );
}
