// frontend/pages/_app.tsx
import type { AppProps } from 'next/app';
import '../styles/App.css'; // ✅ global CSS import goes here

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
