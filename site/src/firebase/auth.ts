import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp, deleteDoc } from "firebase/firestore";
import { auth, db } from "./config";
import {
  getUser,
  createUser,
  getInvitation,
  useInvitation,
  getInvitationByEmail,
} from "./firestore";
import type { User, UserRole } from "./types";

export type AuthUser = FirebaseUser;

const googleProvider = new GoogleAuthProvider();

// Sign in with email and password
export async function signIn(
  email: string,
  password: string,
): Promise<User | null> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const userData = await getUser(userCredential.user.uid);
  return userData;
}

// Sign in with Google (invitation-only for new users)
export async function signInWithGoogle(): Promise<User | null> {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const firebaseUser = userCredential.user;
  const email = firebaseUser.email || "";

  // Check if user document already exists (returning user)
  let userData = await getUser(firebaseUser.uid);

  if (userData) {
    // Existing user - allow login
    return userData;
  }

  // New user - check if they're allowed to register

  // Check if this is the first user (make them admin)
  const adminDoc = await getDoc(doc(db, "config", "admin"));
  const isFirstUser = !adminDoc.exists();

  if (isFirstUser) {
    // First user becomes admin automatically
    const newUser: Omit<User, "id" | "createdAt" | "updatedAt"> = {
      email,
      displayName: firebaseUser.displayName || undefined,
      role: "admin",
    };

    await setDoc(doc(db, "users", firebaseUser.uid), {
      ...newUser,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await setDoc(doc(db, "config", "admin"), {
      userId: firebaseUser.uid,
      createdAt: Timestamp.now(),
    });

    return {
      id: firebaseUser.uid,
      ...newUser,
    } as User;
  }

  // Not first user - check for invitation
  const invitation = await getInvitationByEmail(email);

  if (!invitation) {
    // No invitation found - reject login
    await firebaseSignOut(auth);
    throw new Error(
      "Keine Einladung gefunden. Bitte kontaktiere einen Administrator.",
    );
  }

  // Valid invitation found - create user
  const newUser: Omit<User, "id" | "createdAt" | "updatedAt"> = {
    email,
    displayName: firebaseUser.displayName || undefined,
    role: invitation.role,
    invitedBy: invitation.invitedBy,
  };

  await setDoc(doc(db, "users", firebaseUser.uid), {
    ...newUser,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Mark invitation as used
  if (invitation.id) {
    await useInvitation(invitation.id);
  }

  return {
    id: firebaseUser.uid,
    ...newUser,
  } as User;
}

// Sign out
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// Register with invitation
export async function registerWithInvitation(
  invitationId: string,
  email: string,
  password: string,
  displayName?: string,
): Promise<User> {
  // Verify invitation
  const invitation = await getInvitation(invitationId);
  if (!invitation) {
    throw new Error("Einladung nicht gefunden");
  }
  if (invitation.usedAt) {
    throw new Error("Einladung wurde bereits verwendet");
  }
  if (invitation.email !== email) {
    throw new Error("E-Mail stimmt nicht mit der Einladung überein");
  }
  if (invitation.expiresAt.toDate() < new Date()) {
    throw new Error("Einladung ist abgelaufen");
  }

  // Create Firebase auth user
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  // Create user document
  const userData: Omit<User, "id" | "createdAt" | "updatedAt"> = {
    email,
    displayName,
    role: invitation.role,
    invitedBy: invitation.invitedBy,
  };

  await createUser(userCredential.user.uid, userData);

  // Mark invitation as used
  await useInvitation(invitationId);

  return {
    id: userCredential.user.uid,
    ...userData,
  } as User;
}

// Listen to auth state changes
export function onAuthChange(
  callback: (user: AuthUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): AuthUser | null {
  return auth.currentUser;
}

// Check if user has role
export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

// Check if user is admin
export function isAdmin(user: User | null): boolean {
  return hasRole(user, ["admin"]);
}

// Check if user is trainer or admin
export function isTrainer(user: User | null): boolean {
  return hasRole(user, ["admin", "trainer"]);
}
