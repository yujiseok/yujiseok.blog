import type { SECTION_TITLES } from "../resolve";

const ContentContainer = ({
  title,
  children,
}: {
  title: (typeof SECTION_TITLES)[keyof typeof SECTION_TITLES];
  children: React.ReactNode;
}) => {
  return (
    <div className="grid gap-4 sm:gap-6">
      <h2 className="border-b border-neutral-200/80 pb-2 text-lg font-semibold sm:text-xl dark:border-neutral-200/20">
        {title}
      </h2>
      <div className="grid gap-4">{children}</div>
    </div>
  );
};

export default ContentContainer;
