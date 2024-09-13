"use client";

import Link from "next/link";
import DarkModeBtn from "./darkModeBtn";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

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
function Navbar() {
  let pathname = usePathname();

  if (pathname?.includes("/post/")) pathname = "/post";

  return (
    <nav className="mt-10 h-14 w-full">
      <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-between px-4 py-4">
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
                  className="absolute h-[1px] w-full bg-black dark:bg-white"
                />
              )}
            </li>
          ))}

          <li className="inline-flex">
            <DarkModeBtn />
          </li>
        </ul>
      </div>
    </nav>
  );
}
export default Navbar;
