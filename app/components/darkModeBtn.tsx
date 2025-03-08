"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import clsx from "clsx";

function DarkModeBtn() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-6 w-6" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      title="Toggle dark mode"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={clsx(
        "cursor-pointer rounded-lg p-2 transition-colors duration-250 ease-out",
        {
          "hover:bg-neutral-700/50": isDark,
          "hover:bg-neutral-200/50": !isDark,
        },
      )}
    >
      <div
        className={clsx("h-2 w-2 rounded-full", {
          "bg-neutral-50": isDark,
          "bg-neutral-800": !isDark,
        })}
      />
    </button>
  );
}

export default DarkModeBtn;
