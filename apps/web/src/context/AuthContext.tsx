import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types';

interface AuthResponse {
  data: any;
  error: AuthError | Error | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  signUpWithPassword: (email: string, password: string, fullName: string) => Promise<AuthResponse>;
  signInWithPassword: (email: string, password: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  role: null,
  isLoading: true,
  signUpWithPassword: async () => ({ data: null, error: null }),
  signInWithPassword: async () => ({ data: null, error: null }),
  signInWithGoogle: async () => ({ data: null, error: null }),
  signOut: async () => {},
  fetchProfile: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }

      if (data) {
        setProfile(data as Profile);
        return data as Profile;
      }
      return null;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          if (isMounted) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUpWithPassword = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const signInWithPassword = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: profile?.role || null,
        isLoading,
        signUpWithPassword,
        signInWithPassword,
        signInWithGoogle,
        signOut,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
