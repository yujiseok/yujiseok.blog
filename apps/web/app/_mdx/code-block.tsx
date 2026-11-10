"use client";

import { useRef, useState } from "react";

import { useLocaleContext } from "@/app/_components/locale-provider";
import { cn } from "@/lib/cn";

const COPIED_DURATION_MS = 1500;

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
      <rect
        x="7"
        y="7"
        width="10"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4.5 13V4.5A1.5 1.5 0 0 1 6 3h8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M4 10.5 8 14l8-8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// rehype-pretty-code가 낸 <figure data-rehype-pretty-code-figure>의 pre를
// 대신 렌더한다. 버튼은 pre 안(코드 옆)에 두되 텍스트 노드는 절대 넣지
// 않는다 — 복사 로직이 preRef.current.textContent를 그대로 읽으므로, 버튼
// 안에 글자가 있으면 그 글자까지 클립보드에 섞여 들어간다. "복사됨" 안내는
// pre 바깥(형제)의 스크린리더 전용 영역에서만 말한다.
function CodeBlock({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const revertTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [copied, setCopied] = useState(false);
  const { codeBlock } = useLocaleContext();

  const handleCopy = async () => {
    const code = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(code);

    clearTimeout(revertTimer.current);
    setCopied(true);
    revertTimer.current = setTimeout(
      () => setCopied(false),
      COPIED_DURATION_MS,
    );
  };

  return (
    <>
      <pre ref={preRef} className={cn("group relative", className)} {...props}>
        {children}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={codeBlock.copy}
          className={cn(
            "absolute top-2 right-2 flex size-7 items-center justify-center rounded-md",
            "bg-white/10 text-white/80 transition-opacity hover:bg-white/20",
            // 마우스 기기에선 hover/focus 때만, 터치 기기(pointer-coarse)엔 항상.
            // [@media(hover:hover)]:opacity-0 같은 임의 미디어 변형은 생성 순서상
            // group-hover 뒤에 와서 호버해도 0에 머물렀다 — 기본값은 변형 없이 둔다.
            "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100",
          )}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </pre>
      <span className="sr-only" aria-live="polite">
        {copied ? codeBlock.copied : ""}
      </span>
    </>
  );
}

export default CodeBlock;
