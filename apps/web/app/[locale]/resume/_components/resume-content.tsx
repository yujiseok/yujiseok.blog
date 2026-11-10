const ResumeContent = ({
  title,
  period,
  titleClassName = "text-[15px] sm:text-base",
  children,
}: {
  title: React.ReactNode;
  period: string;
  /** 글자 크기. 아래에 프로젝트를 거느린 회사명만 한 단계 키운다 */
  titleClassName?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className={`font-semibold ${titleClassName}`}>{title}</h3>
        <span className="text-neutral-600 dark:text-neutral-400">{period}</span>
      </div>
      {children}
    </div>
  );
};

export default ResumeContent;
