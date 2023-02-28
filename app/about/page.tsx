import type { Metadata } from "next";
import Balancer from "react-wrap-balancer";

export const metadata: Metadata = {
  title: "About",
  description: "앞으로 나아가는 것을 좋아하는 개발자 유지석입니다.",
};

// 패캠 4.28
// 원티드 3.17

function About() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">About Me</h1>
      <section className="mb-12">
        <h3 className="text-4xl font-semibold">
          <Balancer> 안녕하세요 저는 유지석입니다.</Balancer>
        </h3>

        <p className="my-6 leading-7">
          {/* 저는 앞으로 나아가는 것을 좋아하는 개발자입니다. */}
        </p>

        <ul className="flex gap-4">
          <li>
            <a
              href="https://github.com/yujiseok"
              rel="noopener noreferrer"
              target="_blank"
              className="rounded-md bg-slate-100 p-2 text-black delay-75 ease-in-out hover:bg-slate-200"
            >
              Github
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/%EC%A7%80%EC%84%9D-%EC%9C%A0-1741591b1/"
              rel="noopener noreferrer"
              target="_blank"
              className="rounded-md bg-slate-100 p-2 text-black delay-75 ease-in-out hover:bg-slate-200"
            >
              LinkedIn
            </a>
          </li>
          {/* <li>
            <a
              href="#"
              rel="noopener noreferrer"
              className="rounded-md bg-slate-100 p-2 text-black delay-75 ease-in-out hover:bg-slate-200"
            >
              Portfolio
            </a>
          </li> */}
        </ul>
      </section>

      <section className="mb-12">
        <h4 className="mb-6 text-2xl font-semibold">Career</h4>
        <ul className="flex list-disc flex-col gap-1 px-4">
          <li>
            <div>
              <p>어반유니온 (2021.12 - 2022.09)</p>
              <p>주요 업무: 2022 한국어 AI 경진대회 플랫폼 퍼블리싱</p>
            </div>
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-6 text-2xl font-semibold">Education</h4>
        <ul className="flex list-disc flex-col gap-1 px-4">
          <li>원티드 프리온보딩 프론트엔드 인턴십 (2023.02.20 - 현재)</li>
          <li>
            패스트캠퍼스 메가바이트 스쿨 프론트엔드 과정 (2022.09.13 - 현재)
          </li>
        </ul>
      </section>
    </>
  );
}
export default About;
