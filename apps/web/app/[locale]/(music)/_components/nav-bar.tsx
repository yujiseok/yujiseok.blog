"use client";

import { PAGE_TOP, PAGE_WIDTH } from "@/app/_components/page-spacing";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { localizedPath, stripLocale, type Locale } from "@/lib/i18n/locales";

const Navbar = ({
  locale,
  backLabel,
}: {
  locale: Locale;
  backLabel: string;
}) => {
  // 활성 표시는 접두사 없는 경로로 견준다. NAV_ITEMS의 href도 접두사가 없다.
  const pathname = stripLocale(usePathname());
  const isPlaylistDetail = pathname.startsWith("/music/playlists/");
  const backHref = localizedPath(
    locale,
    isPlaylistDetail ? "/music/playlists" : "/",
  );

  return (
    <nav className={`w-full ${PAGE_TOP}`}>
      <div
        className={`mx-auto flex w-full items-center justify-between ${PAGE_WIDTH.default}`}
      >
        <Link
          href={backHref}
          className="cursor-pointer text-neutral-600 dark:text-neutral-400"
          aria-label={backLabel}
        >
          <ChevronLeft />
        </Link>

        <ul className="flex items-center gap-3 md:gap-4">
          {NAV_ITEMS.map(({ name, href }) => {
            const isActive =
              pathname === href ||
              (href === "/music/playlists" && isPlaylistDetail);

            return (
              <li key={name} className="relative">
                <Link href={localizedPath(locale, href)}>{name}</Link>
                {isActive && (
                  <motion.div
                    layoutId="music-active-link"
                    transition={{
                      type: "spring",
                      duration: 0.5,
                    }}
                    className="absolute h-[1.25px] w-full bg-black dark:bg-white"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

const NAV_ITEMS = [
  {
    name: "recent",
    href: "/music",
  },
  {
    name: "top tracks",
    href: "/music/top-tracks",
  },
  {
    name: "playlists",
    href: "/music/playlists",
  },
] as const;

const ChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="size-6"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5 8.25 12l7.5-7.5"
    />
  </svg>
);
