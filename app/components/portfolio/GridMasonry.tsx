const GRID_ITEMS = [
  { backgroundColor: "#f1f5f9" },
  { backgroundColor: "#e0e7ef" },
  { backgroundColor: "#e0f2fe" },
  { backgroundColor: "#bae6fd" },
  { backgroundColor: "#e0e7ff" },
  { backgroundColor: "#c7d2fe" },
  { backgroundColor: "#d1fae5" },
  { backgroundColor: "#a7f3d0" },
  { backgroundColor: "#ffe4e6" },
  { backgroundColor: "#fecdd3" },
  { backgroundColor: "#fef3c7" },
  { backgroundColor: "#fde68a" },
];

const GridMasonry = ({
  item1,
  item2,
  text = "grid-row를 사용한 레이아웃",
}: {
  item1: number;
  item2: number;
  text: string;
}) => {
  return (
    <div className="text-center">
      <div className="grid grid-cols-3 gap-4 text-zinc-900">
        {GRID_ITEMS.map(({ backgroundColor }, index) => {
          const rowSpan = ((index * 37) % 3) + 1;
          return (
            <div
              key={index}
              className={`row-span-${rowSpan} flex flex-col items-center justify-center rounded-md font-semibold shadow-sm`}
              style={{
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
