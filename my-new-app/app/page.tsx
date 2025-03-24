// app/page.jsx
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button"; // Adjust the import path based on your project structure
import { useUser } from "./context/UserContext"; // Import useUser
import { useRouter } from "next/navigation";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useEffect, useState } from "react";
import { getUserStreak } from "./streak";  // Import icon


export default function Home() {
  const { user, signOut } = useUser();
  const router = useRouter();
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const fetchStreak = async () => {
      if (user) {
        const s = await getUserStreak();
        setStreak(s);
      }
    };

    fetchStreak();
  }, [user]);


  const signOutUser = async () => {
    try {
      await signOut(); // Sign out user
      router.push("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">

      <h1 className="text-4xl font-bold mb-4 text-blue-700 text-center">
        Welcome to the Graph Transformations Tool
      </h1>
      {user && streak !== null && (
        <div className="text-lg text-orange-600 font-semibold mb-2">
          🔥 {streak} login day streak
        </div>
      )}
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
        <Link href="/login" passHref>
          <Button variant="default" className="w-full">
            login
          </Button>
        </Link>
        {user && ( // Only show sign-out button if user is logged in
          <Button
          variant="secondary" // Use a valid variant
          onClick={signOutUser}
          className="w-full bg-red-500 hover:bg-red-700 text-white flex items-center justify-center space-x-2"
        >
          <ExitToAppIcon /> {/* Manually place the icon */}
          <span>Sign Out</span>
        </Button>
        )}
      </div>
    </div>
  );
}
