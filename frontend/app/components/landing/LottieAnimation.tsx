"use client";

import { useLottie } from "lottie-react";
import { useEffect, useState } from "react";

interface LottieAnimationProps {
  path: string;
  className?: string;
}

export function LottieAnimation({ path, className }: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load animation");
        return response.json();
      })
      .then((data) => setAnimationData(data))
      .catch((e) => console.error("Error loading lottie:", e));
  }, [path]);

  const { View } = useLottie({
    animationData,
    loop: true,
    autoplay: true,
  });

  if (!animationData) {
    return <div className={`${className} bg-muted animate-pulse rounded-xl`} />;
  }

  return <div className={className}>{View}</div>;
}
