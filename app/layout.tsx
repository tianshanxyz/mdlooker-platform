import SessionProvider from './components/SessionProvider';
import './globals.css';

export const metadata = {
  title: 'MDLooker Platform',
  description: 'Global Medical Device Compliance Intelligence',
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
