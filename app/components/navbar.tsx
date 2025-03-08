"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

function Navbar() {
  let pathname = usePathname();

  if (pathname?.includes("/post/")) pathname = "/post";

  return (
    <nav className="mt-10 h-14 w-full">
      <div className="mx-auto flex h-full w-full max-w-2xl items-center justify-between px-4 py-4">
        <h1 className="text-3xl font-bold">
          <Link href="/">Yujiseok</Link>
        </h1>
        <ul className="flex items-center gap-3 md:gap-4">
          {NAV_ITEMS.map(({ name, href }) => (
            <li key={name} className="relative">
              <Link href={href}>{name}</Link>
              {pathname === href && (
                <motion.div
                  layoutId="active-link"
                  transition={{
                    type: "spring",
                    duration: 0.5,
                  }}
                  className="absolute h-[1.25px] w-full bg-black dark:bg-white"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

const NAV_ITEMS = [
  {
    name: "home",
    href: "/",
  },
  {
    name: "about",
    href: "/about",
  },
  {
    name: "post",
    href: "/post",
  },
] as const;
