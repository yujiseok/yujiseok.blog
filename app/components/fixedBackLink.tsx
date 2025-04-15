"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

const FixedBackLink = () => {
  const { href } = useBackHref();

  if (!href) return null;

  return (
    <nav
      className="fadeIn pointer-events-none inset-x-0 top-24 z-50 lg:fixed lg:top-28"
      aria-label="navigation"
    >
      <div className="mb-6 -ml-1 max-w-4xl lg:mx-auto">
        <Link
          href={href}
          className="group pointer-events-auto flex w-fit items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400"
          aria-label={`back to ${href}`}
        >
          <ArrowUTurnLeft aria-hidden="true" role="presentation" />
          <span>뒤로 가기</span>
        </Link>
      </div>
    </nav>
  );
};

export default FixedBackLink;

const ArrowUTurnLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="mb-0.5 size-3.5 transition-transform duration-200 ease-out will-change-transform group-hover:-translate-x-0.5"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
    />
  </svg>
);

const useBackHref = () => {
  const pathname = usePathname();

  const getBackHref = () => {
    if (pathname === "/") return "";

    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) return "/";

    return segments.length === 1 ? "/" : `/${segments.slice(0, -1).join("/")}`;
  };

  const href = getBackHref();

  return { href };
};
