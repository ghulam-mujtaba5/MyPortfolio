// export default MyApp;
import { Fragment } from "react";
import Head from "next/head";
import { ThemeProvider } from '../context/ThemeContext';
import './global.css'

function MyApp({ Component, pageProps }) {
  return (
    <Fragment>
      <Head>
        <title>Portfolio</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </Fragment>
  );
}

export default MyApp;
