const GRID_COLORS = [
  "#f1f5f9",
  "#e0e7ef",
  "#e0f2fe",
  "#bae6fd",
  "#e0e7ff",
  "#c7d2fe",
  "#d1fae5",
  "#a7f3d0",
  "#ffe4e6",
  "#fecdd3",
  "#fef3c7",
  "#fde68a",
];

const GridMasonry = ({
  item1,
  item2,
  text = "grid-row를 사용한 레이아웃",
}: {
  item1?: number;
  item2?: number;
  text?: string;
}) => {
  return (
    <div className="text-center">
      <div className="grid grid-cols-3 gap-4 text-zinc-900">
        {GRID_COLORS.map((backgroundColor, index) => {
          const rowSpan = ((index * 37) % 3) + 1;
          return (
            <div
              key={index}
              className="flex flex-col items-center justify-center rounded-md font-semibold shadow-sm"
              style={{
                // 동적 클래스(row-span-${n})는 Tailwind가 생성하지 않는다. 인라인 style로 지정한다.
                gridRow: `span ${rowSpan} / span ${rowSpan}`,
                backgroundColor,
                height:
                  index === item1 ? 476 : index === item2 ? 274 : undefined,
              }}
            >
              {index + 1}
              <span className="text-xs text-zinc-800">
                {index === item1
                  ? "높이 476px"
                  : index === item2
                    ? "높이 274px"
                    : ""}
              </span>
            </div>
          );
        })}
      </div>
      <small className="mt-4 block">{text}</small>
    </div>
  );
};

export default GridMasonry;
