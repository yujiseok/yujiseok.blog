"use client";
import Link from "next/link";
import DarkModeBtn from "./darkModeBtn";
import { usePathname } from "next/navigation";

interface NavItem {
  name: "home" | "about" | "post";
  href: "/" | "/about" | "/post";
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
    name: "post",
    href: "/post",
  },
];

function Navbar() {
  let pathname = usePathname();

  if (pathname?.includes("/post/")) pathname = "/post";

  return (
    <nav className="mt-12 h-14 w-full">
      <div className="mx-auto flex h-full w-full max-w-2xl items-center justify-between px-4 py-4">
        <h1 className="text-3xl font-bold">
          <Link href="/">Yujiseok</Link>
        </h1>
        <ul className="flex items-center gap-3 md:gap-4">
          {NAV_ITEMS.map(({ name, href }) => (
            <li
              key={name}
              className={`${
                pathname === href ? "underline underline-offset-2" : ""
              } `}
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
