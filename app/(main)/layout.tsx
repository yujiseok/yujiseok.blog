import Navbar from "../components/navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />

      <main className="mx-auto mt-14 w-full max-w-2xl px-4">{children}</main>
    </>
  );
};
export default Layout;
