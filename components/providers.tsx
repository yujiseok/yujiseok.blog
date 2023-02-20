"use client";
import { ThemeProvider } from "next-themes";

function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider enableSystem={true} attribute="class">
      {children}
    </ThemeProvider>
  );
}
export default ThemeProviders;
