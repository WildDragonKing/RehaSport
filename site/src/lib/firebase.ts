import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";
import { getAuth as firebaseGetAuth, type Auth } from "firebase/auth";

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

type EnvMap = Record<string, string | undefined>;

function readEnv(primaryKey: string, fallbackKey?: string): string | undefined {
  const env = import.meta.env as EnvMap;
  const primary = env[primaryKey];
  if (primary && primary.length > 0) {
    return primary;
  }
  if (!fallbackKey) {
    return undefined;
  }
  const fallback = env[fallbackKey];
  return fallback && fallback.length > 0 ? fallback : undefined;
}

function getConfig(): FirebaseOptions {
  const apiKey = readEnv("PUBLIC_FIREBASE_API_KEY", "VITE_FIREBASE_API_KEY");
  const authDomain = readEnv(
    "PUBLIC_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_AUTH_DOMAIN",
  );
  const projectId = readEnv(
    "PUBLIC_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_PROJECT_ID",
  );
  const storageBucket = readEnv(
    "PUBLIC_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_STORAGE_BUCKET",
  );
  const messagingSenderId = readEnv(
    "PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
  );
  const appId = readEnv("PUBLIC_FIREBASE_APP_ID", "VITE_FIREBASE_APP_ID");
  const measurementId = readEnv(
    "PUBLIC_FIREBASE_MEASUREMENT_ID",
    "VITE_FIREBASE_MEASUREMENT_ID",
  );

  const missing: string[] = [];
  if (!apiKey) missing.push("PUBLIC_FIREBASE_API_KEY");
  if (!authDomain) missing.push("PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!projectId) missing.push("PUBLIC_FIREBASE_PROJECT_ID");
  if (!storageBucket) missing.push("PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!messagingSenderId) missing.push("PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!appId) missing.push("PUBLIC_FIREBASE_APP_ID");

  if (missing.length > 0) {
    throw new Error(
      `Firebase ist nicht konfiguriert. Fehlende Variablen: ${missing.join(", ")}`,
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };
}

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(getConfig());
  }
  return appInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) {
    const app = getFirebaseApp();
    try {
      dbInstance = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
      });
    } catch {
      dbInstance = getFirestore(app);
    }
  }
  return dbInstance;
}

export function getAuth(): Auth {
  if (!authInstance) {
    authInstance = firebaseGetAuth(getFirebaseApp());
  }
  return authInstance;
}

export function resetFirebaseForTests(): void {
  appInstance = null;
  dbInstance = null;
  authInstance = null;
}
