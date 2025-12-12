import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'Multi-tenant Tasks',
  description: 'Simple tasks app with multi-tenancy'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <Header />
        <div className="container">{children}</div>
      </body>
    </html>
  );
}


