import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Devify Labs | Client Acquisition & Audit Portal',
  description: 'Automated website audits, lead discovery, and pitch generator for Devify Labs team',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
