import type { FirebaseOptions } from "firebase/app";

const REQUIRED_KEYS: (keyof FirebaseOptions)[] = ["apiKey", "projectId", "appId"];

let cachedConfig: FirebaseOptions | null = null;

function resolveEnv(key: string, fallback = ""): string {
  const env = (import.meta as any)?.env ?? {};
  const value = env?.[key];
  if (typeof value === "string" && value.length > 0) return value;
  const globalEnv = (globalThis as any)?.__VITE_ENV__?.[key];
  if (typeof globalEnv === "string" && globalEnv.length > 0) return globalEnv;
  return fallback;
}

function buildConfig(): FirebaseOptions {
  return {
    apiKey: resolveEnv("VITE_FIREBASE_API_KEY"),
    authDomain: resolveEnv("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: resolveEnv("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: resolveEnv("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: resolveEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: resolveEnv("VITE_FIREBASE_APP_ID"),
    measurementId: resolveEnv("VITE_FIREBASE_MEASUREMENT_ID") || undefined,
  };
}

export function getFirebaseConfig(): FirebaseOptions {
  if (!cachedConfig) {
    cachedConfig = buildConfig();
  }
  return cachedConfig;
}

export function hasValidFirebaseConfig(): boolean {
  const config = getFirebaseConfig();
  return REQUIRED_KEYS.every((key) => {
    const value = config[key];
    return typeof value === "string" && value.length > 0;
  });
}
