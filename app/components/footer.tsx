import Link from "next/link";
import ExternalLink from "@/app/components/externalLink";

// 렌더가 아닌 모듈 평가 시점(=빌드 시점)에 한 번만 읽는다.
// 렌더 중 new Date()를 호출하면 cacheComponents가 전 페이지를 dynamic으로 만든다.
const year = new Date().getFullYear();

function Footer() {
  return (
    <footer className="mx-auto mt-40 flex w-full max-w-2xl items-center text-neutral-600 md:text-sm dark:text-neutral-400">
      <div className="mt-10 flex w-full justify-between gap-4 py-6">
        <Link href="/">© {year} 유지석</Link>
        <div className="flex items-center gap-3">
          {/* 글 상세의 뒤로가기를 없앴으므로 목록으로 가는 길은 여기뿐이다 */}
          <Link href="/posts" className="underline underline-offset-2">
            Posts
          </Link>
          <ExternalLink
            href="https://github.com/yujiseok"
            className="underline underline-offset-2"
          >
            GitHub
          </ExternalLink>
          <Link href="/music" className="underline underline-offset-2">
            Music
          </Link>
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
