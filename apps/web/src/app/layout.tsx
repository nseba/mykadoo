import '@mykadoo/design-system';
import './global.css';

export const metadata = {
  title: 'Mykadoo - AI-Powered Gift Search Engine',
  description: 'Find the perfect gift with AI-powered personalized recommendations. Discover thoughtful presents for every occasion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
