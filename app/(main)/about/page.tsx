import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "앞으로 나아가는 것을 좋아하는 개발자 유지석입니다.",
};

function About() {
  return (
    <>
      <section className="mb-12">
        <h3 className="text-4xl font-semibold">
          안녕하세요 <br />
          저는 유지석입니다.
        </h3>

        <div className="my-6 leading-7">
          <p>새로운 것을 마주하는 것에 두려움이 없습니다.</p>
          <p>창작 활동을 통해 영감을 얻는 것을 좋아합니다.</p>
          <p>
            궁금증이 생기면 주도적으로 해결하며, 제 것으로 만드는 과정을
            즐깁니다.
          </p>
          <p>
            이런 궁금증을 해결하는 과정 속에서{" "}
            <a
              href="https://github.com/reactjs/react.dev/pull/5791"
              rel="noopener noreferrer"
              target="_blank"
              className="underline underline-offset-2"
            >
              리액트 공식 문서
            </a>
            에 기여하게 되었습니다.
          </p>
        </div>

        <ul className="flex gap-4">
          <li>
            <a
              href="https://github.com/yujiseok"
              rel="noopener noreferrer"
              target="_blank"
              className="rounded-md bg-neutral-100 p-2 text-neutral-800 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600"
            >
              Github
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/%EC%A7%80%EC%84%9D-%EC%9C%A0-1741591b1/"
              rel="noopener noreferrer"
              target="_blank"
              className="rounded-md bg-neutral-100 p-2 text-neutral-800 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600"
            >
              LinkedIn
            </a>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h4 className="mb-6 text-2xl font-semibold">Career</h4>
        <ul className="flex list-disc flex-col gap-1 px-4">
          <li>
            <div>
              <p>데이원컴퍼니 (2023.11 ~ )</p>
            </div>
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-6 text-2xl font-semibold">Education</h4>
        <ul className="flex list-disc flex-col gap-1 px-4">
          <li>
            패스트캠퍼스 메가바이트 스쿨 프론트엔드 과정 (2022.09.13 -
            2023.04.14)
          </li>
          <li>원티드 프리온보딩 프론트엔드 인턴십 (2023.02.20 - 2023.03.17)</li>
        </ul>
      </section>
    </>
  );
}
export default About;
