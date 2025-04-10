import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, firestore } from "./Firebase";
import { format, differenceInCalendarDays } from "date-fns";

export const updateStreak = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(firestore, "users", user.uid);
  const userSnap = await getDoc(userRef);

  const today = format(new Date(), "yyyy-MM-dd");

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      lastLogin: today,
      streak: 1,
    });
    return;
  }

  const userData = userSnap.data();
  const lastLogin = userData.lastLogin;
  const streak = userData.streak || 1;

  const daysSinceLastLogin = differenceInCalendarDays(
    new Date(today),
    new Date(lastLogin)
  );

  if (daysSinceLastLogin === 1) {
    await updateDoc(userRef, {
      lastLogin: today,
      streak: streak + 1,
    });
  } else if (daysSinceLastLogin > 1) {
    await updateDoc(userRef, {
      lastLogin: today,
      streak: 1,
    });
  } else if (daysSinceLastLogin === 0 && userData.streak === undefined) {
    // Do nothing, user logged in today
    if(!userData.streak) {
      await updateDoc(userRef, {
        lastLogin: today,
        streak: 1,
      });
    }

  }
};
export const getUserStreak = async (): Promise<number | null> => {
    const user = auth.currentUser;
    if (!user) return null;
  
    const userRef = doc(firestore, "users", user.uid);
    const userSnap = await getDoc(userRef);
  
    if (userSnap.exists()) {
      const data = userSnap.data();
      return typeof data.streak === "number" ? data.streak : 1;
    }
  
    return null;
  };