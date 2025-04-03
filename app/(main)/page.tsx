import Image from "next/image";
import Link from "next/link";
import Avatar from "@/public/images/avatar.jpg";
import BlurContainer from "../components/blurContainer";
import Writing from "../components/writing";
import { getAllWritings } from "@/lib/utils";
import ArrowUpRight from "../components/arrowUpRight";

export default function Home() {
  const writings = getAllWritings().slice(0, 3);

  return (
    <BlurContainer className="gap-12 leading-7 break-keep">
      <header className="flex items-center gap-4">
        <Image
          src={Avatar}
          alt="유지석"
          placeholder="blur"
          className="size-16 rounded-full object-cover"
        />
        <div>
          <h1 className="font-medium">유지석</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Frontend Engineer
          </p>
        </div>
      </header>
      <div>
        <h2 className="mb-0.5 font-medium">About Me</h2>
        <p>
          데이원 컴퍼니에서 프론트엔드 엔지니어로 일하며, UI를 만들고 있습니다.
          좋은 디자인에서 즐거움과 영감을 얻습니다.
        </p>
      </div>

      <div>
        <h2 className="mb-0.5 font-medium">Now</h2>
        <div className="grid gap-3">
          <p>
            사용자 경험을 개선하는 인터랙션과 인터페이스 구현을 위해 노력하고
            있습니다. 웹의 창의적 가능성을 탐구하며 더 나은 제품을 만드는 것을
            목표로 합니다.
          </p>
          <p>
            디자인과 개발의 교차점인 디자인 엔지니어링에 관심이 많으며, UI
            그려내는 것을 즐깁니다. 사용성과 심미성의 균형을 고민합니다.
          </p>
          <p>
            스스로 무언가를 창작하며 실력을 키우고, 관심사를 확장해 나가며 모든
            작업에 담긴 노력과 경험을 소중히 여깁니다.
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-0.5 font-medium">
          <Link href="/writing">Writing</Link>
        </h2>
        <div>
          {writings.map(({ metadata, slug }) => (
            <Writing
              key={slug}
              metadata={metadata}
              slug={slug}
              offset={false}
            />
          ))}
        </div>
        <div className="flex justify-end">
          <Link
            href="/writing"
            className="group mt-2 mr-3 flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <span>더 보기</span>
            <ArrowUpRight />
          </Link>
        </div>
      </div>

      <div>
        <h2 className="mb-0.5 font-medium">More</h2>
        <div>
          <p>
            저는 음악 감상을 아주 사랑하며, 제 음악적 취향을 나누는{" "}
            <Link href="/music" className="underline">
              공간
            </Link>
            을 마련했습니다.
          </p>
          <p>
            인터페이스 탐구를 의한{" "}
            <Link href="/atelier" className="underline">
              공방
            </Link>
            을 운영하고 있습니다.
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-0.5 font-medium">Connect</h2>
        <p>
          저의 코드가 궁금하시다면{" "}
          <a
            href="https://github.com/yujiseok"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            GitHub
          </a>
          를 방문해 주세요.{" "}
          <a
            href="https://www.linkedin.com/in/yujiseok/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            LinkedIn
          </a>
          에서 저를 만나보세요, 또는 저의{" "}
          <a href="mailto:koesijuy@gmail.com" className="underline">
            이메일
          </a>
          로 연락해 주세요.
        </p>
      </div>
    </BlurContainer>
  );
}
