// UserContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, firestore } from '../Firebase';
import { doc, setDoc } from 'firebase/firestore';

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  signOut: () => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // ✅ Save displayName to Firestore
        const userRef = doc(firestore, "users", firebaseUser.uid);
        await setDoc(userRef, {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
        }, { merge: true }); // merge so it doesn’t overwrite existing fields like maxTestStreak
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);
  const signOut = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
