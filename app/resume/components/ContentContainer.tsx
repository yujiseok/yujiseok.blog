const ContentContainer = ({
  title,
  children,
}: {
  title:
    | "Work Experience"
    | "Open Source Contribution"
    | "Education"
    | "Other Experience"
    | "Contact";
  children: React.ReactNode;
}) => {
  return (
    <div className="grid gap-4 sm:gap-6">
      <h3 className="font-semibold text-base">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </div>
  );
};

export default ContentContainer;
