const ResumeContent = ({
  rightContent,
  leftContent,
}: {
  rightContent: React.ReactNode;
  leftContent: React.ReactNode;
}) => {
  return (
    <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:gap-10">
      <div className="text-neutral-600 dark:text-neutral-400">
        {leftContent}
      </div>
      <div>{rightContent}</div>
    </div>
  );
};

export default ResumeContent;
