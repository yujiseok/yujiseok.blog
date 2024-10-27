"use client";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

function ThemeProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <ThemeProvider enableSystem={true} attribute="class">
      {children}
    </ThemeProvider>
  );
}
export default ThemeProviders;
