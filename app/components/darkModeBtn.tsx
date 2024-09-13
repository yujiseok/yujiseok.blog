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

  return (
    <>
      {mounted && currentTheme === "dark" ? (
        <button
          type="button"
          title="Toggle dark mode"
          aria-label="Toggle theme"
          onClick={() => setTheme("light")}
        >
          <HiOutlineSun size={20} />
        </button>
      ) : (
        <button
          type="button"
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
