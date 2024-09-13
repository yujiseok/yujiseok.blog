function Footer() {
  return (
    <footer className="mx-auto mt-auto flex w-full max-w-2xl items-center px-4">
      <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 py-6">
        <p>© {new Date().getFullYear()} 유지석 All Rights Reserved.</p>
        <div className="flex gap-4">
          <a
            href="https://github.com/yujiseok"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="mailto:koesijuy@gamil.com" rel="noopener noreferrer">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
