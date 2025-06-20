

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './profile-picture.module.css'; // Adjust path as per your project structure

const debounce = (func, delay) => {
  let timer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(context, args), delay);
  };
};

const EllipseWithBackground = ({ borderWidth, imageSize }) => {
  const ellipseSize = imageSize - borderWidth * 28;

  const ellipseStyle = {
    border: `${borderWidth}px solid #4573df`,
    height: `${ellipseSize}px`,
    width: `${ellipseSize}px`,
  };

  return <div className={styles.ellipseDiv} style={ellipseStyle} aria-hidden="true"></div>;
};

const ImageWithEllipsesBackground = () => {
  const [hovered, setHovered] = useState(false);
  const [imageSize, setImageSize] = useState(500); // Default imageSize for large screens
  const [isMobile, setIsMobile] = useState(false); // Track if the screen is mobile size
  const [scrollPosition, setScrollPosition] = useState(0); // Track scroll position

  useEffect(() => {
    // Function to update imageSize based on window width
    const updateImageSize = () => {
      const width = window.innerWidth;
      setImageSize(width <= 576 ? 380 : 500); // Adjust imageSize for mobile screens (576px and below)
      setIsMobile(width <= 576); // Set isMobile to true for mobile screens
    };

    // Function to update scroll position using debounce
    const handleScroll = debounce(() => {
      setScrollPosition(window.scrollY);
    }, 100); // Adjust debounce delay as needed

    // Event listeners for resize and scroll
    updateImageSize();
    window.addEventListener('resize', updateImageSize);
    window.addEventListener('scroll', handleScroll);

    // Cleanup: Remove event listeners on component unmount
    return () => {
      window.removeEventListener('resize', updateImageSize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Memoized event handler for hover effect
  const handleHover = useCallback(() => {
    if (!isMobile) {
      setHovered((prevHovered) => !prevHovered); // Toggle hovered state
    }
  }, [isMobile]);

  // Render ellipses only when hovered, on mobile, and not hidden by scroll
  const renderEllipses = () => (
    <>
      <EllipseWithBackground borderWidth={1} imageSize={imageSize} />
      <EllipseWithBackground borderWidth={2} imageSize={imageSize} />
      <EllipseWithBackground borderWidth={3} imageSize={imageSize} />
      <EllipseWithBackground borderWidth={4} imageSize={imageSize} />
      <EllipseWithBackground borderWidth={5} imageSize={imageSize} />
      <EllipseWithBackground borderWidth={6} imageSize={imageSize} />
    </>
  );

  // Determine if the ellipses should be hidden based on scroll position
  const shouldHideEllipses = scrollPosition > 200; // Example threshold, adjust as needed

  return (
    <div className={styles.imageContainer} onMouseEnter={handleHover} onMouseLeave={handleHover}>
      <Image
        className={styles.image}
        alt="Professional portrait of Ghulam Mujtaba"
        src="/images/portfolio-picture.png"
        width={imageSize}
        height={imageSize}
        priority
      />
      {(hovered || isMobile) && !shouldHideEllipses && renderEllipses()}
    </div>
  );
};

export default ImageWithEllipsesBackground;
