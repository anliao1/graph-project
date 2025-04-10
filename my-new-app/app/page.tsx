'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "./context/UserContext";
import { useRouter } from "next/navigation";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useEffect, useState } from "react";
import { getUserStreak } from "./streak";
import { getTopTestStreaks } from "./leaderboard";

export default function Home() {
  const { user, signOut } = useUser();
  const router = useRouter();
  const [streak, setStreak] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchStreak = async () => {
      if (user) {
        const s = await getUserStreak();
        setStreak(s);
      }
    };
    fetchStreak();
    const fetchLeaderboard = async () => {
      const topUsers = await getTopTestStreaks();
      setLeaderboard(topUsers);
    };

    fetchStreak();
    fetchLeaderboard();
  }, [user]);

  const signOutUser = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/images/index-background.webp')" }}
    >
      <ul className="mt-2 w-full max-w-sm bg-white shadow-lg rounded-xl p-4">
        {leaderboard.map((user, index) => (
          <li key={user.id} className="flex justify-between py-2 border-b last:border-none">
            <span className="font-medium text-gray-800">{index + 1}. {user.displayName || "Anonymous"}</span>
            <span className="text-orange-600 font-semibold">{user.maxTestStreak}</span>
          </li>
        ))}
      </ul>
      <div className="w-full max-w-xl bg-white/70 rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-700 tracking-tight">
            Graph Transformations
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Dive into the world of mathematical graphs and unlock your problem-solving potential!
          </p>
        </div>

        {/* Streak Display */}
        {user && streak !== null && (
          <div className="text-center">
            <div className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full shadow-md">
              🔥 Current Streak: {streak} Days
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/practice" className="block">
            <Button
              variant="outline"
              className="w-full h-40 border-2 border-green-400 hover:bg-green-50 flex flex-col justify-center items-center space-y-2 text-green-700 hover:text-green-800"
            >
              <div className="text-4xl">🧩</div>
              <span className="text-xl font-semibold">Practice Mode</span>
              <span className="text-sm text-gray-500">Learn at your own pace</span>
            </Button>
          </Link>

          <Link href="/test" className="block">
            <Button
              variant="outline"
              className="w-full h-40 border-2 border-blue-400 hover:bg-blue-50 flex flex-col justify-center items-center space-y-2 text-blue-700 hover:text-blue-800"
            >
              <div className="text-4xl">📊</div>
              <span className="text-xl font-semibold">Test Mode</span>
              <span className="text-sm text-gray-500">Challenge yourself</span>
            </Button>
          </Link>
        </div>

        {/* Authentication Buttons */}
        <div className="space-y-4">
          {!user ? (
            <Link href="/login" className="block">
              <Button
                variant="default"
                className="w-full h-16 bg-purple-600 hover:bg-purple-700 flex items-center justify-center space-x-2"
              >
                <span className="text-lg">Log In / Sign Up</span>
              </Button>
            </Link>
          ) : (
            <Button
              variant="destructive"
              onClick={signOutUser}
              className="w-full h-16 bg-red-500 hover:bg-red-600 flex items-center justify-center space-x-2"
            >
              <ExitToAppIcon />
              <span className="text-lg">Sign Out</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
