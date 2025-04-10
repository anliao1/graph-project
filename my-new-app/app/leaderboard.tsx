'use client';
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { firestore } from "./Firebase";

interface LeaderboardUser {
    id: string;
    displayName?: string;
    maxTestStreak?: number;
  }

  export const getTopTestStreaks = async (): Promise<LeaderboardUser[]> => {
    const q = query(
      collection(firestore, 'users'),
      orderBy('maxTestStreak', 'desc'),
      limit(10)
    );
  
    const snapshot = await getDocs(q);
  
    const results: LeaderboardUser[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName,
          maxTestStreak: data.maxTestStreak,
        } as LeaderboardUser;
      })
      .filter((u) => typeof u.maxTestStreak === 'number');
  
    return results.slice(0, 5);
  };