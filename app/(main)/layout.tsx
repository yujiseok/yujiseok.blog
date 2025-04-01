const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="mx-auto mt-28 w-full max-w-2xl px-4">{children}</main>
  );
};
export default Layout;
