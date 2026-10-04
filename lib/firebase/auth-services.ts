import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./client";
import {
  UserProfile,
  CommitteeProfile,
  CommitteeRegisterInput,
  UserRole,
  AccountStatus,
} from "@/types/auth";
import { fileToDataUrl } from "@/lib/utils/image";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Fixed default admin email per Solution.md specification
export const DEFAULT_ADMIN_EMAIL = "admin@carvaan.com";

/**
 * Sign in as Normal User via Google
 */
export async function signInWithGoogleUser(): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const defaultProfile: UserProfile = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "User",
    role: "user",
    status: "active",
    provider: "google.com",
    photoURL: user.photoURL || undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data() as UserProfile;
      if (data.role === "committee") {
        await firebaseSignOut(auth);
        throw new Error("Committee accounts cannot sign in with Google. Please use your email and password.");
      }
      return { user, profile: data };
    }

    // Save profile if database is reachable
    await setDoc(userDocRef, defaultProfile);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Committee accounts cannot sign in")) {
      throw err;
    }
    console.warn(
      "Notice: Cloud Firestore is unreachable or not yet created in Firebase Console. Continuing with authenticated Google user profile.",
      err
    );
  }

  return { user, profile: defaultProfile };
}

/**
 * Sign in as Committee with Email & Password
 */
export async function signInWithCommittee(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser; profile: UserProfile; committee: CommitteeProfile }> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const user = cred.user;

  try {
    // Retrieve user role document
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await firebaseSignOut(auth);
      throw new Error("Account record not found in database. Please register first.");
    }

    const profile = userDoc.data() as UserProfile;

    if (profile.role !== "committee") {
      await firebaseSignOut(auth);
      throw new Error("This account is not registered as a Committee. Please choose Normal User login.");
    }

    // Retrieve committee profile
    const commDocRef = doc(db, "committees", user.uid);
    const commDoc = await getDoc(commDocRef);
    const commData = commDoc.exists() ? (commDoc.data() as CommitteeProfile) : null;

    if (profile.status === "pending") {
      await firebaseSignOut(auth);
      const err = new Error("Your committee application is currently pending admin approval.");
      (err as unknown as { status: AccountStatus }).status = "pending";
      throw err;
    }

    if (profile.status === "rejected") {
      await firebaseSignOut(auth);
      const err = new Error("Your committee registration request was rejected by the administrator.");
      (err as unknown as { status: AccountStatus }).status = "rejected";
      throw err;
    }

    return { user, profile, committee: commData! };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("offline") || (err as { code?: string }).code === "unavailable")
    ) {
      throw new Error(
        "Could not connect to Firestore database. Please ensure Cloud Firestore has been created in your Firebase Console (project: carvaan-7e110)."
      );
    }
    throw err;
  }
}

/**
 * Register a new Committee
 */
export async function registerCommitteeAccount(input: CommitteeRegisterInput): Promise<string> {
  // Step 1: Create Firebase Auth User
  let uid = "";
  try {
    const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
    uid = cred.user.uid;
  } catch (authErr: unknown) {
    if ((authErr as { code?: string }).code === "auth/email-already-in-use") {
      throw new Error("This email address is already registered. Please log in or use a different email.");
    }
    throw authErr;
  }

  // Step 2: Prepare compressed logo Data URL as instant, reliable, CORS-free logo storage
  let logoUrl = "";
  try {
    logoUrl = await fileToDataUrl(input.logoFile);
  } catch {
    logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(input.name)}&background=0064e0&color=fff`;
  }

  // Optional: Only attempt direct Firebase Storage upload if explicitly enabled via environment variable
  if (process.env.NEXT_PUBLIC_ENABLE_STORAGE_UPLOAD === "true") {
    try {
      const storageRef = ref(storage, `committees/${uid}/logo_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, input.logoFile, {
        contentType: input.logoFile.type,
      });
      const gcsUrl = await getDownloadURL(snapshot.ref);
      if (gcsUrl) {
        logoUrl = gcsUrl;
      }
    } catch (storageError) {
      console.warn("Storage upload bypassed:", storageError);
    }
  }

  const now = Date.now();

  // Step 3: Create Committee profile doc with status 'pending'
  const committeeProfile: CommitteeProfile = {
    id: uid,
    name: input.name,
    email: input.email,
    phone: input.phone,
    address: input.address,
    website: input.website || "",
    description: input.description,
    logoUrl,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, "committees", uid), committeeProfile);
  } catch (dbErr) {
    console.warn("Could not write committee document to Firestore:", dbErr);
  }

  // Step 4: Create User Profile doc
  const userProfile: UserProfile = {
    uid,
    email: input.email,
    displayName: input.name,
    role: "committee",
    status: "pending",
    provider: "password",
    photoURL: logoUrl,
    phoneNumber: input.phone,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, "users", uid), userProfile);
  } catch (dbErr) {
    console.warn("Could not write user profile to Firestore:", dbErr);
  }

  // Step 5: Sign out immediately so user cannot access until approved
  await firebaseSignOut(auth);

  return uid;
}

