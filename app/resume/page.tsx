import ArrowUpRight from "@/app/components/arrowUpRight";
import BlurContainer from "@/app/components/blurContainer";

export const metadata = {
  title: "유지석 이력서",
  description: "Frontend Engineer 유지석의 이력서",
};

const page = () => {
  return (
    <div
      data-resume-page="true"
      className="py-4 text-sm break-keep sm:px-4 sm:py-12"
    >
      <BlurContainer className="mx-auto max-w-4xl gap-6 rounded-md border border-neutral-200/80 p-6 sm:p-8 dark:border-neutral-200/20">
        <ResumeProfile />

        <ContentContainer title="Careers">
          <div className="grid gap-4">
            <ResumeContent
              leftContent={<time dateTime="2023-11">2023. 11 - 현재</time>}
              rightContent={
                <div className="grid gap-2">
                  <div>
                    <h4 className="mb-1 flex gap-0.5">
                      주식회사 데이원컴퍼니
                      <a
                        href="https://coloso.co.kr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Coloso
                      </a>
                      <div className="mb-1.5 size-[3px] self-end rounded-full bg-[#ffb200]" />
                    </h4>
                  </div>
                  <ul className="flex flex-col gap-4">
                    <li>
                      <strong>서비스 렌더링 전략 개선</strong>
                      <br />
                      SSR의 효율을 분석하고 SSG/ISR 및 캐싱 전략을 도입하여
                      서비스 성능 최적화 및 비용 절감
                      <ul className="mt-1 list-disc space-y-1 pl-8">
                        <li>서버 응답 시간 60~75% 단축 (800ms → 200ms)</li>
                        <li>서버 부하 및 트래픽 감소로 인프라 비용 절감</li>
                        <li>
                          <a
                            href="https://yujiseok.blog/writing/nextjs-rendering-optimization"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                          >
                            Next.js 렌더링 전략 개선기
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>
                        Coloso 포트폴리오 서비스 개발 및 성능 고도화
                      </strong>
                      <br />
                      대용량 이미지 환경에서 동적 Masonry 레이아웃, 가상 스크롤
                      등을 적용하여 렌더링 성능 최적화
                      <ul className="mt-1 list-disc space-y-1 pl-8">
                        <li>
                          월 평균 약 6.1만 세션, 5.8만 사용자 유입, 3.4만 신규
                          사용자 창출
                        </li>
                        <li>
                          가상 스크롤(Virtual Scrolling) 도입으로 렌더링 비용
                          46.8% 단축
                        </li>
                        <li>
                          메모이제이션을 통한 스크립팅 시간 42.3% 추가 단축
                        </li>
                        <li>
                          <a
                            href="https://yujiseok.blog/writing/how-to-implement-portfolio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                          >
                            서비스 Masonry 레이아웃 구현 회고
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>페이지 클라이언트 사이드 네비게이션 전환</strong>
                      <br />
                      페이지 전환 시 발생하는 깜빡임 현상 해결 및 사용자 경험
                      개선
                      <ul className="mt-1 list-disc space-y-1 pl-8">
                        <li>
                          불필요한 페이지 로드 제거로 총 실행 시간 46.2%,
                          스크립팅 시간 78% 단축
                        </li>
                        <li>
                          20줄 미만의 코드로 라우팅 로직을 개선하여 유지보수성
                          및 코드 효율성 증대
                        </li>
                        <li>
                          <a
                            href="https://yujiseok.blog/writing/improve-navigation"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                          >
                            서비스 서버 사이드 네비게이션 개선기
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>GENCON 컨퍼런스 랜딩사이트</strong>
                      <br />
                      컨퍼런스를 위한 인터랙티브 랜딩 페이지 구축 및 비즈니스
                      목표 달성
                      <ul className="mt-1 list-disc space-y-1 pl-8">
                        <li>인터랙션을 활용한 사용자 몰입 경험 증대</li>
                        <li>
                          랜딩 페이지 및 설문 기능으로 약 1,000명의 컨퍼런스
                          참여자 모객 성공
                        </li>
                        <li>
                          <a
                            href="https://yujiseok.blog/writing/2024-gencon"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                          >
                            젠콘 랜딩 페이지 개발 회고
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              }
            />
          </div>
        </ContentContainer>

        <ContentContainer title="Open Source Contribution">
          <ResumeContent
            leftContent={<time>2025. 05</time>}
            rightContent={
              <div className="grid gap-2">
                <div>
                  <h4 className="mb-1">
                    수파베이스 공식 문서{" "}
                    <a
                      href="https://github.com/supabase/supabase/pull/35404"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      기여
                    </a>
                  </h4>
                  <p>공식 문서 내 인증(Apple REST API) 관련 링크 수정 기여</p>
                </div>
              </div>
            }
          />
          <ResumeContent
            leftContent={<time>2023. 03</time>}
            rightContent={
              <div className="grid gap-2">
                <div>
                  <h4 className="mb-1">
                    리액트 공식 문서{" "}
                    <a
                      href="https://github.com/reactjs/react.dev/pull/5791"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      기여
                    </a>
                  </h4>
                  <p>리액트 공식 문서 예제 코드의 문법 오류 수정 기여</p>
                  <p>
                    <a
                      href="https://yujiseok.blog/writing/how-i-contributed-react-docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      React 공식 문서 기여 회고
                    </a>
                  </p>
                </div>
              </div>
            }
          />
        </ContentContainer>

        <ContentContainer title="Etc">
          <ResumeContent
            leftContent={<time>2024. 05 - 2025. 01</time>}
            rightContent={
              <div className="grid gap-2">
                <div>
                  <h4 className="mb-1 flex gap-0.5">
                    패스트캠퍼스 데브 캠프 멘토
                    <div className="mb-1.5 size-[3px] self-end rounded-full bg-[#fc1c49]" />
                  </h4>
                  <p>
                    패스트캠퍼스 데브 캠프에서 2기수에 걸쳐 40회 이상의 실시간
                    멘토링 진행
                  </p>
                </div>
                <ul>
                  <li>
                    멘티들에게 기술적 조언과 피드백을 제공하여 성장할 수 있도록
                    도움
                  </li>
                  <li>리액트를 활용한 프로젝트의 코드 리뷰 수행</li>
                </ul>
              </div>
            }
          />
        </ContentContainer>

        <ContentContainer title="Contact">
          <ResumeContent
            leftContent="Email"
            rightContent={
              <a
                href="mailto:koesijuy@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex hover:underline"
              >
                koesijuy@gmail.com
                <ArrowUpRight className="mb-1 scale-75" />
              </a>
            }
          />
          <ResumeContent
            leftContent="GitHub"
            rightContent={
              <a
                href="https://github.com/yujiseok"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex hover:underline"
              >
                yujiseok
                <ArrowUpRight className="mb-1 scale-75" />
              </a>
            }
          />
          <ResumeContent
            leftContent="Blog"
            rightContent={
              <a
                href="https://yujiseok.blog"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex hover:underline"
              >
                yujiseok.blog
                <ArrowUpRight className="mb-1 scale-75" />
              </a>
            }
          />
          <ResumeContent
            leftContent="Phone"
            rightContent={
              <a
                href="tel:+821085551095"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex hover:underline"
              >
                010-8555-1095
                <ArrowUpRight className="mb-1 scale-75" />
              </a>
            }
          />
        </ContentContainer>

        <ContentContainer title="Education">
          <ResumeContent
            leftContent={<time>2015. 03 - 2022. 08</time>}
            rightContent={
              <div className="grid gap-2">
                <div className="mb-1">한성대학교 패션디자인 전공</div>
              </div>
            }
          />
        </ContentContainer>
      </BlurContainer>
    </div>
  );
};

