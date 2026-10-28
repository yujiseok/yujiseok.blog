import Link from "next/link";

function Footer() {
  return (
    <footer className="mx-auto mt-40 flex w-full max-w-2xl items-center text-neutral-600 md:text-sm dark:text-neutral-400">
      <div className="mt-10 flex w-full justify-end gap-4 py-6">
        <div className="flex items-center gap-3">
          <Link href="/music" className="underline underline-offset-2">
            Music
          </Link>
          {/* <Link href="/gallery" className="underline underline-offset-2">
            Gallery
          </Link> */}
          <Link href="/resume" className="underline underline-offset-2">
            Resume
          </Link>
          {/* 로컬 글쓰기 도구. 프로덕션에선 /editor 자체가 404라 링크도 감춘다 */}
          {process.env.NODE_ENV === "development" && (
            <Link
              href="/editor"
              className="underline decoration-dashed underline-offset-2"
            >
              Editor
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
export default Footer;
