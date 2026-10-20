import Image from "next/image";
import universe from "@/public/images/home/universe.jpg";

/*
 * 홈 글 목록 옆에 세우는 그림 한 판.
 *
 * 원본은 두 폭이 나란히 놓인 정사각형이고, 여기서는 왼쪽 한 폭만 쓴다.
 * 정사각형을 그대로 키우면 세로로 길어지는 만큼 가로도 같이 뚱뚱해지고,
 * 아무 데나 세로로 자르면 두 폭 구성이 무늬로 뭉개진다. 가로의 정확히
 * 절반이 한 폭이라, 1:2 자리에 object-left로 붙이면 잘라 낸 게 아니라
 * 온전한 한 폭이 선다 — 이미지 파일은 손대지 않는다.
 *
 * priority로 미리 받는다. 넓은 화면에서 이 그림이 첫 화면의 가장 큰
 * 그림이라, 글 목록보다 늦게 오면 자리가 빈다.
 */
const HomeArtwork = () => (
  // self-start가 없으면 그리드의 기본 stretch가 높이를 가져가 aspect가 무시된다.
  <div className="relative hidden aspect-1/2 self-start overflow-hidden rounded-lg xl:block">
    <Image
      src={universe}
      alt="김환기, 05-IV-71 #200"
      fill
      priority
      // 자리 폭(384px)이 아니라 높이(768px)에 맞춘 값이다. 정사각형이 높이를
      // 채우도록 커지면서 가로 절반이 자리 밖으로 나가고, 남는 절반이 한 폭이다.
      sizes="768px"
      placeholder="blur"
      className="object-cover object-left"
    />
  </div>
);

export default HomeArtwork;
