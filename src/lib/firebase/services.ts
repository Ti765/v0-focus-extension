import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth as getFirebaseAuth,
  type Auth,
  browserLocalPersistence,
  setPersistence,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore as getFirebaseFirestore,
  type Firestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getFirebaseConfig, hasValidFirebaseConfig } from "./config";

const env = (import.meta as any)?.env ?? {};
const useEmulators = env?.VITE_FIREBASE_USE_EMULATORS === "true";
const authEmulatorUrl = env?.VITE_FIREBASE_AUTH_EMULATOR_URL || "http://127.0.0.1:9099";
const firestoreEmulatorHost = env?.VITE_FIRESTORE_EMULATOR_HOST || "127.0.0.1";
const parsePort = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const firestoreEmulatorPort = parsePort(env?.VITE_FIRESTORE_EMULATOR_PORT, 8080);

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!hasValidFirebaseConfig()) {
    console.warn("[v0][Firebase] Missing config — skipping initialization");
    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  const existingApp = getApps().find((app) => app.name === "focus-extension");
  if (existingApp) {
    firebaseApp = existingApp;
    return firebaseApp;
  }

  firebaseApp = initializeApp(getFirebaseConfig(), "focus-extension");
  return firebaseApp;
}

export function getAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;

  if (!authInstance) {
    authInstance = getFirebaseAuth(app);
    authInstance.useDeviceLanguage();

    void setPersistence(authInstance, browserLocalPersistence).catch((error) => {
      console.warn("[v0][Firebase] Failed to set auth persistence:", error);
    });

    if (useEmulators) {
      try {
        connectAuthEmulator(authInstance, authEmulatorUrl, { disableWarnings: true });
      } catch (error) {
        console.warn("[v0][Firebase] Failed to connect auth emulator:", error);
      }
    }
  }

  return authInstance;
}

export function getFirestore(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;

  if (!firestoreInstance) {
    firestoreInstance = getFirebaseFirestore(app);
    if (useEmulators) {
      try {
        connectFirestoreEmulator(firestoreInstance, firestoreEmulatorHost, firestoreEmulatorPort);
      } catch (error) {
        console.warn("[v0][Firebase] Failed to connect firestore emulator:", error);
      }
    }
  }

  return firestoreInstance;
}
