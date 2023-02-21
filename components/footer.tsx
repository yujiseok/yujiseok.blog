function Footer() {
  return (
    <footer className="mx-auto mt-auto flex w-full max-w-2xl items-center px-4">
      <div className="mt-6 flex w-full flex-col items-center justify-center gap-4 border-t py-6">
        <p>© {new Date().getFullYear()} 유지석 All Rights Reserved.</p>
        <a
          href="https://github.com/yujiseok"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
export default Footer;
