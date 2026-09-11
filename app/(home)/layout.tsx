import Footer from "@/app/_components/footer";

/*
 * 홈만 글 목록 오른쪽에 그림이 한 판 더 붙어 다른 라우트보다 넓다.
 *
 * (main)의 max-w-2xl을 전역 CSS(body:has(...))로 덮어쓰는 방법을 먼저 썼다가
 * 물렀다. 라우트를 옮겨도 (main)의 main은 같은 DOM 노드로 남는 탓에, 홈을
 * 떠난 뒤에도 넓은 폭이 새로고침 전까지 따라다녔다. 홈이 자기 main을 들고
 * 있으면 나갈 때 노드째 사라져서 그런 일이 없다.
 *
 * 뒤로 가기는 (main)과 같은 이유로 그리지 않는다 — 홈은 돌아갈 곳이 없다.
 */
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <main
        id="content"
        className="mx-auto mt-24 w-full max-w-[69rem] sm:mt-28"
      >
        {children}
      </main>
      <Footer />
    </>
  );
};
export default Layout;
