import React, { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";

const HoverLottie = ({ src, className }) => {
  const lottieRef = useRef(null);
  const wrapperRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setIsReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener?.("change", syncPreference);
    return () => mediaQuery.removeEventListener?.("change", syncPreference);
  }, []);

  useEffect(() => {
    if (!src || isReducedMotion) return;

    let cancelled = false;
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Unable to load ${src}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isReducedMotion, src]);

  if (isReducedMotion) return null;

  return (
    <span ref={wrapperRef} className={className} aria-hidden="true">
      {animationData ? (
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </span>
  );
};

export default HoverLottie;

