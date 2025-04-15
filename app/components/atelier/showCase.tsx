const ShowCase = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative grid h-96 place-items-center overflow-hidden rounded-lg border border-neutral-300/80 bg-neutral-100/50 p-0.5 dark:border-neutral-700 dark:bg-neutral-900/50">
      {children}
    </div>
  );
};
export default ShowCase;
