const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="mx-auto mt-24 w-full max-w-2xl sm:mt-28">{children}</main>
  );
};
export default Layout;
