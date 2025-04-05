import ArrowUpRight from "@/app/components/arrowUpRight";
import BlurContainer from "@/app/components/blurContainer";

const page = () => {
  return (
    <BlurContainer className="gap-6 rounded-lg border border-neutral-200/80 p-8 dark:border-neutral-200/20">
      <Profile />

      <section className="grid gap-6">
        <ResumeTitle title="Work Experience" />
        <div className="grid gap-4">
          <ResumeContent
            leftContent={<time dateTime="2023-11">2023. 11 - 현재</time>}
            rightContent={
              <div className="grid gap-2">
                <div>
                  <h4 className="mb-1 flex gap-0.5">
                    데이원컴퍼니{" "}
                    <a
                      href="https://coloso.co.kr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Coloso
                    </a>
                    <div className="mb-1.5 size-0.5 self-end rounded-full bg-[#ffb200]" />
                  </h4>

                  <p>
                    Next.js를 사용해 글로벌 서비스의 유저 인터페이스를 구현하고
                    있습니다.
                  </p>
                </div>
                <ul>
                  <li></li>
                  <li></li>
                </ul>
              </div>
            }
          />
          <ResumeContent
            leftContent={<time>2024. 05 - 2025. 01</time>}
            rightContent={
              <div className="grid gap-2">
                <div>
                  <h4 className="mb-1 flex gap-0.5">
                    패스트캠퍼스
                    <a
                      href="https://kernel.fastcampus.co.kr/180_frontend"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      데브 캠프 멘토
                    </a>
                    <div className="mb-1.5 size-0.5 self-end rounded-full bg-[#fc1c49]" />
                  </h4>

                  <p>
                    패스트캠퍼스 데브 캠프에서 2기수에 걸쳐 40회 이상의 실시간
                    멘토링을 성공적으로 진행한 경험이 있습니다.
                  </p>
                </div>
                <ul>
                  <li>
                    멘티들에게 기술적 조언과 피드백을 제공하여 성장할 수 있도록
                    도움을 주었습니다.
                  </li>
                  <li>
                    리액트를 활용한 프로젝트 및 코드에 대한 코드 리뷰를
                    수행하였습니다.
                  </li>
                </ul>
              </div>
            }
          />
        </div>
      </section>

      <section className="grid gap-6">
        <ResumeTitle title="Contact" />
        <div className="grid gap-4">
          <ResumeContent
            leftContent={"GitHub"}
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
            leftContent={"LinkedIn"}
            rightContent={
              <a
                href="https://www.linkedin.com/in/yujiseok"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex hover:underline"
              >
                유지석
                <ArrowUpRight className="mb-1 scale-75" />
              </a>
            }
          />
          <ResumeContent
            leftContent={"Email"}
            rightContent={
              <a
                href="mailto:yujiseok@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex hover:underline"
              >
                yujiseok@gmail.com
                <ArrowUpRight className="mb-1 scale-75" />
              </a>
            }
          />
          <ResumeContent
            leftContent={"Phone"}
            rightContent={
              <a
                href="tel:+821085551095"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex hover:underline"
              >
                01085551095
                <ArrowUpRight className="mb-1 scale-75" />
              </a>
            }
          />
        </div>
      </section>
    </BlurContainer>
  );
};

export default page;

const Profile = () => {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-xl font-semibold">유지석</h1>
        <small className="text-sm text-neutral-600 dark:text-neutral-400">
          Frontend Engineer
        </small>
      </div>

      <div className="grid gap-2 text-sm leading-6">
        <p>
          패션디자인을 전공하여, 디자인과 개발에 큰 관심을 가지고 있습니다. 특히
          리액트를 사용하여 사용자 인터페이스를 화면에 그려내는 것을 즐깁니다.
          사용자 경험을 강화하는 것을 중요하게 생각합니다. 최근에는 모션과
          인터렉션을 활용하여 사용자 경험을 향상시키는 것에 관심을 가지고
          있습니다.
        </p>
        <p>
          직접 경험한 것을 글로 기록하는 것을 좋아합니다. 개인 기술 블로그를
          통해 프론트엔드 기술에 관한 글과 저의 회고를 다루며, 개발 커뮤니티와
          지식 공유에 기여하고자 합니다.
        </p>

        <p>Coloso 서비스의 유저 인터페이스를 구현하고 있습니다. </p>
      </div>
    </div>
  );
};

const ResumeTitle = ({ title }: { title: string }) => {
  return <h3 className="text-sm font-normal">{title}</h3>;
};

const ResumeContent = ({
  rightContent,
  leftContent,
}: {
  rightContent: React.ReactNode;
  leftContent: React.ReactNode;
}) => {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-9 text-sm leading-6">
      <div className="text-neutral-600 dark:text-neutral-400">
        {leftContent}
      </div>
      <div>{rightContent}</div>
    </div>
  );
};

// 1기 - 32번
// 리뷰 5번
// 2기 - 12번
// 리뷰 4번
