import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./login.premium.module.css";
import { authOptions } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { useTheme } from "../../context/ThemeContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    if (router.query.error) {
      setError("Invalid login credentials. Please try again.");
    }
  }, [router.query.error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      const callbackUrl = router.query?.callbackUrl;
      const destination = callbackUrl ? decodeURIComponent(callbackUrl) : "/admin";
      router.push(destination);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login | Ghulam Mujtaba</title>
      </Head>
      <motion.div 
        className={`${styles.loginContainer}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative floating orbs */}
        <div className={styles.orbContainer} aria-hidden="true">
          <motion.div 
            className={`${styles.orb} ${styles.orb1}`}
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className={`${styles.orb} ${styles.orb2}`}
            animate={{ y: [0, 15, 0], x: [0, -12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className={`${styles.orb} ${styles.orb3}`}
            animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div 
          className={`${styles.loginBox}`}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className={styles.logoWrapper}>
            <img
              src={theme === 'dark' ? '/gmVectorDark.svg' : '/gmVector.svg'}
              alt="GM Logo"
              width={36}
              height={36}
              className={styles.logoImg}
            />
          </div>
          <motion.h1 
            className={`${styles.title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            className={`${styles.subtitle}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            Sign in to your admin panel
          </motion.p>
          <motion.form 
            onSubmit={handleSubmit} 
            aria-busy={loading}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={`${styles.label}`}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="you@example.com"
                  className={`${styles.input} ${styles.inputWithIcon}`}
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={`${styles.label}`}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`${styles.input} ${styles.inputWithIcon}`}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {error && (
                <motion.div 
                  className={`${styles.error}`} 
                  role="alert" 
                  aria-live="polite"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              type="submit"
              disabled={loading}
              className={`${styles.loginButton}`}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className={styles.loadingState}>
                  <svg className={styles.spinner} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                  </svg>
                  Signing In...
                </span>
              ) : "Sign In"}
            </motion.button>
          </motion.form>
        </motion.div>

        <motion.p 
          className={styles.loginFooter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Ghulam Mujtaba &middot; Admin Portal
        </motion.p>
      </motion.div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/admin",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
