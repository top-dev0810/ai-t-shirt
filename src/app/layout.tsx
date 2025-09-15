import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ClientWrapper from "@/components/ClientWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI T-Shirt Designer - Create Custom Designs with AI",
  description: "Design your own custom T-shirts using AI-powered chat interface. Choose from various styles, colors, and sizes. Order online with secure payment.",
  keywords: "AI T-shirt designer, custom t-shirts, AI art generator, personalized clothing, online t-shirt maker",
  authors: [{ name: "AI T-Shirt Designer" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <ClientWrapper>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {children}
              </div>
            </ClientWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
