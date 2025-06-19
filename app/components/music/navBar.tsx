"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const Navbar = () => {
  const pathname = usePathname();
  const playlistId =
    pathname.includes("/music/playlists/") && pathname.split("/").at(-1);
  const href = playlistId ? "/music/playlists" : "/";

  return (
    <nav className="mt-10 h-14 w-full">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between md:p-2">
        <Link
          href={href}
          className="cursor-pointer text-neutral-600 dark:text-neutral-400"
        >
          <ChevronLeft />
        </Link>

        <ul className="flex items-center gap-3 md:gap-4">
          {NAV_ITEMS.map(({ name, href }) => {
            const isActive =
              pathname === href ||
              (href === "/music/playlists" &&
                pathname.startsWith("/music/playlists/"));

            return (
              <li key={name} className="relative">
                <Link href={href}>{name}</Link>
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
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5 8.25 12l7.5-7.5"
    />
  </svg>
);
