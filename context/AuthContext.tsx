"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  UserProfile,
  CommitteeProfile,
  CommitteeRegisterInput,
  AuthContextType,
  AccountStatus,
  UserRole,
} from "@/types/auth";
import {
  signInWithGoogleUser,
  signInWithCommittee,
  signInAdminUser,
  registerCommitteeAccount,
} from "@/lib/firebase/auth-services";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [committeeProfile, setCommitteeProfile] = useState<CommitteeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  const loadUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const uProfile = userSnap.data() as UserProfile;
        setUserProfile(uProfile);

        if (uProfile.role === "committee") {
          try {
            const commSnap = await getDoc(doc(db, "committees", firebaseUser.uid));
            if (commSnap.exists()) {
              setCommitteeProfile(commSnap.data() as CommitteeProfile);
            }
          } catch (commErr) {
            console.warn("Could not load committee profile:", commErr);
          }
        }
      } else {
        // Fallback default profile if doc not in Firestore yet
        const defaultProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "User",
          role: "user",
          status: "active",
          provider:
            firebaseUser.providerData[0]?.providerId === "google.com"
              ? "google.com"
              : "password",
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setUserProfile(defaultProfile);
        setCommitteeProfile(null);
      }
    } catch (err) {
      console.warn(
        "Notice: Could not reach Cloud Firestore. If this is a new project, please ensure Cloud Firestore is enabled in the Firebase Console (project: carvaan-7e110). Using fallback profile.",
        err
      );
      // Fallback so application remains functional and doesn't crash
      const fallbackProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "User",
        role: "user",
        status: "active",
        provider:
          firebaseUser.providerData[0]?.providerId === "google.com"
            ? "google.com"
            : "password",
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setUserProfile(fallbackProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setUserProfile(null);
        setCommitteeProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { user: authedUser, profile } = await signInWithGoogleUser();
      setUser(authedUser);
      setUserProfile(profile);
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (
    email: string,
    pass: string,
    intendedRole: "committee" | "admin"
  ): Promise<{ status: AccountStatus; role: UserRole }> => {
    setLoading(true);
    try {
      if (intendedRole === "admin") {
        const { user: authedUser, profile } = await signInAdminUser(email, pass);
        setUser(authedUser);
        setUserProfile(profile);
        return { status: profile.status, role: profile.role };
      } else {
        const { user: authedUser, profile, committee } = await signInWithCommittee(email, pass);
        setUser(authedUser);
        setUserProfile(profile);
        setCommitteeProfile(committee);
        return { status: profile.status, role: profile.role };
      }
    } finally {
      setLoading(false);
    }
  };

  const registerCommittee = async (input: CommitteeRegisterInput): Promise<void> => {
    setLoading(true);
    try {
      await registerCommitteeAccount(input);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setCommitteeProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        committeeProfile,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerCommittee,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
