import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import type { ContextSource, Message, MessageId } from "../../shared/types";
import { MESSAGE } from "../../shared/types";
import { getAuth } from "./services";

type HookOptions = {
  notifyBackground?: boolean;
  source?: ContextSource;
};

interface HookResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutFromGoogle: () => Promise<void>;
}

const DEFAULT_SOURCE: ContextSource = "panel-ui";

let lastBroadcastUid: string | null = null;
let lastBroadcastStatus: "signed-in" | "signed-out" | null = null;

function broadcastAuthStatus(user: User | null, source: ContextSource) {
  if (typeof chrome === "undefined" || !chrome?.runtime?.sendMessage) {
    return;
  }

  const status = user ? "signed-in" : "signed-out";
  const uid = user?.uid ?? null;
  if (status === lastBroadcastStatus && uid === lastBroadcastUid) {
    return;
  }

  lastBroadcastStatus = status;
  lastBroadcastUid = uid;

  try {
    const envelope: Message = {
      type: MESSAGE.ANALYTICS_AUTH_CHANGED,
      id: (crypto?.randomUUID?.() ?? String(Date.now())) as MessageId,
      source,
      ts: Date.now(),
      payload: {
        status,
        uid: user?.uid,
        email: user?.email ?? undefined,
        displayName: user?.displayName ?? undefined,
        photoURL: user?.photoURL ?? undefined,
      },
    };

    chrome.runtime.sendMessage(envelope, () => {
      const err = chrome.runtime.lastError;
      if (err && !err.message?.includes("Receiving end does not exist")) {
        console.warn("[v0][Firebase] Failed to notify background auth status:", err.message);
      }
    });
  } catch (error) {
    console.warn("[v0][Firebase] Auth broadcast failed:", error);
  }
}

export function useFirebaseUser(options?: HookOptions): HookResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notifyBackground = options?.notifyBackground ?? true;
  const sourceRef = useRef(options?.source ?? DEFAULT_SOURCE);

  useEffect(() => {
    sourceRef.current = options?.source ?? DEFAULT_SOURCE;
  }, [options?.source]);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      setLoading(false);
      setUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      setError(null);
      if (notifyBackground) {
        broadcastAuthStatus(nextUser, sourceRef.current);
      }
    });

    return () => unsubscribe();
  }, [notifyBackground]);

  const signInWithGoogle = async () => {
    const auth = getAuth();
    if (!auth) {
      setError("Firebase Auth não configurado.");
      return;
    }

    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      const message = err?.message ?? "Falha ao autenticar com Google.";
      setError(message);
      console.error("[v0][Firebase] signInWithPopup failed:", err);
      throw err;
    }
  };

  const signOutFromGoogle = async () => {
    const auth = getAuth();
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.error("[v0][Firebase] signOut failed:", err);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOutFromGoogle,
  };
}
