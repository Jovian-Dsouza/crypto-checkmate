import '@/styles/global.css';
import { Manrope, Space_Grotesk, Poppins } from 'next/font/google';

export const metadata = {
  title: 'CryptoKnights',
  description: 'Decentrailized Web3 chess game on Flow network',
};

const manrope = Manrope({
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  subsets: ['latin'],
});

const space_grotesk = Space_Grotesk({
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const poppins = Poppins({
  weight: ['400', '500', '600', '800', '900'],
  variable: "--font-poppins",
  subsets: ['latin'],
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.className} ${space_grotesk.className} ${poppins.className}`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
