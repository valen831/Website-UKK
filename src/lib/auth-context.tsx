"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Profile {
  name: string | null;
  avatar_url: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string) => Promise<boolean>;
  verifyOtp: (email: string, token: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string, userEmail?: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("name, avatar_url, role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return {
      name: userEmail ? userEmail.split("@")[0] : "User",
      avatar_url: null,
      role: "user",
    };
  }
  return {
    ...data,
    role: data.role || "user",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil session awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email).then(setProfile);
      }
      setLoading(false);
    });

    // Subscribe perubahan auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser.email).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Use default browser redirect (no skipBrowserRedirect) to avoid
    // popup-blocker issues caused by async gap before location change.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });
    if (error) throw error;
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    []
  );

  const signUp = useCallback(
    async (email: string, name: string): Promise<boolean> => {
      // Use signInWithOtp with shouldCreateUser: true to send a 6-digit OTP code to real email.
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { full_name: name },
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      // Always return false so the UI prompts the user to enter the 6-digit OTP code sent to their email
      return false;
    },
    []
  );

  const verifyOtp = useCallback(
    async (email: string, token: string, password: string) => {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (error) throw error;

      const { error: passwordError } = await supabase.auth.updateUser({
        password,
      });
      if (passwordError) throw passwordError;
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUp,
        verifyOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
