const ResumeProfile = ({
  profile,
}: {
  profile: {
    name: string;
    title: string;
    introduction: readonly string[];
  };
}) => {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-xl font-semibold">{profile.name}</h1>
        <small className="text-xs text-neutral-600 dark:text-neutral-400">
          {profile.title}
        </small>
      </div>
      <div className="grid gap-2">
        {profile.introduction.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};

export default ResumeProfile;
