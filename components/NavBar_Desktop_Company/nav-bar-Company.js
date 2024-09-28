// import styles from "./nav-bar-Compnay.module.css";
// import { useState } from "react";
// import { useRouter } from "next/router";

// const NavBar = () => {
//   const [hover, setHover] = useState(false);
//   const router = useRouter();

//   const handleLogoClick = () => {
//     router.push('/');
//   };

//   const handleMouseEnter = () => {
//     setHover(true);
//   };

//   const handleMouseLeave = () => {
//     setHover(false);
//   };

//   const scrollToSection = (sectionId) => {
//     const section = document.getElementById(sectionId);
//     if (section) {
//       section.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   return (
//     <header className={styles.header}>
//       {/* Home button */}
//       <button
//         className={styles.home}
//         onClick={() => scrollToSection("home-section")}
//         aria-label="Home"
//       >
//         <b className={styles.homeText}>Home</b>
//       </button>

//       {/* About section */}
//       <div
//         className={styles.about}
//         onClick={() => scrollToSection("about-section")}
//         role="button"
//         tabIndex={0}
//         aria-label="About"
//         onKeyPress={(e) => e.key === 'Enter' && scrollToSection("about-section")}
//       >
//         <div className={styles.aboutText}>About</div>
//       </div>

//       {/* Services section */}
//       <div
//         className={styles.skills}
//         onClick={() => scrollToSection("services-section")}
//         role="button"
//         tabIndex={0}
//         aria-label="Services"
//         onKeyPress={(e) => e.key === 'Enter' && scrollToSection("services-section")}
//       >
//         <div className={styles.skillsText}>Services</div>
//       </div>

//       {/* Logo and Name Animation */}
//       <div
//         className={styles.logoAnimation}
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//         onClick={handleLogoClick}
//         role="button"
//         tabIndex={0}
//         aria-label="Home Portfolio"
//         onKeyPress={(e) => e.key === 'Enter' && handleLogoClick()}
//       >
//         <button className={`${styles.logo} ${hover ? styles.logoHover : ""}`}>
//           <img
//             className={styles.logoIcon}
//             alt="Company Logo"
//             src={hover ? "gmVectorDark.svg" : "sb.svg"} // Different SVG based on hover state
//             style={{
//               width: hover ? "35px" : "27px", // Adjust width based on hover state
//               height: hover ? "35px" : "27px", // Adjust height based on hover state
//             }}
//           />
//         </button>
//         <div className={styles.typo}>
//           {!hover && (
//             <img
//               className={styles.nameIcon}
//               loading="lazy"
//               alt="SoftBuilt Name"
//               src="/sbname.svg"
//               style={{ maxWidth: "100%", height: "auto" }} // Make the image responsive
//             />
//           )}
//           {hover && (
//             <img
//               className={styles.alternativeNameIcon}
//               loading="lazy"
//               alt="Ghulam Mujtaba Name"
//               src="/ghulam-mujtaba.svg" // Alternative SVG on hover
//               style={{ maxWidth: "100%", height: "auto" }} // Make the image responsive
//             />
//           )}
//         </div>
//       </div>

//       {/* Reviews section */}
//       <div
//         className={styles.resume}
//         onClick={() => scrollToSection("reviews-section")}
//         role="button"
//         tabIndex={0}
//         aria-label="Reviews"
//         onKeyPress={(e) => e.key === 'Enter' && scrollToSection("reviews-section")}
//       >
//         <div className={styles.resumeText}>Reviews</div>
//       </div>

//       {/* Project section */}
//       <div
//         className={styles.project}
//         onClick={() => scrollToSection("project-section")}
//         role="button"
//         tabIndex={0}
//         aria-label="Project"
//         onKeyPress={(e) => e.key === 'Enter' && scrollToSection("project-section")}
//       >
//         <div className={styles.projectText}>Project</div>
//       </div>

