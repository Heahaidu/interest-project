"use client";

import React, { createContext, useEffect, useState } from "react";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import api, { authApis } from "@/lib/APIs";
import { Toaster } from 'sonner';
import { UserProfile } from "@/lib/types";
import { INITIAL_USER } from "@/lib/services/mockData";

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  reloadUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
  reloadUser: async () => {},
});

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = getCookie("token");
    if (!token) {
      // setUser(null);
      setUser(INITIAL_USER)
      setLoading(false);
      return;
    }

    try {
      const res = await authApis().get("/secure/profile");
      // debug
      // console.log("AuthProvider.loadUser: profile response:", res?.data);
      setUser(res.data || INITIAL_USER || null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const reloadUser = async () => {
    await loadUser();
  };

  const signIn = async (email: string, password: string) => {
    const res = await api.post("/auth/login", {
      email: email,
      password: password,
    });

    const token = res.data?.token;
    if (!token) throw new Error("No token returned from login");

    // store cookie
    setCookie("token", token, {
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    console.log("AuthProvider.signIn: token set", token);

    // If backend returns user directly in login response, set it immediately
    const maybeUser = res.data?.user || res.data;
    if (maybeUser && (maybeUser.id || maybeUser.email || maybeUser.name)) {
      // if the response looks like a user object, set it
      // If the response is { token, user }, res.data.user will be used
      setUser(res.data.user || null);
      setLoading(false);
      return;
    }

    // fallback: fetch profile using token
    await loadUser();
  };

  const signOut = () => {
    deleteCookie("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, reloadUser }}>
      {children}
      <Toaster />
    </AuthContext.Provider>
  );
};

export default AuthProvider;
