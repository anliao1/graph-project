// components/GraphQuestButton.jsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GraphQuestButton() {
  return (
    <Link href="/" passHref>
      <Button className="flex items-center">
        {/* Make sure to place your custom logo in the public folder, e.g., public/logo.png */}
        <Image
          src="/images/graphlogo.jpg"
          alt="GraphQuest Logo"
          width={24}
          height={24}
          className="mr-2"
        />
        GraphQuest
      </Button>
    </Link>
  );
}
