import { Header } from "@/components/Header";
import { UserProvider } from "./context/UserContext"; // Import UserProvider
import { ReactNode } from 'react';

export const metadata = {
  title: "GraphQuest",
  description: "Graph Transformations Tool",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider> {/* Wrap the entire app */}
          <Header />
          <main className="pt-20">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}