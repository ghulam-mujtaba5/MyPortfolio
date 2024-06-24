// import React, { useState, useCallback, useMemo } from 'react';
// import emailjs from 'emailjs-com';
// import { useTheme } from '../../context/ThemeContext';
// import commonStyles from './ContactUsCommon.module.css';
// import lightStyles from './ContactUsLight.module.css';
// import darkStyles from './ContactUsDark.module.css';

// const ContactSection = ({
//   email = "ghulammujtaba0454@gmail.com",
//   phoneNumber = "+92 317 7107849",
//   showCertificationBadge = true
// }) => {
//   const [name, setName] = useState('');
//   const [emailInput, setEmailInput] = useState('');
//   const [message, setMessage] = useState('');
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);
//   const [isSending, setIsSending] = useState(false);
//   const { theme, toggleTheme } = useTheme();

//   const handleNameChange = useCallback((event) => {
//     setName(event.target.value);
//   }, []);

//   const handleEmailChange = useCallback((event) => {
//     setEmailInput(event.target.value);
//   }, []);

//   const handleMessageChange = useCallback((event) => {
//     setMessage(event.target.value);
//   }, []);

//   const validateEmail = useCallback((email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   }, []);

//   const sendEmail = useCallback(async () => {
//     setIsSending(true);

//     try {
//       const result = await emailjs.send(
//         'service_ewji0vl', // Replace with your EmailJS service ID
//         'template_3kv9gje', // Replace with your EmailJS template ID
//         {
//           user_name: name,
//           user_email: emailInput,
//           message: message,
//         },
//         'LFm2JfW5ThGTsvKYr' // Replace with your EmailJS user ID (public key)
//       );

//       console.log('Email sent!', result);
//       setResponse('Message sent successfully!');
//       setName('');
//       setEmailInput('');
//       setMessage('');
//       setError(null);
//     } catch (error) {
//       console.error('Error sending email:', error);
//       setError('Failed to send message.');
//       setResponse(null);
//     } finally {
//       setIsSending(false);
//     }
//   }, [name, emailInput, message]);

//   const handleSubmit = useCallback(async (event) => {
//     event.preventDefault();

//     setError(null);

//     if (!validateEmail(emailInput)) {
//       setError('Please enter a valid email address.');
//       return;
//     }

//     await sendEmail();
//   }, [emailInput, sendEmail, validateEmail]);

//   const handleDarkModeButtonClick = useCallback(() => {
//     toggleTheme();
//   }, [toggleTheme]);

//   const themeStyles = useMemo(() => (theme === 'light' ? lightStyles : darkStyles), [theme]);

//   return (
//     <section className={`${commonStyles.contactSection} ${themeStyles.contactSection}`}>
//       <div className={`${commonStyles.contactFormBackground} ${themeStyles.contactFormBackground}`} />
//       <form
//         className={`${commonStyles.contactForm} ${themeStyles.contactForm}`}
//         onSubmit={handleSubmit}
//         aria-label="Contact form"
//       >
//         <label className={`${commonStyles.nameLabel} ${themeStyles.nameLabel}`} htmlFor="name">Name</label>
//         <input
//           className={`${commonStyles.nameInput} ${themeStyles.nameInput}`}
//           type="text"
//           name="user_name"
//           id="name"
//           placeholder="Name"
//           autocomplete="name"
//           value={name}
//           onChange={handleNameChange}
//           required
//         />
//         <label className={`${commonStyles.emailLabel} ${themeStyles.emailLabel}`} htmlFor="email">Email</label>
//         <input
//           className={`${commonStyles.emailInput} ${themeStyles.emailInput}`}
//           type="email"
//           name="user_email"
//           id="email"
//           placeholder="Email"
//           autocomplete="email"
//           value={emailInput}
//           onChange={handleEmailChange}
//           required
//         />
//         <label className={`${commonStyles.messageLabel} ${themeStyles.messageLabel}`} htmlFor="message">Message</label>
//         <textarea
//           className={`${commonStyles.messageInput} ${themeStyles.messageInput}`}
//           name="message"
//           id="message"
//           placeholder="Message"
//           autocomplete="off"
//           value={message}
//           onChange={handleMessageChange}
//           required
//         ></textarea>
//         <button
//           type="submit"
//           className={`${commonStyles.sendButton} ${themeStyles.sendButton}`}
//           disabled={isSending}
//         >
//           <div className={`${commonStyles.sendButtonBorder} ${themeStyles.sendButtonBorder}`} />
//           <div className={`${commonStyles.sendLabel} ${themeStyles.sendLabel}`}>
//             {isSending ? 'Sending...' : 'SEND'}
//           </div>
//         </button>
//       </form>
//       {error && (
//         <p className={`${commonStyles.message} ${themeStyles.errorMessage}`} role="alert">
//           {error}
//         </p>
//       )}
//       {response && (
//         <p className={`${commonStyles.message} ${themeStyles.successMessage}`} role="status">
//           {response}
//         </p>
//       )}
//       <div className={`${commonStyles.contactDetails} ${themeStyles.contactDetails}`}>
//         <p className={`${commonStyles.contactEmail} ${themeStyles.contactEmail}`}>{email}</p>
//         <div className={`${commonStyles.contactPhoneNo} ${themeStyles.contactPhoneNo}`}>{phoneNumber}</div>
//         <h2 className={`${commonStyles.contactMeDescription} ${themeStyles.contactMeDescription}`}>Contact Me</h2>
//         <div className={`${commonStyles.contactMeLabel} ${themeStyles.contactMeLabel}`}>
//           <p className={`${commonStyles.doYouHave} ${themeStyles.doYouHave}`}>Do you have any project idea?</p>
//           <p className={`${commonStyles.doyouHave} ${themeStyles.doyouHave}`}>Let’s discuss and turn them into reality!</p>
//         </div>
//         <img
//           className={`${commonStyles.emailIcon} ${themeStyles.emailIcon}`}
//           alt="Email"
//           src={theme === 'light' ? "email icon.svg" : "EmailDark.svg"}
//           loading="lazy"
//         />
//         <img
//           className={`${commonStyles.phoneIcon} ${themeStyles.phoneIcon}`}
//           alt="Phone"
//           src={theme === 'light' ? "phone-icon.svg" : "PhoneDark.svg"}
//           loading="lazy"
//         />
//         <button
//           className={`${commonStyles.darkModeButton} ${themeStyles.darkModeButton}`}
//           onClick={handleDarkModeButtonClick}
//           aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
//         >
//           <div className={`${commonStyles.darkModeButtonBorder} ${themeStyles.darkModeButtonBorder}`} />
//           <div className={`${commonStyles.buttonState1} ${themeStyles.buttonState}`} />
//           <div className={`${commonStyles.buttonState} ${themeStyles.buttonState1}`} />
//           <b className={`${commonStyles.darkModeLabel} ${themeStyles.darkModeLabel}`}>
//             {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
//           </b>
//         </button>
//         {showCertificationBadge && (
//           <img
//             className={`${commonStyles.certificationBadgeIcon} ${themeStyles.certificationBadgeIcon}`}
//             alt="UX Certificate"
//             src="ux-certificate.png"
//             loading="lazy"
//           />
//         )}
//       </div>
//     </section>
//   );
// };

// export default ContactSection;
