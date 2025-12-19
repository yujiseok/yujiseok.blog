"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";

const Rerun = dynamic(() => import("./rerun"), {
  ssr: false,
});

const ShowCase = ({
  children,
  rerun = false,
}: {
  children: React.ReactNode;
  rerun?: boolean;
}) => {
  const [key, setKey] = useState(0);

  const handleRerun = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="relative grid h-96 place-items-center overflow-hidden rounded-lg border border-black/20 bg-white/50 p-0.5 dark:border-white/20 dark:bg-black/50">
      {rerun && <Rerun handleRerun={handleRerun} />}
      <React.Fragment key={key}>{children}</React.Fragment>
    </div>
  );
};

export default ShowCase;
