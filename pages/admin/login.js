import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import styles from "./login.module.css";
import lightStyles from "./login.light.module.css";
import darkStyles from "./login.dark.module.css";
import { useTheme } from "../../context/ThemeContext";
import { authOptions } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import utilities from "../../styles/utilities.module.css";

export default function LoginPage() {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      router.push("/admin"); // Redirect to admin dashboard
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login | Ghulam Mujtaba</title>
      </Head>
      <div className={`${styles.loginContainer} ${themeStyles.loginContainer}`}>
        <div className={`${styles.loginBox} ${themeStyles.loginBox}`}>
          <h1 className={`${styles.title} ${themeStyles.title}`}>Admin Panel</h1>
          <p className={`${styles.subtitle} ${themeStyles.subtitle}`}>
            Please sign in to continue
          </p>
          <form onSubmit={handleSubmit} aria-busy={loading}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={`${styles.label} ${themeStyles.label}`}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className={`${styles.input} ${themeStyles.input}`}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={`${styles.label} ${themeStyles.label}`}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={`${styles.input} ${themeStyles.input}`}
              />
            </div>
            {error && (
              <p className={`${styles.error} ${themeStyles.error}`} role="alert" aria-live="polite">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`${utilities.btn} ${utilities.btnPrimary}`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
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
