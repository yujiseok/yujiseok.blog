import type { GalleryImage } from "@/lib/gallery";

/*
 * URL이 그림 하나를 가리키는 열쇠(?image=<폴더>/<파일명>). 벽이 요청마다 섞이므로
 * 자리 번호로 두면 같은 주소가 다음 접속에 다른 그림을 연다.
 *
 * lib/gallery.ts가 아니라 여기 있는 이유: 이 함수는 클라이언트 컴포넌트가 쓴다.
 * lib/gallery.ts에는 "use cache"와 node:fs가 있어서 클라이언트가 값을 하나라도
 * import하면 그 파일이 브라우저 번들로 끌려와 빌드가 깨진다(타입만 가져오는 건
 * 컴파일 때 지워지므로 괜찮다).
 */
export const imageKey = (image: Pick<GalleryImage, "src">) =>
  image.src.replace("/images/gallery/", "");
