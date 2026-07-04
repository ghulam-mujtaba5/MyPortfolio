import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import emailjs from "emailjs-com";
import { useTheme } from "../../context/ThemeContext";
import commonStyles from "./ContactUsCommon.module.css";
import lightStyles from "./ContactUsLight.module.css";
import darkStyles from "./ContactUsDark.module.css";
import animationStyles from "./ContactUsAnimations.module.css";
import intentStyles from "./ContactIntent.module.css";
import { motion } from "framer-motion";
import PlexusCanvas from "../Backgrounds/PlexusCanvas";

const ContactSection = ({
  email = "hello@ghulammujtaba.com",
  // Optional Plexus tuning per page
  plexusMaxNodes = 120,
  plexusMaxDistance = 110,
  plexusSpeed = 1,
  plexusInteraction = "attract",
  plexusIntensity = 1,
  plexusHoverBoost = true,
}) => {
  const [name, setName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [message, setMessage] = useState("");
  // Conversion routing: which path the sender is on
  const [intent, setIntent] = useState(""); // "hire" | "project" | ""
  const [budget, setBudget] = useState("");
  const [roleType, setRoleType] = useState("");
  const [timeline, setTimeline] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [validFields, setValidFields] = useState({
    name: true,
    email: true,
    message: true,
  });
  const { theme } = useTheme();

  const formRef = useRef(null);
  const parallaxRef = useRef(null);

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

  const handleNameChange = useCallback(
    (event) => {
      const value = event.target.value;
      setName(value);
      setValidFields((prev) => ({
        ...prev,
        name: validateName(value),
      }));
    },
    [validateName],
  );

  const handleEmailChange = useCallback(
    (event) => {
      const value = event.target.value;
      setEmailInput(value);
      setValidFields((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    },
    [validateEmail],
  );

  const handleMessageChange = useCallback(
    (event) => {
      const value = event.target.value;
      setMessage(value);
      setValidFields((prev) => ({
        ...prev,
        message: validateMessage(value),
      }));
    },
    [validateMessage],
  );

  const sendEmail = useCallback(async () => {
    setIsSending(true);

    // Qualifying context travels inside the message body so it is visible
    // regardless of the email template's variables.
    const contextLines = [
      intent === "hire" && `Intent: Hire me for a role`,
      intent === "project" && `Intent: Start a project with Megicode`,
      roleType && `Role type: ${roleType}`,
      budget && `Budget: ${budget}`,
      timeline && `Timeline: ${timeline}`,
    ].filter(Boolean);
    const fullMessage =
      contextLines.length > 0
        ? `${contextLines.join("\n")}\n\n${message}`
        : message;

    try {
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE || "service_ewji0vl",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE || "template_3kv9gje",
        {
          user_name: name,
          user_email: emailInput,
          message: fullMessage,
        },
        process.env.NEXT_PUBLIC_EMAILJS_KEY || "LFm2JfW5ThGTsvKYr",
      );

      setResponse("Message sent — I reply within 24–48 hours.");
      setName("");
      setEmailInput("");
      setMessage("");
      setIntent("");
      setBudget("");
      setRoleType("");
      setTimeline("");
      setError(null);
    } catch (error) {
      setError("Failed to send message.");
      setResponse(null);
    } finally {
      setIsSending(false);
    }
  }, [name, emailInput, message, intent, budget, roleType, timeline]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const isNameValid = validateName(name);
      const isEmailValid = validateEmail(emailInput);
      const isMessageValid = validateMessage(message);

      setValidFields({
        name: isNameValid,
        email: isEmailValid,
        message: isMessageValid,
      });

      if (!isNameValid || !isEmailValid || !isMessageValid) {
        setError("Please fill all fields correctly.");
        return;
      }

      setError(null);
      await sendEmail();
    },
    [
      name,
      emailInput,
      message,
      sendEmail,
      validateEmail,
      validateName,
      validateMessage,
    ],
  );

  const themeStyles = useMemo(
    () => (theme === "light" ? lightStyles : darkStyles),
    [theme],
  );

  // Use CSS parallax only; view-based animation handled by Framer Motion's whileInView

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (parallaxRef.current) {
        const { clientX, clientY } = e;
        const moveX = (clientX - window.innerWidth / 2) * 0.01;
        const moveY = (clientY - window.innerHeight / 2) * 0.01;
        parallaxRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      className={`${commonStyles.contactSection} ${themeStyles.contactSection}`}
    >
      <div
        ref={parallaxRef}
        className={`${commonStyles.contactFormBackground} ${themeStyles.contactFormBackground}`}
      >
        <PlexusCanvas
          maxNodes={plexusMaxNodes}
          maxDistance={plexusMaxDistance}
          speed={plexusSpeed}
          interaction={plexusInteraction}
          intensity={plexusIntensity}
          hoverBoost={plexusHoverBoost}
        />
      </div>
      <motion.form
        ref={formRef}
        className={`${commonStyles.contactForm} ${themeStyles.contactForm} ${animationStyles.formWrapper}`}
        onSubmit={handleSubmit}
        aria-label="Contact form"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={intentStyles.intentGroup}
          role="radiogroup"
          aria-label="What is this about?"
        >
          <span className={intentStyles.intentLegend}>What is this about?</span>
          <div className={intentStyles.intentRow}>
            <button
              type="button"
              role="radio"
              aria-checked={intent === "hire"}
              className={`${intentStyles.intentCard} ${intentStyles.intentHire} ${
                intent === "hire" ? intentStyles.intentHireActive : ""
              }`}
              onClick={() => setIntent(intent === "hire" ? "" : "hire")}
            >
              <span className={intentStyles.intentTitle}>
                Hire me for a role
              </span>
              <span className={intentStyles.intentSub}>
                Full-stack · AI/ML · software engineering
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={intent === "project"}
              className={`${intentStyles.intentCard} ${intentStyles.intentProject} ${
                intent === "project" ? intentStyles.intentProjectActive : ""
              }`}
              onClick={() => setIntent(intent === "project" ? "" : "project")}
            >
              <span className={intentStyles.intentTitle}>
                Start a project with Megicode
              </span>
              <span className={intentStyles.intentSub}>
                AI SaaS · platforms · automation · dashboards
              </span>
            </button>
          </div>
        </div>

        {intent && (
          <div className={intentStyles.qualRow}>
            {intent === "hire" ? (
              <div className={intentStyles.qualField}>
                <label className={intentStyles.qualLabel} htmlFor="roleType">
                  Role type
                </label>
                <select
                  id="roleType"
                  className={intentStyles.qualSelect}
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>Full-time — remote</option>
                  <option>Full-time — Lahore / hybrid</option>
                  <option>Contract / part-time</option>
                  <option>Other</option>
                </select>
              </div>
            ) : (
              <div className={intentStyles.qualField}>
                <label className={intentStyles.qualLabel} htmlFor="budget">
                  Budget range
                </label>
                <select
                  id="budget"
                  className={intentStyles.qualSelect}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>Under $1k</option>
                  <option>$1k – $5k</option>
                  <option>$5k – $15k</option>
                  <option>$15k+</option>
                  <option>Not sure yet</option>
                </select>
              </div>
            )}
            <div className={intentStyles.qualField}>
              <label className={intentStyles.qualLabel} htmlFor="timeline">
                Timeline
              </label>
              <select
                id="timeline"
                className={intentStyles.qualSelect}
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              >
                <option value="">Select…</option>
                <option>ASAP</option>
                <option>1–3 months</option>
                <option>Just exploring</option>
              </select>
            </div>
          </div>
        )}

        <label
          className={`${commonStyles.nameLabel} ${themeStyles.nameLabel}`}
          htmlFor="name"
        >
          Name
        </label>
        <input
          className={`${commonStyles.nameInput} ${themeStyles.nameInput} ${animationStyles.inputField}
            ${!validFields.name ? animationStyles.inputInvalid : name ? animationStyles.inputValid : ""}`}
          type="text"
          name="user_name"
          id="name"
          placeholder="Enter your name"
          autoComplete="name"
          value={name}
          onChange={handleNameChange}
          required
        />
        <label
          className={`${commonStyles.emailLabel} ${themeStyles.emailLabel}`}
          htmlFor="email"
        >
          Email
        </label>
        <input
          className={`${commonStyles.emailInput} ${themeStyles.emailInput} ${animationStyles.inputField}
            ${!validFields.email ? animationStyles.inputInvalid : emailInput ? animationStyles.inputValid : ""}`}
          type="email"
          name="user_email"
          id="email"
          placeholder="Enter your email"
          autoComplete="email"
          value={emailInput}
          onChange={handleEmailChange}
          required
        />
        <label
          className={`${commonStyles.messageLabel} ${themeStyles.messageLabel}`}
          htmlFor="message"
        >
          Message
        </label>
        <textarea
          className={`${commonStyles.messageInput} ${themeStyles.messageInput} ${animationStyles.inputField}
            ${!validFields.message ? animationStyles.inputInvalid : message ? animationStyles.inputValid : ""}`}
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
            ${isSending ? animationStyles.sendButtonLoading : ""}`}
          disabled={isSending}
        >
          <div
            className={`${commonStyles.sendButtonBorder} ${themeStyles.sendButtonBorder}`}
          />
          <div className={`${commonStyles.sendLabel} ${themeStyles.sendLabel}`}>
            {isSending ? "Sending..." : "SEND"}
          </div>
        </button>
        <div className={intentStyles.trustRow} aria-hidden="false">
          <span className={intentStyles.trustItem}>
            <span className={intentStyles.trustDot} aria-hidden="true" />
            Available now
          </span>
          <span className={intentStyles.trustItem}>Lahore → global, remote-ready</span>
          <span className={intentStyles.trustItem}>Replies within 24–48h</span>
        </div>
      </motion.form>
      {error && (
        <p
          className={`${commonStyles.message} ${themeStyles.errorMessage} ${animationStyles.errorMessage}`}
          role="alert"
        >
          {error}
        </p>
      )}
      {response && (
        <p
          className={`${commonStyles.message} ${themeStyles.successMessage} ${animationStyles.successMessage}`}
          role="status"
        >
          {response}
        </p>
      )}
      <div
        className={`${commonStyles.contactDetails} ${themeStyles.contactDetails}`}
      >
        <h2
          className={`${commonStyles.contactMeDescription} ${themeStyles.contactMeDescription}`}
        >
          Contact Me
        </h2>
        <div
          className={`${commonStyles.contactMeLabel} ${themeStyles.contactMeLabel}`}
        >
          <p className={`${commonStyles.doYouHave} ${themeStyles.doYouHave}`}>
            Have something serious to build?
          </p>
          <p className={`${commonStyles.doyouHave} ${themeStyles.doyouHave}`}>
            A role, a product, or a system — let&#39;s talk.
          </p>
        </div>
        <div className={commonStyles.emailRow}>
          <img
            className={`${commonStyles.emailIcon} ${themeStyles.emailIcon}`}
            alt=""
            aria-hidden="true"
            src={
              theme === "light"
                ? "/email-icon-on-light.svg"
                : "/email-icon-on-dark.svg"
            }
            loading="lazy"
          />
          <a
            href={`mailto:${email}`}
            className={`${commonStyles.contactEmail} ${themeStyles.contactEmail}`}
            title="Click to email"
            aria-label={`Email ${email}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {email}
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
