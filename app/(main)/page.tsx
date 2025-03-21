import Image from "next/image";
import Link from "next/link";
import Avatar from "@/public/images/avatar.jpg";

export default function Home() {
  return (
    <section className="break-keep">
      <div className="my-4 flex items-center gap-8">
        <div className="flex h-[100px] w-[100px] shrink-0 md:h-[125px] md:w-[125px]">
          <Image
            src={Avatar}
            alt="유지석"
            placeholder="blur"
            className="h-full w-full rounded-full object-cover"
          />
        </div>
        <div className="max-w-sm leading-7">
          안녕하세요? 저의 블로그에 찾아와 주셔서 감사합니다. 😊
          <div>
            저는 프론트엔드 개발자
            <strong className="text-lg font-semibold"> 유지석</strong>
            입니다.
          </div>
          <p>앞으로 나아가는 것을 좋아합니다.</p>
        </div>
      </div>
      <div className="pt-5 leading-7">
        <p>
          저는 무언가 창작하는 활동을 무척 좋아하고 재밌어합니다. 꾸준히 양질의
          글을 블로그에 작성하고 공유하는 것을 목표로 하고 있습니다. 또 저는{" "}
          <Link href="/music" className="underline underline-offset-2">
            <strong>음악 감상</strong>
          </Link>
          을 아주 사랑합니다.
        </p>
        <p>앞으로 자주 뵈었으면 좋겠습니다.</p>
      </div>
    </section>
  );
}
