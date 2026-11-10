import type { ReactNode } from "react";

/*
 * 여러 파일이 같이 쓰는 아이콘만 모은다. 툴바·코드블록·글 선택기가 각자
 * 똑같은 SVG를 들고 있으면 획 두께 하나를 바꿔도 세 군데를 손대야 하고,
 * 실제로 그러다 셋의 모양이 갈렸다. 한 곳에서만 쓰는 아이콘은 그 파일에 둔다.
 */

/** 24x24 좌표계에 획으로 그리는 아이콘의 공통 틀. 크기는 쓰는 자리가 정한다 */
export const StrokeIcon = ({
  size = 14,
  className,
  children,
}: {
  size?: number;
  className?: string;
  children: ReactNode;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    {children}
  </svg>
);

/** 드롭다운·콤보박스의 펼침 표시. 접기 블록은 이걸 돌려서 화살표로 쓴다 */
export const CaretDownIcon = ({ className }: { className?: string }) => (
  <StrokeIcon size={12} className={className}>
    <polyline points="6 9 12 15 18 9" />
  </StrokeIcon>
);

/** 목록형 팝업에서 지금 골라진 항목 표시 */
export const CheckIcon = () => (
  <StrokeIcon size={12}>
    <polyline points="20 6 9 17 4 12" />
  </StrokeIcon>
);