//       {/* Contact section */}
//       <div
//         className={styles.contact}
//         onClick={() => scrollToSection("contact-section")}
//         role="button"
//         tabIndex={0}
//         aria-label="Contact"
//         onKeyPress={(e) => e.key === 'Enter' && scrollToSection("contact-section")}
//       >
//         <div className={styles.contactText}>Contact</div>
//       </div>
//     </header>
//   );
// };

// export default NavBar;


import styles from "./nav-bar-Compnay.module.css";
import { useState } from "react";
import Link from 'next/link'; // Import Link from Next.js

const NavBar = () => {
  const [hover, setHover] = useState(false);

  const handleMouseEnter = () => {
    setHover(true);
  };

  const handleMouseLeave = () => {
    setHover(false);
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={styles.header}>
      {/* Home button */}
      <button
        className={styles.home}
        onClick={() => scrollToSection("home-section")}
        aria-label="Home"
      >
        <b className={styles.homeText}>Home</b>
      </button>

      {/* About section */}
      <div
        className={styles.about}
        onClick={() => scrollToSection("about-section")}
        role="button"
        tabIndex={0}
        aria-label="About"
        onKeyPress={(e) => e.key === 'Enter' && scrollToSection("about-section")}
      >
        <div className={styles.aboutText}>About</div>
      </div>

      {/* Services section */}
      <div
        className={styles.skills}
        onClick={() => scrollToSection("services-section")}
        role="button"
        tabIndex={0}
        aria-label="Services"
        onKeyPress={(e) => e.key === 'Enter' && scrollToSection("services-section")}
      >
        <div className={styles.skillsText}>Services</div>
      </div>

      {/* Logo and Name Animation */}
      <Link href="http://ghulammujtaba.com" passHref>
        <div
          className={styles.logoAnimation}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="button"
          tabIndex={0}
          aria-label="Home Portfolio"
          onKeyPress={(e) => e.key === 'Enter' && handleLogoClick()}
        >
          <button className={`${styles.logo} ${hover ? styles.logoHover : ""}`}>
            <img
              className={styles.logoIcon}
              alt="Company Logo"
              src={hover ? "gmVectorDark.svg" : "sb.svg"} // Different SVG based on hover state
              style={{
                width: hover ? "35px" : "27px", // Adjust width based on hover state
                height: hover ? "35px" : "27px", // Adjust height based on hover state
              }}
            />
          </button>
          <div className={styles.typo}>
            {!hover && (
              <img
                className={styles.nameIcon}
                loading="lazy"
                alt="SoftBuilt Name"
                src="/sbname.svg"
                style={{ maxWidth: "100%", height: "auto" }} // Make the image responsive
              />
            )}
            {hover && (
              <img
                className={styles.alternativeNameIcon}
                loading="lazy"
                alt="Ghulam Mujtaba Name"
                src="/ghulam-mujtaba.svg" // Alternative SVG on hover
                style={{ maxWidth: "100%", height: "auto" }} // Make the image responsive
              />
            )}
          </div>
        </div>
      </Link>

      {/* Reviews section */}
      <div
        className={styles.resume}
        onClick={() => scrollToSection("reviews-section")}
        role="button"
        tabIndex={0}
        aria-label="Reviews"
        onKeyPress={(e) => e.key === 'Enter' && scrollToSection("reviews-section")}
      >
        <div className={styles.resumeText}>Reviews</div>
      </div>

      {/* Project section */}
      <div
        className={styles.project}
        onClick={() => scrollToSection("project-section")}
        role="button"
        tabIndex={0}
        aria-label="Project"
        onKeyPress={(e) => e.key === 'Enter' && scrollToSection("project-section")}
      >
        <div className={styles.projectText}>Project</div>
      </div>

      {/* Contact section */}
      <div
        className={styles.contact}
        onClick={() => scrollToSection("contact-section")}
        role="button"
        tabIndex={0}
        aria-label="Contact"
        onKeyPress={(e) => e.key === 'Enter' && scrollToSection("contact-section")}
      >
        <div className={styles.contactText}>Contact</div>
      </div>
    </header>
  );
};

export default NavBar;
