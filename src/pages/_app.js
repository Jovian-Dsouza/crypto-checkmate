import '@/styles/global.css';

export default function App({ Component, pageProps }) {
  return (
    <div className="h-screen">
      <title>Crypto Checkmate</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Mulish:ital@0;1&display=swap"
        rel="stylesheet"
      />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500&display=swap" rel="stylesheet" />
      <Component {...pageProps} />
    </div>
  );
}
