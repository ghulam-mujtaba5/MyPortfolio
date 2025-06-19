import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import emailjs from 'emailjs-com';
import { useTheme } from '../../context/ThemeContext';
import commonStyles from './ContactUsCommon.module.css';
import lightStyles from './ContactUsLight.module.css';
import darkStyles from './ContactUsDark.module.css';
import animationStyles from './ContactUsAnimations.module.css';
import { motion, useAnimation } from 'framer-motion';

const ContactSection = ({
  email = "ghulammujtaba0454@gmail.com",
  phoneNumber = "+92 317 7107849"
}) => {
  const [name, setName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [validFields, setValidFields] = useState({
    name: true,
    email: true,
    message: true
  });
  const { theme, toggleTheme } = useTheme();
  
  const formRef = useRef(null);
  const parallaxRef = useRef(null);
  const controls = useAnimation();

  const validateName = useCallback((name) => {
    return name.length >= 2;
  }, []);

  const validateEmail = useCallback((email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }, []);

  const validateMessage = useCallback((message) => {
    return message.length >= 10;
  }, []);

  const handleNameChange = useCallback((event) => {
    const value = event.target.value;
    setName(value);
    setValidFields(prev => ({
      ...prev,
      name: validateName(value)
    }));
  }, [validateName]);

  const handleEmailChange = useCallback((event) => {
    const value = event.target.value;
    setEmailInput(value);
    setValidFields(prev => ({
      ...prev,
      email: validateEmail(value)
    }));
  }, [validateEmail]);

  const handleMessageChange = useCallback((event) => {
    const value = event.target.value;
    setMessage(value);
    setValidFields(prev => ({
      ...prev,
      message: validateMessage(value)
    }));
  }, [validateMessage]);

  const sendEmail = useCallback(async () => {
    setIsSending(true);

    try {
      const result = await emailjs.send(
        'service_ewji0vl',
        'template_3kv9gje',
        {
          user_name: name,
          user_email: emailInput,
          message: message,
        },
        'LFm2JfW5ThGTsvKYr'
      );

      console.log('Email sent!', result);
      setResponse('Message sent successfully!');
      setName('');
      setEmailInput('');
      setMessage('');
      setError(null);
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send message.');
      setResponse(null);
    } finally {
      setIsSending(false);
    }
  }, [name, emailInput, message]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(emailInput);
    const isMessageValid = validateMessage(message);

    setValidFields({
      name: isNameValid,
      email: isEmailValid,
      message: isMessageValid
    });

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      setError('Please fill all fields correctly.');
      return;
    }

    setError(null);
    await sendEmail();
  }, [name, emailInput, message, sendEmail, validateEmail, validateName, validateMessage]);

  const handleDarkModeButtonClick = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const themeStyles = useMemo(() => (theme === 'light' ? lightStyles : darkStyles), [theme]);

  useEffect(() => {
    const handleScroll = () => {
      if (formRef.current) {
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            controls.start({ opacity: 1, y: 0 });
          } else {
            controls.start({ opacity: 0, y: 50 });
          }
        }, { threshold: 0.1 });

        observer.observe(formRef.current);
        return () => observer.disconnect();
      }
    };

    handleScroll();
  }, [controls]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (parallaxRef.current) {
        const { clientX, clientY } = e;
        const moveX = (clientX - window.innerWidth / 2) * 0.01;
        const moveY = (clientY - window.innerHeight / 2) * 0.01;
        parallaxRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className={`${commonStyles.contactSection} ${themeStyles.contactSection}`}>
      <div 
        ref={parallaxRef}
        className={`${commonStyles.contactFormBackground} ${themeStyles.contactFormBackground}`} 
      />
      <motion.form
        ref={formRef}
        className={`${commonStyles.contactForm} ${themeStyles.contactForm} ${animationStyles.formWrapper}`}
        onSubmit={handleSubmit}
        aria-label="Contact form"
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        transition={{ duration: 0.5 }}
      >
        <label className={`${commonStyles.nameLabel} ${themeStyles.nameLabel}`} htmlFor="name">Name</label>
        <input
          className={`${commonStyles.nameInput} ${themeStyles.nameInput} ${animationStyles.inputField}
            ${!validFields.name ? animationStyles.inputInvalid : name ? animationStyles.inputValid : ''}`}
          type="text"
          name="user_name"
          id="name"
          placeholder="Enter your name"
          autoComplete="name"
          value={name}
          onChange={handleNameChange}
          required
        />
        <label className={`${commonStyles.emailLabel} ${themeStyles.emailLabel}`} htmlFor="email">Email</label>
        <input
          className={`${commonStyles.emailInput} ${themeStyles.emailInput} ${animationStyles.inputField}
            ${!validFields.email ? animationStyles.inputInvalid : emailInput ? animationStyles.inputValid : ''}`}
          type="email"
          name="user_email"
          id="email"
          placeholder="Enter your email"
          autoComplete="email"
          value={emailInput}
          onChange={handleEmailChange}
          required
        />
        <label className={`${commonStyles.messageLabel} ${themeStyles.messageLabel}`} htmlFor="message">Message</label>
        <textarea
          className={`${commonStyles.messageInput} ${themeStyles.messageInput} ${animationStyles.inputField}
            ${!validFields.message ? animationStyles.inputInvalid : message ? animationStyles.inputValid : ''}`}
          name="message"
          id="message"
          placeholder="Type your message here..."
          autoComplete="off"
          value={message}
          onChange={handleMessageChange}
          required
        ></textarea>
        <button
          type="submit"
          className={`${commonStyles.sendButton} ${themeStyles.sendButton} 
            ${isSending ? animationStyles.sendButtonLoading : ''}`}
          disabled={isSending}
        >
          <div className={`${commonStyles.sendButtonBorder} ${themeStyles.sendButtonBorder}`} />
          <div className={`${commonStyles.sendLabel} ${themeStyles.sendLabel}`}>
            {isSending ? 'Sending...' : 'SEND'}
          </div>
        </button>
      </motion.form>
      {error && (
        <p className={`${commonStyles.message} ${themeStyles.errorMessage} ${animationStyles.errorMessage}`} role="alert">
          {error}
        </p>
      )}
      {response && (
        <p className={`${commonStyles.message} ${themeStyles.successMessage} ${animationStyles.successMessage}`} role="status">
          {response}
        </p>
      )}
      <div className={`${commonStyles.contactDetails} ${themeStyles.contactDetails}`}>
        <p className={`${commonStyles.contactEmail} ${themeStyles.contactEmail}`}>{email}</p>
        <div className={`${commonStyles.contactPhoneNo} ${themeStyles.contactPhoneNo}`}>{phoneNumber}</div>
        <h2 className={`${commonStyles.contactMeDescription} ${themeStyles.contactMeDescription}`}>Contact Me</h2>
        <div className={`${commonStyles.contactMeLabel} ${themeStyles.contactMeLabel}`}>
          <p className={`${commonStyles.doYouHave} ${themeStyles.doYouHave}`}>Do you have any project idea?</p>
          <p className={`${commonStyles.doyouHave} ${themeStyles.doyouHave}`}>Let's discuss and turn them into reality!</p>
        </div>
        <img
          className={`${commonStyles.emailIcon} ${themeStyles.emailIcon}`}
          alt="Email"
          src={theme === 'light' ? "email icon.svg" : "EmailDark.svg"}
          loading="lazy"
        />
        <img
          className={`${commonStyles.phoneIcon} ${themeStyles.phoneIcon}`}
          alt="Phone"
          src={theme === 'light' ? "phone-icon.svg" : "PhoneDark.svg"}
          loading="lazy"
        />
        <button
          className={`${commonStyles.darkModeButton} ${themeStyles.darkModeButton}`}
          onClick={handleDarkModeButtonClick}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <div className={`${commonStyles.darkModeButtonBorder} ${themeStyles.darkModeButtonBorder}`} />
          <div className={`${commonStyles.buttonState1} ${themeStyles.buttonState}`} />
          <div className={`${commonStyles.buttonState} ${themeStyles.buttonState1}`} />
          <b className={`${commonStyles.darkModeLabel} ${themeStyles.darkModeLabel}`}>
            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </b>
        </button>
      </div>
    </section>
  );
};

export default ContactSection;