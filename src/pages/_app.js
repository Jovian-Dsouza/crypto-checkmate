import Layout from "@/components/Layout";
import "@/styles/global.css";

export default function App({ Component, pageProps }) {
  return (
    <div>
      <title>Crypto Checkmate</title>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
