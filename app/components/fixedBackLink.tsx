import Link from "next/link";
import type { SVGProps } from "react";

/*
 * 돌아갈 곳은 라우트마다 이미 정해져 있다. 이걸 usePathname()으로 유추하면
 * 프리렌더 시점의 pathname과 브라우저의 pathname이 어긋나는 순간 서버는
 * 링크를 그리고 클라이언트는 null을 반환해 hydration이 깨진다. 실제로 홈이
 * 그랬다. 부르는 쪽이 href를 명시하면 서버 컴포넌트로 충분하고, 어긋날
 * 여지 자체가 없다.
 */
const FixedBackLink = ({ href }: { href: string }) => {
  return (
    <nav
      className="fadeIn pointer-events-none inset-x-0 top-24 z-50 lg:fixed lg:top-28"
      aria-label="navigation"
    >
      <div className="mb-6 -ml-1 max-w-4xl lg:mx-auto">
        <Link
          href={href}
          // 글자까지 두면 목차 위에서 존재감이 과하다. 아이콘만 두고 이름은
          // 보조기기에만 준다.
          className="group pointer-events-auto flex w-fit items-center text-neutral-400 transition-colors hover:text-black dark:text-neutral-500 dark:hover:text-white"
        >
          <ArrowUTurnLeft aria-hidden="true" role="presentation" />
          <span className="sr-only">뒤로 가기</span>
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
