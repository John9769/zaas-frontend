import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ZAAS — Turn Your Photos Into Cinematic Videos',
  description: 'Upload up to 10 photos and get a stunning cinematic video in minutes. Perfect for memories, celebrations and businesses. From RM12.99 only.',
  keywords: 'AI video, photo to video, cinematic video, Malaysia, wedding video, product video',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}