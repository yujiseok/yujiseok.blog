import { StrokeIcon } from "./icons";
import { cn } from "@/lib/cn";

/*
 * 삽입한 블록(표·접기·MDX·이미지)을 지우는 버튼. 블록마다 지우는 방법이 달라
 * — 표는 우클릭 메뉴, 나머지는 선택 후 Backspace — 한 번 배운 방법이 다음
 * 블록에서 통하지 않았다. 위치와 생김새를 여기 한곳에 두고 네 노드뷰가 같이
 * 쓴다.
 *
 * 평소에는 숨어 있다가 블록에 마우스를 올리거나 그 안에 포커스가 있을 때만
 * 나타난다. 글을 읽는 동안 X가 넷씩 떠 있으면 본문이 시끄러워진다. 부모
 * 노드뷰 래퍼에 relative와 group이 있어야 자리를 잡는다.
 */
export const BlockDeleteButton = ({
  onDelete,
  label,
  className,
}: {
  onDelete: () => void;
  /** "표 삭제"처럼 무엇을 지우는지. 스크린리더가 읽는 유일한 단서다 */
  label: string;
  className?: string;
}) => (
  <button
    type="button"
    contentEditable={false}
    aria-label={label}
    // 툴바 버튼과 같은 이유로 mousedown을 막는다 — 여기서 에디터가 blur되면
    // 삭제 커맨드가 걸릴 selection을 잃는다.
    onMouseDown={(event) => event.preventDefault()}
    onClick={onDelete}
    className={cn(
      "absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-md",
      "text-neutral-500 opacity-0 transition-opacity",
      "group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100",
      "hover:bg-black/5 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-red-400",
      className,
    )}
  >
    <XIcon />
  </button>
);

const XIcon = () => (
  <StrokeIcon size={13}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </StrokeIcon>
);
