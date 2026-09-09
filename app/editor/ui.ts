/*
 * 에디터 UI의 공용 클래스 토큰. 파일마다 비슷한 클래스 문자열을 따로 들고
 * 있으면 한 줄에 놓인 컨트롤끼리 높이가 어긋나고, 색을 한 번 바꾸려 해도
 * 다섯 군데를 손대야 한다. 생김새에 대한 결정을 여기 한곳에 모은다.
 */

/** 테두리 있는 입력·트리거. 한 줄에 놓이는 컨트롤은 전부 같은 높이여야 한다 */
export const CONTROL =
  "h-9 rounded-lg border border-neutral-200 bg-transparent px-3 text-sm dark:border-neutral-800";

/** CONTROL 중에서도 직접 타이핑하는 것. 포커스 링은 컨테이너가 대신 그린다 */
export const FIELD = `${CONTROL} focus:outline-none`;

/** 저장·삭제처럼 화면의 주요 동작. min-w는 "저장" → "저장 중..."에서 폭이 튀지 않게 한다 */
export const ACTION_BUTTON =
  "h-9 min-w-20 rounded-lg px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

/** 다이얼로그 안 버튼은 한 단계 작다 — 화면 전체가 아니라 그 판 안의 동작이다 */
export const DIALOG_BUTTON =
  "h-8 min-w-16 rounded-lg px-3 text-sm font-medium transition-colors";

/** 툴바·노드뷰의 아이콘 버튼 */
export const ICON_BUTTON =
  "flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md px-1.5 text-xs text-neutral-700 transition-colors disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-300";

/** 토글 버튼의 눌린 상태와 안 눌린 상태 */
export const PRESSED = "bg-black text-white dark:bg-white dark:text-black";
export const UNPRESSED = "hover:bg-black/5 dark:hover:bg-neutral-200/10";

/** 화면에 붙어 있는 판(에디터 본문 영역 등). 떠 있는 POPUP과 테두리를 맞춘다 */
export const SURFACE =
  "rounded-lg border border-neutral-200 dark:border-neutral-800";

/** 떠 있는 판. Select·Combobox·Popover·AlertDialog·Toast가 같이 쓴다 */
export const POPUP =
  "rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900";

/** 목록형 팝업 안의 한 줄 */
export const MENU_ITEM =
  "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-700 outline-none select-none data-highlighted:bg-black/5 dark:text-neutral-300 dark:data-highlighted:bg-neutral-200/10";

/** floating-ui Positioner. 에디터 툴바(z-10) 위로 올라와야 한다 */
export const POSITIONER = "z-20 outline-none";

/** 말풍선은 판이 아니라 라벨이라 색을 뒤집는다 */
export const TOOLTIP =
  "flex items-center gap-1.5 rounded-md bg-neutral-900 px-2 py-1 text-[11px] leading-none font-medium text-white shadow-md dark:bg-neutral-100 dark:text-black";
export const KBD =
  "rounded border border-white/25 px-1 py-0.5 font-mono text-[10px] leading-none dark:border-black/20";
