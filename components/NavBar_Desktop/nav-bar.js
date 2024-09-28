// // import styles from "./nav-bar.module.css";
// // import { useState } from "react";
// // import { useRouter } from "next/router";

// // const NavBar = () => {
// //   const [hover, setHover] = useState(false);
// //   const router = useRouter();

// //   const handleNavigation = (path) => {
// //     router.push(path);
// //   };

// //   const handleMouseHover = (state) => {
// //     setHover(state);
// //   };

// //   const handleScrollToSection = (sectionId) => {
// //     const section = document.getElementById(sectionId);
// //     if (section) {
// //       section.scrollIntoView({ behavior: "smooth" });
// //     }
// //   };

// //   return (
// //     <header className={styles.header}>
// //       {/* Home button */}
// //       <button
// //         className={styles.home}
// //         onClick={() => handleScrollToSection("home-section")}
// //       >
// //         <b className={styles.homeText}>Home</b>
// //       </button>

// //       {/* About section */}
// //       <div
// //         className={styles.about}
// //         onClick={() => handleScrollToSection("about-section")}
// //       >
// //         <div className={styles.aboutText}>About</div>
// //       </div>

// //       {/* Skills section */}
// //       <div
// //         className={styles.skills}
// //         onClick={() => handleScrollToSection("languages-section")}
// //       >
// //         <div className={styles.skillsText}>Skills</div>
// //       </div>

// //       {/* Logo and Name Animation */}
// //       <div
// //         className={styles.logoAnimation}
// //         onMouseEnter={() => handleMouseHover(true)}
// //         onMouseLeave={() => handleMouseHover(false)}
// //         onClick={() => handleNavigation("/softbuilt")}
// //       >
// //         <button className={`${styles.logo} ${hover ? styles.logoHover : ""}`}>
// //           <img
// //             className={styles.logoIcon}
// //             alt="Logo"
// //             src={hover ? "sb.svg" : "gmVectorDark.svg"} // Different SVG based on hover state
// //             style={{
// //               width: hover ? "30px" : "40px", // Adjust width based on hover state
// //               height: hover ? "30px" : "40px", // Adjust height based on hover state
// //             }}
// //           />
// //         </button>
// //         <div className={styles.typo}>
// //           {!hover && (
// //             <img
// //               className={styles.nameIcon}
// //               loading="lazy"
// //               alt="Ghulam Mujtaba"
// //               src="/ghulam-mujtaba.svg"
// //               style={{ maxWidth: "100%", height: "auto" }} // Make the image responsive
// //             />
// //           )}
// //           {hover && (
// //             <img
// //               className={styles.alternativeNameIcon}
// //               loading="lazy"
// //               alt="SoftBuilt"
// //               src="/sbname.svg" // Alternative SVG on hover
// //               style={{ maxWidth: "100%", height: "auto" }} // Make the image responsive
// //             />
// //           )}
// //         </div>
// //       </div>

// //       {/* Resume section */}
// //       <div className={styles.resume} onClick={() => handleNavigation("/resume")}>
// //         <div className={styles.resumeText}>Resume</div>
// //       </div>

// //       {/* Project section */}
// //       <div
// //         className={styles.project}
// //         onClick={() => handleScrollToSection("project-section")}
// //       >
// //         <div className={styles.projectText}>Project</div>
// //       </div>

// //       {/* Contact section */}
// //       <div
// //         className={styles.contact}
// //         onClick={() => handleScrollToSection("contact-section")}
// //       >
// //         <div className={styles.contactText}>Contact</div>
// //       </div>
// //     </header>
// //   );
// // };

// // export default NavBar;


// import styles from "./nav-bar.module.css";
// import { useState } from "react";
// import Link from 'next/link'; // Import Link from Next.js

// const NavBar = () => {
//   const [hover, setHover] = useState(false);

//   const handleMouseHover = (state) => {
//     setHover(state);
//   };

//   const handleScrollToSection = (sectionId) => {
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
//         onClick={() => handleScrollToSection("home-section")}
//       >
//         <b className={styles.homeText}>Home</b>
//       </button>

//       {/* About section */}
//       <div
//         className={styles.about}
//         onClick={() => handleScrollToSection("about-section")}
//       >
//         <div className={styles.aboutText}>About</div>
//       </div>

//       {/* Skills section */}
//       <div
//         className={styles.skills}
//         onClick={() => handleScrollToSection("languages-section")}
//       >
//         <div className={styles.skillsText}>Skills</div>
//       </div>

