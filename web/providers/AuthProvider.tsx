"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext<{
  data: any | null;
  status: "loading" | "authenticated" | "unauthenticated";
  update: () => void;
}>({
  data: null,
  status: "loading",
  update: () => {}
});

export function useSession() {
  return useContext(AuthContext);
}

export async function signOut() {
  document.cookie = "accessToken=; path=/; max-age=0";
  document.cookie = "user=; path=/; max-age=0";
  window.location.href = "/";
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const fetchSession = () => {
    try {
      const tokenMatch = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
      const userMatch = document.cookie.match(/(?:^|;\s*)user=([^;]*)/);
      
      if (tokenMatch && userMatch) {
        const token = decodeURIComponent(tokenMatch[1]);
        const user = JSON.parse(decodeURIComponent(userMatch[1]));
        setData({ accessToken: token, user });
        setStatus("authenticated");
      } else {
        setData(null);
        setStatus("unauthenticated");
      }
    } catch {
      setData(null);
      setStatus("unauthenticated");
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ data, status, update: fetchSession }}>
      {children}
    </AuthContext.Provider>
  );
}
