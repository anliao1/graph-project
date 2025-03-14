// app/page.jsx

import Link from "next/link";
import { Button } from "@/components/ui/button"; // Adjust the import path based on your project structure

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      
      <h1 className="text-4xl font-bold mb-4 text-blue-700 text-center">
        Welcome to the Graph Transformations Tool
      </h1>
      <p className="mb-8 text-lg text-center">
        This tool helps you learn and practice graph transformations in algebra.
      </p>
      <div className="flex flex-col space-y-4 w-full max-w-sm">
        <Link href="/practice" passHref>
          <Button variant="default" className="w-full">
            Practice Mode
          </Button>
        </Link>
        <Link href="/test" passHref>
          <Button variant="default" className="w-full">
            Test Mode
          </Button>
        </Link>
      </div>
    </div>
  );
}
