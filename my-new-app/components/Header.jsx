// components/Header.jsx
import { GraphQuestButton } from "@/components/GraphQuestButton";

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full p-4 bg-white shadow">
      <div className="max-w-7xl mx-auto">
        <GraphQuestButton />
      </div>
    </header>
  );
}