export default page;

const ResumeProfile = () => {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-xl font-semibold">유지석</h1>
        <small className="text-neutral-600 dark:text-neutral-400">
          Frontend Engineer
        </small>
      </div>

      <div className="grid gap-2 leading-6">
        <p>
          사용성과 심미성의 균형을 고민하며, 기능적으로 뛰어나고 아름다운 UI
          구현에 집중합니다. 디자인과 개발의 경계에서 사용자 경험을 깊이 있게
          탐구하며, 직접 문제를 찾아내고 개선책을 설계·구현하는 과정을 즐깁니다.
        </p>
        <p>
          Next.js SSR의 비효율성을 발견한 뒤 SSG/ISR로 전환하여 서버 응답 시간을
          75% 개선한 경험이 있습니다.
        </p>
        <p>
          “왜?”라는 질문으로 문제의 본질을 파악하고 해결책을 만들어 갑니다. 개발
          과정과 기술적 의사결정을 블로그에 기록하고, 동료와 함께 성장하는
          문화를 추구합니다.
        </p>
      </div>
    </div>
  );
};

const ResumeTitle = ({ title }: { title: string }) => {
  return <h3 className="font-semibold">{title}</h3>;
};

const ResumeContent = ({
  rightContent,
  leftContent,
}: {
  rightContent: React.ReactNode;
  leftContent: React.ReactNode;
}) => {
  return (
    <div className="grid gap-2 leading-6 sm:grid-cols-[150px_1fr] sm:gap-9">
      <div className="text-neutral-600 dark:text-neutral-400">
        {leftContent}
      </div>
      <div>{rightContent}</div>
    </div>
  );
};

const ContentContainer = ({
  title,
  children,
}: {
  title:
    | "Careers"
    | "Open Source Contribution"
    | "Education"
    | "Etc"
    | "Contact";
  children: React.ReactNode;
}) => {
  return (
    <div className="grid gap-4 sm:gap-6">
      <ResumeTitle title={title} />
      <div className="grid gap-4">{children}</div>
    </div>
  );
};

// TODO: JSON 형식으로 데이터 관리하기
