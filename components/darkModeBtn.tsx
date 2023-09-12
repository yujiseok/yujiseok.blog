import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function DarkModeBtn() {
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // if (!mounted) return null;

  return (
    <>
      {mounted && currentTheme === "dark" ? (
        <button
          type="button"
          className="rounded-md bg-slate-100 p-2 text-black delay-75 ease-in-out hover:bg-slate-200"
          title="Toggle dark mode"
          aria-label="Toggle theme"
          onClick={() => setTheme("light")}
        >
          <HiOutlineSun size={20} />
        </button>
      ) : (
        <button
          type="button"
          className="rounded-md bg-slate-100 p-2 text-black delay-75 ease-in-out hover:bg-slate-200"
          title="Toggle dark mode"
          aria-label="Toggle theme"
          onClick={() => setTheme("dark")}
        >
          <HiOutlineMoon size={20} />
        </button>
      )}
    </>
  );
}
export default DarkModeBtn;
