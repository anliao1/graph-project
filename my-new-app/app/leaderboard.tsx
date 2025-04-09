import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { firestore } from "./Firebase";

export async function getTopTestStreaks() {
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, orderBy("maxTestStreak", "desc"), limit(5));
    const snapshot = await getDocs(q);
  
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }