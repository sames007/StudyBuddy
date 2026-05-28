"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function useAuthToken() {
  const { user, loading: authLoading } = useAuth();
  const [idToken, setIdToken] = useState("");
  const [tokenLoading, setTokenLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIdToken("");

    if (!user) {
      setTokenLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setTokenLoading(true);
    user
      .getIdToken()
      .then((token) => {
        if (!cancelled) {
          setIdToken(token);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIdToken("");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTokenLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    user,
    idToken,
    authLoading,
    tokenLoading,
    loading: authLoading || tokenLoading,
  };
}
