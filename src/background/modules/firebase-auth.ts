import { onAuthStateChanged, type User } from "firebase/auth";
import { getAuth } from "../../lib/firebase";

type Listener = (uid: string | null, user: User | null) => void;

let initialized = false;
let currentUser: User | null = null;
const listeners = new Set<Listener>();
let resolveReady: (() => void) | null = null;

const readyPromise = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

export function initializeFirebaseAuthWatcher() {
  if (initialized) return;
  initialized = true;

  const auth = getAuth();
  if (!auth) {
    console.warn("[v0][Firebase] Auth not configured – analytics will remain disabled.");
    resolveReady?.();
    return;
  }

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    resolveReady?.();
    resolveReady = null;
    listeners.forEach((listener) => {
      try {
        listener(user?.uid ?? null, user);
      } catch (error) {
        console.warn("[v0][Firebase] Auth listener error:", error);
      }
    });
  });
}

export function getCurrentUserId(): string | null {
  return currentUser?.uid ?? null;
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function subscribeToAuthChanges(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function waitForAuthReady(): Promise<void> {
  await readyPromise;
}
