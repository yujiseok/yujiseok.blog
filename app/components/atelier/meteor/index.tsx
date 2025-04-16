"use client";

import React, { useState, useEffect, useLayoutEffect } from "react";

const starColors = [
  "rgb(255, 255, 255)",
  "rgb(255, 247, 230)",
  "rgb(255, 238, 200)",
  "rgb(255, 220, 180)",
  "rgb(255, 187, 153)",
  "rgb(255, 150, 150)",
  "rgb(200, 215, 255)",
  "rgb(170, 191, 255)",
];

const makeStars = (count: number) =>
  Array.from({ length: count }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
  }));

const Meteor = () => {
  const [stars, setStars] = useState(makeStars(300));

  useLayoutEffect(() => {
    setStars(makeStars(300));
  }, []);

  return (
    <div className="absolute size-full bg-black">
      {stars.map((star, index) => (
        <Star key={index} top={star.top} left={star.left} />
      ))}
      <ShootingStars count={3} />
    </div>
  );
};

export default Meteor;

const Star = ({ top, left }: { top: number; left: number }) => {
  const size = Math.random() * 2 + 0.5;
  const duration = Math.random() * 3 + 2;
  const backgroundColor =
    starColors[Math.floor(Math.random() * starColors.length)];

  return (
    <div
      suppressHydrationWarning
      className="twinkle absolute rounded-full bg-white"
      style={
        {
          top: `${top}%`,
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          opacity: Math.random() * 0.5 + 0.5,
          boxShadow: `0 0 ${size * 2}px ${size}px rgba(255, 255, 255, 0.7)`,
          backgroundColor,
          "--duration": `${duration}s`,
        } as React.CSSProperties
      }
    />
  );
};

const ShootingStar = () => {
  const [styles, setStyles] = useState({
    top: 0,
    left: 0,
    duration: 0,
    width: 0,
  });

  useLayoutEffect(() => {
    setStyles({
      top: Math.random() * 20,
      left: Math.random() * 100,
      duration: Math.random() * 4 + 4,
      width: Math.random() * 23 + 90,
    });
  }, []);

  return (
    <div
      suppressHydrationWarning
      className="shooting absolute h-0.5 bg-gradient-to-r from-transparent to-white shadow"
      style={
        {
          top: `${styles.top}%`,
          left: `${styles.left}%`,
          width: `${styles.width}px`,
          "--duration": `${styles.duration}s`,
        } as React.CSSProperties
      }
    />
  );
};

const ShootingStars = ({ count }: { count: number }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => setIsVisible(true), 100);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <ShootingStar key={index} />
      ))}
    </>
  );
};
