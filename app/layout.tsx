import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { Header } from '../ui/header';
import { Footer } from '../ui/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Stream Viewer AI',
  description: 'Real-time streaming with AI capabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
