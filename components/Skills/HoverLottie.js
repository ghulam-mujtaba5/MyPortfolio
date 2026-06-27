import React, { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";

const HoverLottie = ({ src, active, className }) => {
  const lottieRef = useRef(null);
  const wrapperRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);
  const [isLocallyActive, setIsLocallyActive] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const isActive = active || isLocallyActive;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setIsReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener?.("change", syncPreference);
    return () => mediaQuery.removeEventListener?.("change", syncPreference);
  }, []);

  useEffect(() => {
    const card = wrapperRef.current?.parentElement;
    if (!card) return;

    const show = () => {
      setShouldLoad(true);
      setIsLocallyActive(true);
    };
    const hide = () => setIsLocallyActive(false);

    card.addEventListener("mouseenter", show);
    card.addEventListener("pointerenter", show);
    card.addEventListener("focusin", show);
    card.addEventListener("click", show);
    card.addEventListener("touchstart", show, { passive: true });
    card.addEventListener("mouseleave", hide);
    card.addEventListener("pointerleave", hide);
    card.addEventListener("focusout", hide);

    return () => {
      card.removeEventListener("mouseenter", show);
      card.removeEventListener("pointerenter", show);
      card.removeEventListener("focusin", show);
      card.removeEventListener("click", show);
      card.removeEventListener("touchstart", show);
      card.removeEventListener("mouseleave", hide);
      card.removeEventListener("pointerleave", hide);
      card.removeEventListener("focusout", hide);
    };
  }, []);

  useEffect(() => {
    if (active) setShouldLoad(true);
  }, [active]);

  useEffect(() => {
    if (!shouldLoad || animationData || isReducedMotion) return;

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
  }, [animationData, isReducedMotion, shouldLoad, src]);

  useEffect(() => {
    if (!lottieRef.current || !animationData) return;

    if (isActive) {
      lottieRef.current.goToAndPlay(0, true);
    } else {
      lottieRef.current.stop();
    }
  }, [animationData, isActive]);

  if (isReducedMotion) return null;

  return (
    <span ref={wrapperRef} className={className} aria-hidden="true">
      {animationData ? (
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop
          autoplay={isActive}
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </span>
  );
};

export default HoverLottie;
