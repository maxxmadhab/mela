import React, { createContext, useContext, useState } from 'react';
import { Profile, UserRole } from '../types';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  isLoading: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading] = useState(false);

  const signOut = async () => {
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || null,
        isLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