//       {/* Logo and Name Animation */}
//       <Link href="http://softbuilt.ghulammujtaba.com" passHref>
//         <div
//           className={styles.logoAnimation}
//           onMouseEnter={() => handleMouseHover(true)}
//           onMouseLeave={() => handleMouseHover(false)}
//         >
//           <button className={`${styles.logo} ${hover ? styles.logoHover : ""}`}>
//             <img
//               className={styles.logoIcon}
//               alt="Logo"
//               src={hover ? "sb.svg" : "gmVectorDark.svg"} // Different SVG based on hover state
//               style={{
//                 width: hover ? "30px" : "40px", // Adjust width based on hover state
//                 height: hover ? "30px" : "40px", // Adjust height based on hover state
//               }}
//             />
//           </button>
//           <div className={styles.typo}>
//             {!hover && (
//               <img
//                 className={styles.nameIcon}
//                 loading="lazy"
//                 alt="Ghulam Mujtaba"
//                 src="/ghulam-mujtaba.svg"
//                 style={{ maxWidth: "100%", height: "auto" }} // Make the image responsive
//               />
//             )}
//             {hover && (
//               <img
//                 className={styles.alternativeNameIcon}
//                 loading="lazy"
//                 alt="SoftBuilt"
//                 src="/sbname.svg" // Alternative SVG on hover
//                 style={{ maxWidth: "100%", height: "auto" }} // Make the image responsive
//               />
//             )}
//           </div>
//         </div>
//       </Link>

//       {/* Resume section */}
//       <div className={styles.resume} onClick={() => handleNavigation("/resume")}>
//         <div className={styles.resumeText}>Resume</div>
//       </div>

//       {/* Project section */}
//       <div
//         className={styles.project}
//         onClick={() => handleScrollToSection("project-section")}
//       >
//         <div className={styles.projectText}>Project</div>
//       </div>

//       {/* Contact section */}
//       <div
//         className={styles.contact}
//         onClick={() => handleScrollToSection("contact-section")}
//       >
//         <div className={styles.contactText}>Contact</div>
//       </div>
//     </header>
//   );
// };

// export default NavBar;
import styles from "./nav-bar.module.css";
import { useState } from "react";
import Link from 'next/link'; // Import Link from Next.js

const NavBar = () => {
  const [hover, setHover] = useState(false);

  const handleMouseHover = (state) => {
    setHover(state);
  };

  const handleScrollToSection = (sectionId) => {
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
        onClick={() => handleScrollToSection("home-section")}
      >
        <b className={styles.homeText}>Home</b>
      </button>

      {/* About section */}
      <div
        className={styles.about}
        onClick={() => handleScrollToSection("about-section")}
      >
        <div className={styles.aboutText}>About</div>
      </div>

      {/* Skills section */}
      <div
        className={styles.skills}
        onClick={() => handleScrollToSection("languages-section")}
      >
        <div className={styles.skillsText}>Skills</div>
      </div>

      {/* Logo and Name Animation */}
      <Link href="http://softbuilt.ghulammujtaba.com" passHref>
        <div
          className={styles.logoAnimation}
          onMouseEnter={() => handleMouseHover(true)}
          onMouseLeave={() => handleMouseHover(false)}
        >
          <button className={`${styles.logo} ${hover ? styles.logoHover : ""}`}>
            <img
              className={styles.logoIcon}
              alt="Logo"
              src={hover ? "sb.svg" : "gmVectorDark.svg"} // Different SVG based on hover state
              style={{
                width: hover ? "30px" : "40px", // Adjust width based on hover state
                height: hover ? "30px" : "40px", // Adjust height based on hover state
              }}
            />
          </button>
          <div className={styles.typo}>
            {!hover && (
              <img
                className={styles.nameIcon}
                loading="lazy"
                alt="Ghulam Mujtaba"
                src="/ghulam-mujtaba.svg"
                style={{ maxWidth: "100%", height: "auto" }} // Make the image responsive
              />
            )}
            {hover && (
              <img
                className={styles.alternativeNameIcon}
                loading="lazy"
                alt="SoftBuilt"
                src="/sbname.svg" // Alternative SVG on hover
                style={{ maxWidth: "100%", height: "auto" }} // Make the image responsive
              />
            )}
          </div>
        </div>
      </Link>

      {/* Resume section */}
      <Link href="/resume" passHref>
        <div className={styles.resume}>
          <div className={styles.resumeText}>Resume</div>
        </div>
      </Link>

      {/* Project section */}
      <div
        className={styles.project}
        onClick={() => handleScrollToSection("project-section")}
      >
        <div className={styles.projectText}>Project</div>
      </div>

      {/* Contact section */}
      <div
        className={styles.contact}
        onClick={() => handleScrollToSection("contact-section")}
      >
        <div className={styles.contactText}>Contact</div>
      </div>
    </header>
  );
};

export default NavBar;
