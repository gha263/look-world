import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";

export const metadata: Metadata = {
  title: "Look World — Studio",
  description: "Internal tool for Look World",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#212121" }}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
