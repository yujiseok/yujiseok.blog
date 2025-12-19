"use client";

import { cn } from "@/lib/cn";
import { useState } from "react";

const Rerun = ({ handleRerun }: { handleRerun: VoidFunction }) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleClick = () => {
    setIsRotating(true);
    handleRerun();
    setTimeout(() => {
      setIsRotating(false);
    }, 150);
  };

  return (
    <button
      className="absolute top-4 right-4 cursor-pointer rounded-lg border border-black/20 bg-white/50 p-1.5 transition-colors duration-250 ease-out hover:bg-black/5 dark:border-white/20 dark:bg-black/50 dark:hover:bg-white/10"
      onClick={handleClick}
    >
      <RerunIcon isRotating={isRotating} />
    </button>
  );
};

export default Rerun;

const RerunIcon = ({ isRotating }: { isRotating: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={cn(
      "size-4 transition-transform duration-150 ease-in will-change-transform",
      isRotating && "rotate-[160deg]",
    )}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M4.47852 12C4.47852 7.85786 7.83638 4.5 11.9785 4.5C14.4012 4.5 16.0555 5.46268 17.7064 7.25H15.25C14.8358 7.25 14.5 7.58579 14.5 8C14.5 8.41421 14.8358 8.75 15.25 8.75H18.75C19.4404 8.75 20 8.19036 20 7.5V4C20 3.58579 19.6642 3.25 19.25 3.25C18.8358 3.25 18.5 3.58579 18.5 4V5.90778C16.7377 4.10436 14.7767 3 11.9785 3C7.00795 3 2.97852 7.02944 2.97852 12C2.97852 16.9706 7.00795 21 11.9785 21C15.8983 21 19.2311 18.4945 20.4662 14.9999C20.6042 14.6094 20.3995 14.1809 20.009 14.0429C19.6185 13.9048 19.19 14.1095 19.0519 14.5001C18.022 17.4141 15.2429 19.5 11.9785 19.5C7.83638 19.5 4.47852 16.1421 4.47852 12Z"
      fill="currentColor"
    />
  </svg>
);
