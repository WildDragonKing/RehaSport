import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { getAuth } from "./firebase";

type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; user: User };

// Minimaler Auth-Hook fuer das Public-Frontend.
// Lauscht auf Firebase Auth State und liefert den aktuellen User.
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setState({ status: "signed-in", user });
      } else {
        setState({ status: "signed-out" });
      }
    });

    return unsubscribe;
  }, []);

  return state;
}
