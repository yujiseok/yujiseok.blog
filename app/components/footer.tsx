import Link from "next/link";
import DarkModeBtn from "./darkModeBtn";

function Footer() {
  return (
    <footer className="mx-auto mt-auto flex w-full max-w-2xl items-center text-neutral-600 md:text-sm dark:text-neutral-400">
      <div className="mt-10 flex w-full justify-between gap-4 py-6">
        <Link href="/">© {new Date().getFullYear()} 유지석</Link>
        <div className="flex items-center gap-4">
          <Link href="/resume">Resume</Link>
          <DarkModeBtn />
        </div>
      </div>
    </footer>
  );
}
export default Footer;
