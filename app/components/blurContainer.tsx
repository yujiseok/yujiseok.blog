import { cn } from "@/lib/cn";

const BlurContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section className={cn("blurIn grid gap-6", className)}>{children}</section>
  );
};

export default BlurContainer;
