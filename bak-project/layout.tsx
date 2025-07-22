import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from './providers/ThemeProvider';

export const metadata: Metadata = {
  title: "Rtfm2Win ",
  description: "Quizz de RTFM2WIN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}