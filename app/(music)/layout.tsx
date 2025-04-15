import { Metadata } from "next";
import NavBar from "../components/music/navBar";

export const metadata: Metadata = {
  title: "Music",
  description: "음악적 취향을 나누는 공간",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NavBar />
      <main className="mx-auto mt-14 grid w-full max-w-2xl gap-10 p-2">
        {children}
      </main>
    </>
  );
};
export default Layout;
