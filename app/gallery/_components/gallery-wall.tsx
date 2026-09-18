"use client";

import { useQueryState } from "nuqs";

import GalleryGrid from "@/app/gallery/_components/gallery-grid";
import type { GalleryImage } from "@/lib/gallery";

/*
 * 고른 작가와 열어 둔 그림을 URL이 쥔다. 화면만 바뀌고 주소는 그대로이던 때는
 * 뒤로 왔을 때 무엇이 걸러진 상태인지 알 길이 없었고, 보고 있던 그림을 건네 줄
 * 수도 없었다. useSearchParams를 쓰므로 Suspense 안에 있어야 한다.
 *
 * image는 자리 번호가 아니라 파일 경로다. 벽이 요청마다 섞이므로 번호로 두면
 * 같은 주소가 다음 접속에 다른 그림을 연다.
 */
const GalleryWall = ({ images }: { images: GalleryImage[] }) => {
  const [selected, setSelected] = useQueryState("artist", { history: "push" });
  const [viewing, setViewing] = useQueryState("image", { history: "push" });

  return (
    <GalleryGrid
      images={images}
      selected={selected}
      viewing={viewing}
      onSelect={(folder) => {
        setViewing(null);
        setSelected(folder);
      }}
      onView={(key) => setViewing(key)}
    />
  );
};

export default GalleryWall;
