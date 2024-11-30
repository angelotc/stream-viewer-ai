import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { Header } from '../ui/header';
import { Footer } from '../ui/footer';
import { Sidebar } from '../ui/sidebar';

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
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:pl-[280px]">
            <Header />
            <main className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
