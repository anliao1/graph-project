import "./globals.css"; // Import your global styles
import { Header } from "@/components/Header";
import { UserProvider } from "./context/UserContext";
import { ReactNode } from "react";

export const metadata = {
  title: "GraphQuest",
  description: "Graph Transformations Tool",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <Header />
          <main className="pt-20">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
