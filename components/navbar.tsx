"use client";
import Link from "next/link";
import DarkModeBtn from "./darkModeBtn";
import { usePathname } from "next/navigation";

interface NavItem {
  name: "home" | "about" | "blog";
  href: "/" | "/about" | "/blog";
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "home",
    href: "/",
  },
  {
    name: "about",
    href: "/about",
  },
  {
    name: "blog",
    href: "/blog",
  },
];

function Navbar() {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <nav className="mt-12 h-14 w-full">
      <div className="mx-auto flex h-full w-full max-w-2xl items-center justify-between px-4 py-4">
        <h1 className="text-3xl font-bold">
          <Link href="/">Yujiseok</Link>
        </h1>
        <ul className="flex items-center gap-4">
          {NAV_ITEMS.map(({ name, href }) => (
            <li
              key={name}
              className={`${pathname?.includes(name) ? "underline" : ""} `}
            >
              <Link href={href}>{name}</Link>
            </li>
          ))}

          <li>
            <DarkModeBtn />
          </li>
        </ul>
      </div>
    </nav>
  );
}
export default Navbar;
