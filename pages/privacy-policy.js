
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from './PrivacyPolicy.module.css';



const PrivacyPolicy = () => (
  <main className={styles.privacyMain}>
    <Head>
      <title>Privacy Policy | Ghulam Mujtaba Portfolio</title>
      <meta name="description" content="Privacy Policy for Ghulam Mujtaba's Portfolio website. Learn how we collect, use, and protect your information." />
    </Head>
    <section className={styles.section} aria-labelledby="privacy-policy-title">
      <h1 id="privacy-policy-title" className={styles.heading}>Privacy Policy</h1>
      <p className={styles.date}><em>Last updated: June 22, 2025</em></p>
    </section>
    <section className={styles.section}>
      <h2 className={styles.subheading}>1. Introduction</h2>
      <p>
        Welcome to the personal portfolio of <strong>Ghulam Mujtaba</strong> (<a href="https://ghulammujtaba.com" target="_blank" rel="noopener noreferrer">ghulammujtaba.com</a>). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit this website, including any related services, features, or content. Ghulam Mujtaba is committed to protecting your privacy and ensuring transparency.
      </p>
    </section>
    <section className={styles.section}>
      <h2 className={styles.subheading}>2. Information We Collect</h2>
      <ul>
        <li><strong>Personal Information:</strong> If you contact Ghulam Mujtaba via the contact form or email (ghulammujtaba0454@gmail.com), your name, email address, and message content are collected solely for communication purposes.</li>
        <li><strong>Resume & Projects:</strong> If you download the resume or view project details, no additional personal data is collected unless you reach out directly.</li>
        <li><strong>Usage Data:</strong> Information about your visit (such as pages viewed, time spent, browser/device info) is collected via cookies and analytics tools (e.g., Google Analytics) to improve the site.</li>
        <li><strong>Cookies:</strong> Cookies are used to enhance your experience, remember preferences, and manage consent. You can accept or decline cookies via the cookie consent banner at any time.</li>
        <li><strong>Social Links:</strong> If you visit external social profiles (LinkedIn, Instagram, GitHub), those platforms may collect data per their own privacy policies.</li>
      </ul>
    </section>
    <section className={styles.section}>
      <h2 className={styles.subheading}>3. How We Use Your Information</h2>
      <ul>
        <li>To provide, operate, and maintain this portfolio website and its features.</li>
        <li>To improve and personalize your experience based on your preferences and usage.</li>
        <li>To respond to your inquiries, requests, or feedback sent to <a href="mailto:ghulammujtaba0454@gmail.com">ghulammujtaba0454@gmail.com</a>.</li>
        <li>To analyze usage and trends to improve the site and services.</li>
        <li>To comply with legal obligations and protect the rights of Ghulam Mujtaba.</li>
      </ul>
    </section>
    <section className={styles.section}>
      <h2 className={styles.subheading}>4. Sharing Your Information</h2>
      <p>
        Your personal information is <strong>never</strong> sold, traded, or rented to third parties. Information may be shared with trusted service providers (such as analytics providers) only as necessary to operate the website, and always in accordance with this policy. These providers are required to protect your information and use it only for the services they provide to Ghulam Mujtaba.
      </p>
    </section>
    <section className={styles.section}>
      <h2 className={styles.subheading}>5. Cookies and Tracking Technologies</h2>
      <p>
        Cookies and similar technologies are used to collect and store information about your preferences and usage. You can control cookie preferences via your browser settings or the cookie consent banner. For more details, see our <Link href="/cookie-policy">Cookie Policy</Link> (if available).
      </p>
      <ul>
        <li><strong>Essential Cookies:</strong> Required for the website to function (e.g., theme, consent banner).</li>
        <li><strong>Analytics Cookies:</strong> Help understand how visitors interact with the site (Google Analytics).</li>
        <li><strong>Preference Cookies:</strong> Remember your settings and preferences (e.g., dark/light mode).</li>
      </ul>
    </section>
    <section className={styles.section}>
      <h2 className={styles.subheading}>6. Data Security</h2>
      <p>
        Reasonable security measures are implemented to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
      </p>
    </section>
    <section className={styles.section}>
      <h2 className={styles.subheading}>7. Third-Party Links</h2>
      <p>
        This website contains links to third-party sites or services, including LinkedIn, Instagram, and GitHub. Ghulam Mujtaba is not responsible for the privacy practices or content of those sites. Please review the privacy policies of any third-party sites you visit.
      </p>
    </section>
    <section className={styles.section}>
      <h2 className={styles.subheading}>8. Children’s Privacy</h2>
      <p>
        This website is not intended for children under 13. No personal information is knowingly collected from children. If you believe a child has provided personal information, please contact Ghulam Mujtaba and such data will be promptly deleted.
      </p>
    </section>
    <section className={styles.section}>
      <h2 className={styles.subheading}>9. Your Rights</h2>
      <p>
        You have the right to access, update, or delete your personal information. To exercise these rights, please contact Ghulam Mujtaba using the information below. Requests will be responded to as soon as possible.
      </p>
    </section>
    <section className={styles.section}>
      <h2 className={styles.subheading}>10. Changes to This Policy</h2>
      <p>
        This Privacy Policy may be updated from time to time. Any changes will be posted on this page with an updated date. Please review this policy periodically.
      </p>
    </section>
    <section className={styles.section}>
      <h2 className={styles.subheading}>11. Contact</h2>
      <p>
        For any questions, concerns, or feedback about this Privacy Policy or data practices, please contact:
      </p>
      <ul>
        <li><strong>Name:</strong> Ghulam Mujtaba</li>
        <li><strong>Email:</strong> <a href="mailto:ghulammujtaba0454@gmail.com">ghulammujtaba0454@gmail.com</a></li>
        <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/ghulamujtabaofficial" target="_blank" rel="noopener noreferrer">ghulamujtabaofficial</a></li>
        <li><strong>Instagram:</strong> <a href="https://www.instagram.com/ghulamujtabaofficial/" target="_blank" rel="noopener noreferrer">ghulamujtabaofficial</a></li>
        <li><strong>GitHub:</strong> <a href="https://github.com/ghulam-mujtaba5" target="_blank" rel="noopener noreferrer">ghulam-mujtaba5</a></li>
      </ul>
      <p>
        You may also <Link href="/#contact-section">contact me via the contact form</Link> for any privacy-related requests or feedback.
      </p>
    </section>
  </main>
);

export default PrivacyPolicy;
