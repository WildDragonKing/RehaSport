import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Session,
  Exercise,
  Group,
  Draft,
  User,
  Invitation,
} from "./types";

// Collection references
const sessionsRef = collection(db, "sessions");
const exercisesRef = collection(db, "exercises");
const groupsRef = collection(db, "groups");
const draftsRef = collection(db, "drafts");
const usersRef = collection(db, "users");
const invitationsRef = collection(db, "invitations");

// Helper: Add timestamps
const withTimestamps = <T extends object>(data: T, isNew = true) => ({
  ...data,
  updatedAt: Timestamp.now(),
  ...(isNew ? { createdAt: Timestamp.now() } : {}),
});

// ============ SESSIONS ============

export async function getSessions(onlyPublished = true): Promise<Session[]> {
  const constraints: QueryConstraint[] = [orderBy("title")];
  if (onlyPublished) {
    constraints.unshift(where("status", "==", "published"));
  }
  const q = query(sessionsRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Session);
}

export async function getSessionsByCategory(
  category: string,
): Promise<Session[]> {
  const q = query(
    sessionsRef,
    where("category", "==", category),
    where("status", "==", "published"),
    orderBy("title"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Session);
}

export async function getSession(id: string): Promise<Session | null> {
  const docSnap = await getDoc(doc(sessionsRef, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Session;
}

export async function createSession(
  data: Omit<Session, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const docRef = await addDoc(sessionsRef, withTimestamps(data));
  return docRef.id;
}

export async function updateSession(
  id: string,
  data: Partial<Session>,
): Promise<void> {
  await updateDoc(doc(sessionsRef, id), withTimestamps(data, false));
}

export async function deleteSession(id: string): Promise<void> {
  await deleteDoc(doc(sessionsRef, id));
}

// ============ EXERCISES ============

export async function getExercises(): Promise<Exercise[]> {
  const q = query(exercisesRef, orderBy("title"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Exercise,
  );
}

export async function getExerciseBySlug(
  slug: string,
): Promise<Exercise | null> {
  const q = query(exercisesRef, where("slug", "==", slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Exercise;
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const docSnap = await getDoc(doc(exercisesRef, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Exercise;
}

export async function createExercise(
  data: Omit<Exercise, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const docRef = await addDoc(exercisesRef, withTimestamps(data));
  return docRef.id;
}

export async function updateExercise(
  id: string,
  data: Partial<Exercise>,
): Promise<void> {
  await updateDoc(doc(exercisesRef, id), withTimestamps(data, false));
}

export async function deleteExercise(id: string): Promise<void> {
  await deleteDoc(doc(exercisesRef, id));
}

// ============ GROUPS ============

export async function getGroups(userId?: string): Promise<Group[]> {
  let q;
  if (userId) {
    q = query(groupsRef, where("createdBy", "==", userId), orderBy("name"));
  } else {
    q = query(groupsRef, orderBy("name"));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Group);
}

export async function getGroup(id: string): Promise<Group | null> {
  const docSnap = await getDoc(doc(groupsRef, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Group;
}

export async function createGroup(
  data: Omit<Group, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const docRef = await addDoc(groupsRef, withTimestamps(data));
  return docRef.id;
}

export async function updateGroup(
  id: string,
  data: Partial<Group>,
): Promise<void> {
  await updateDoc(doc(groupsRef, id), withTimestamps(data, false));
}

export async function deleteGroup(id: string): Promise<void> {
  await deleteDoc(doc(groupsRef, id));
}

// ============ DRAFTS ============

export async function getDrafts(
  userId?: string,
  status?: Draft["status"],
): Promise<Draft[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (userId) {
    constraints.unshift(where("createdBy", "==", userId));
  }
  if (status) {
    constraints.unshift(where("status", "==", status));
  }
  const q = query(draftsRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Draft);
}

export async function getDraft(id: string): Promise<Draft | null> {
  const docSnap = await getDoc(doc(draftsRef, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Draft;
}

export async function createDraft(
  data: Omit<Draft, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const docRef = await addDoc(draftsRef, withTimestamps(data));
  return docRef.id;
}

export async function updateDraft(
  id: string,
  data: Partial<Draft>,
): Promise<void> {
  await updateDoc(doc(draftsRef, id), withTimestamps(data, false));
}

export async function approveDraft(
  draftId: string,
  adminUserId: string,
): Promise<string> {
  const draft = await getDraft(draftId);
  if (!draft) throw new Error("Entwurf nicht gefunden");

  // Create session from draft
  const sessionData: Omit<Session, "id" | "createdAt" | "updatedAt"> = {
    title: draft.title,
    description: draft.description,
    duration: draft.duration,
    focus: draft.focus,
    category: draft.category,
    phases: draft.phases,
    status: "published",
    createdBy: draft.createdBy,
    createdVia: "ai",
  };

  const sessionId = await createSession(sessionData);

  // Update draft status
  await updateDraft(draftId, {
    status: "approved",
    approvedBy: adminUserId,
  });

  return sessionId;
}

export async function rejectDraft(
  draftId: string,
  adminUserId: string,
): Promise<void> {
  await updateDraft(draftId, {
    status: "rejected",
    approvedBy: adminUserId,
  });
}

export async function deleteDraft(id: string): Promise<void> {
  await deleteDoc(doc(draftsRef, id));
}

// ============ USERS ============

export async function getUser(id: string): Promise<User | null> {
  const docSnap = await getDoc(doc(usersRef, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as User;
}

export async function createUser(
  id: string,
  data: Omit<User, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  const docRef = doc(usersRef, id);
  await updateDoc(docRef, withTimestamps(data)).catch(() => {
    // Document doesn't exist, create it
    return addDoc(collection(db, "users"), { ...withTimestamps(data), id });
  });
}

export async function updateUser(
  id: string,
  data: Partial<User>,
): Promise<void> {
  await updateDoc(doc(usersRef, id), withTimestamps(data, false));
}

export async function getTrainers(): Promise<User[]> {
  const q = query(
    usersRef,
    where("role", "in", ["admin", "trainer"]),
    orderBy("email"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User);
}

// ============ INVITATIONS ============

export async function createInvitation(
  data: Omit<Invitation, "id" | "createdAt">,
): Promise<string> {
  const docRef = await addDoc(invitationsRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getInvitation(id: string): Promise<Invitation | null> {
  const docSnap = await getDoc(doc(invitationsRef, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Invitation;
}

export async function useInvitation(id: string): Promise<void> {
  await updateDoc(doc(invitationsRef, id), {
    usedAt: Timestamp.now(),
  });
}

export async function getPendingInvitations(): Promise<Invitation[]> {
  const q = query(
    invitationsRef,
    where("usedAt", "==", null),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Invitation,
  );
}

export async function getInvitationByEmail(
  email: string,
): Promise<Invitation | null> {
  const q = query(
    invitationsRef,
    where("email", "==", email),
    where("usedAt", "==", null),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  // Return the first valid (not expired) invitation
  for (const docSnap of snapshot.docs) {
    const invitation = { id: docSnap.id, ...docSnap.data() } as Invitation;
    if (invitation.expiresAt.toDate() > new Date()) {
      return invitation;
    }
  }
  return null;
}
