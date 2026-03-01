import SessionProvider from './components/SessionProvider';
import './globals.css';

export const metadata = {
  title: 'MDLooker - Global Medical Device Compliance Intelligence Platform',
  description: 'Your Strategic Partner for Market Access. Navigate FDA, NMPA, EUDAMED and global medical device regulations. Comprehensive compliance intelligence for medical device manufacturers.',
  keywords: 'medical device compliance, FDA registration, NMPA, EUDAMED, market access, regulatory intelligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
