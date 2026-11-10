import ArrowUpRight from "@/app/_components/arrow-up-right";
import ExternalLink from "@/app/_components/external-link";

import type { Resume } from "../resume";

const ResumeProfile = ({
  profile,
  contact,
  pdfHref,
}: {
  profile: Resume["profile"];
  contact: Resume["contact"];
  pdfHref: string;
}) => {
  const links = [
    { href: `mailto:${contact.email}`, label: contact.email },
    { href: contact.github, label: "GitHub" },
    { href: contact.blog, label: "Blog" },
    // 인쇄본에는 자기 자신을 가리키는 링크라 뺀다.
    { href: pdfHref, label: "PDF", className: "print:hidden" },
  ];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-[26px] sm:leading-8">
            {profile.name}
          </h1>
          <small className="text-xs text-neutral-600 dark:text-neutral-400">
            {profile.title}
          </small>
        </div>
        <ul className="flex flex-wrap gap-x-3 text-[13px] text-neutral-600 dark:text-neutral-400">
          {links.map(({ href, label, className }) => (
            <li key={href} className={className}>
              <ExternalLink
                href={href}
                className="group inline-flex items-center hover:underline"
              >
                {label}
                <ArrowUpRight className="scale-75" />
              </ExternalLink>
            </li>
          ))}
        </ul>
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
