import { Metadata } from "next";
import NavBar from "@/app/(music)/_components/nav-bar";
import Footer from "@/app/_components/footer";

// alternates/openGraph.url은 라우트별 값이라 레이아웃에 두면 하위 페이지가 통째로 상속한다.
export const metadata: Metadata = {
  title: {
    default: "Music",
    template: "%s | Music | Yujiseok",
  },
  description: "음악적 취향을 나누는 공간",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NavBar />
      <main
        id="content"
        className="mx-auto mt-14 grid w-full max-w-2xl gap-10 md:p-2"
      >
        {children}
      </main>
      <Footer />
    </>
  );
};
export default Layout;
