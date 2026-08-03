const ResumeSection = ({
  id,
  number,
  title,
  children,
  className = "",
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section id={id} className={`grid scroll-mt-8 gap-5 ${className}`}>
      <header className="grid gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-resume text-[11px] font-semibold tracking-[0.22em] text-neutral-950 uppercase">
            {title}
          </h2>
          <span className="font-resume text-[11px] tracking-[0.16em] text-neutral-500 tabular-nums">
            {number}
          </span>
        </div>
        <div className="h-px w-full bg-neutral-950/85" />
      </header>
      <div>{children}</div>
    </section>
  );
};

export default ResumeSection;
