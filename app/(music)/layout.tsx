import NavBar from "../components/music/navBar";
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
