import type { Metadata } from "next";
import { Figtree } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner"

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Deepfake Detector",
  description: "Proteja-se de contéudos manipulados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt'PT">
      <body
        className={`${figtree.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          <Toaster position="top-right" richColors/>
        </ThemeProvider>
      </body>
    </html>
  );
}
