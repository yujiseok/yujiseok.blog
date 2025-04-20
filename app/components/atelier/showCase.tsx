"use client";

import Rerun from "./rerun";
import React, { useState } from "react";

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
    <div className="relative grid h-96 place-items-center overflow-hidden rounded-lg border border-neutral-300/80 bg-neutral-100/50 p-0.5 dark:border-neutral-700 dark:bg-neutral-900/50">
      {rerun && <Rerun handleRerun={handleRerun} />}
      <React.Fragment key={key}>{children}</React.Fragment>
    </div>
  );
};

export default ShowCase;
