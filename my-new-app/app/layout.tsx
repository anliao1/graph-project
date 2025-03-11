// app/layout.jsx
import { Header } from "@/components/Header";

export const metadata = {
  title: "GraphQuest",
  description: "Graph Transformations Tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