export const DEFAULT_ADMIN_PASSWORD = "Admin@123456";

/**
 * Sign in as Admin
 */
export async function signInAdminUser(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  let user: FirebaseUser;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    user = cred.user;
  } catch (authErr: unknown) {
    const code = (authErr as { code?: string })?.code;
    // If the default admin account has not been registered in Firebase Auth yet, auto-create it!
    if (
      email.toLowerCase().trim() === DEFAULT_ADMIN_EMAIL &&
      (code === "auth/user-not-found" ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-login-credentials")
    ) {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, email, pass);
        user = newCred.user;
      } catch (createErr) {
        throw new Error(
          createErr instanceof Error
            ? createErr.message
            : "Could not initialize default administrator account."
        );
      }
    } else {
      throw new Error(
        authErr instanceof Error
          ? authErr.message
          : "Invalid administrator credentials or unauthorized user."
      );
    }
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const profile = userDoc.data() as UserProfile;
      if (profile.role !== "admin" && user.email !== DEFAULT_ADMIN_EMAIL) {
        await firebaseSignOut(auth);
        throw new Error("Access denied. Admin privileges required.");
      }
      return { user, profile };
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Access denied")) {
      throw err;
    }
    console.warn("Could not check admin document in Firestore:", err);
  }

  // If this matches default admin email, initialize or fallback to admin profile
  if (user.email === DEFAULT_ADMIN_EMAIL) {
    const adminProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: "Carvaan Admin",
      role: "admin",
      status: "active",
      provider: "password",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    try {
      await setDoc(doc(db, "users", user.uid), adminProfile);
    } catch {
      // Ignored if offline
    }
    return { user, profile: adminProfile };
  }

  await firebaseSignOut(auth);
  throw new Error("Access denied. Not an admin account.");
}

/**
 * Admin: Fetch all committee registration applications
 */
export async function fetchAllCommittees(): Promise<CommitteeProfile[]> {
  const q = query(collection(db, "committees"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const committees: CommitteeProfile[] = [];
  snapshot.forEach((docSnap) => {
    committees.push(docSnap.data() as CommitteeProfile);
  });
  return committees;
}

/**
 * Admin: Approve Committee
 */
export async function approveCommitteeApplication(committeeId: string, adminUid: string): Promise<void> {
  const now = Date.now();
  await updateDoc(doc(db, "committees", committeeId), {
    status: "approved",
    reviewedBy: adminUid,
    reviewedAt: now,
    updatedAt: now,
  });

  await updateDoc(doc(db, "users", committeeId), {
    status: "approved",
    updatedAt: now,
  });
}

/**
 * Admin: Reject Committee
 */
export async function rejectCommitteeApplication(
  committeeId: string,
  adminUid: string,
  reason?: string
): Promise<void> {
  const now = Date.now();
  await updateDoc(doc(db, "committees", committeeId), {
    status: "rejected",
    rejectionReason: reason || "Does not meet verification criteria.",
    reviewedBy: adminUid,
    reviewedAt: now,
    updatedAt: now,
  });

  await updateDoc(doc(db, "users", committeeId), {
    status: "rejected",
    updatedAt: now,
  });
}
