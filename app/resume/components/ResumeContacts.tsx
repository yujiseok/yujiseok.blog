import ExternalLink from "@/app/components/externalLink";
import Link from "next/link";
import type { resumeData } from "../resume";

const linkClassName =
  "underline-offset-2 transition-colors hover:text-neutral-950 hover:underline";

const ResumeContacts = ({
  contact,
}: {
  contact: typeof resumeData.contact;
}) => {
  return (
    <ul className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-neutral-600">
      {[
        {
          label: contact.phone,
          // 국가번호를 붙일 때 국내 접두 0은 빼야 한다. (+82 10 …)
          href: `tel:+82${contact.phone.replace(/-/g, "").replace(/^0/, "")}`,
        },
        { label: contact.email, href: `mailto:${contact.email}` },
      ].map(({ label, href }) => (
        <li
          key={href}
          className="flex items-center gap-x-2.5 before:text-neutral-300 before:content-['|'] first:before:hidden"
        >
          <a href={href} className={linkClassName}>
            {label}
          </a>
        </li>
      ))}
      <li className="flex items-center gap-x-2.5 before:text-neutral-300 before:content-['|']">
        <ExternalLink href={contact.github} className={linkClassName}>
          GitHub
        </ExternalLink>
      </li>
      <li className="flex items-center gap-x-2.5 before:text-neutral-300 before:content-['|']">
        <Link href="/" className={linkClassName}>
          Blog
        </Link>
      </li>
    </ul>
  );
};

export default ResumeContacts;
