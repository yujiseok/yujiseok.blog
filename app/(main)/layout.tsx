import Footer from "../components/footer";

// 뒤로 가기는 라우트마다 목적지가 달라 각 페이지가 직접 렌더한다.
// 홈은 돌아갈 곳이 없으므로 아예 그리지 않는다.
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <main id="content" className="mx-auto mt-24 w-full max-w-2xl sm:mt-28">
        {children}
      </main>
      <Footer />
    </>
  );
};
export default Layout;
